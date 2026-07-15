/**
 * useUploadQueue.js
 * ─────────────────────────────────────────────────────────────
 * Custom hook that implements the distributed upload flow:
 *
 *   1. Batch presign  → POST /api/storage/presign (one call, N tokens back)
 *   2. Direct upload  → PUT /api/storage/upload/:token per file
 *                       (simulates "client uploads directly to S3")
 *   3. Socket.io      → listens for `candidate:processed` events
 *                       from the API server (which the worker triggers)
 *   4. State          → exposes { queued, processing, done, failed, progress }
 *
 * Usage:
 *   const { startUpload, progress, done, total, isUploading, liveResults } = useUploadQueue(roleId);
 *   startUpload(fileArray);
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useUploadQueue(roleId) {
  const [total, setTotal] = useState(0);
  const [uploaded, setUploaded] = useState(0);   // files sent to storage
  const [processed, setProcessed] = useState(0); // resumes fully parsed by worker
  const [failed, setFailed] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [liveResults, setLiveResults] = useState([]); // candidates as they finish
  const [uploadError, setUploadError] = useState(null);

  const socketRef = useRef(null);
  const tokenRef = useRef(localStorage.getItem('token'));

  // ── Socket.io connection — joins role room, listens for events ──
  useEffect(() => {
    if (!roleId) return;

    const socket = io(API_BASE, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-role', roleId);
      console.log(`🔌 [Queue] Joined Socket.io room: role:${roleId}`);
    });

    // Worker fires this for every completed resume
    socket.on('candidate:processed', (data) => {
      setProcessed((n) => n + 1);
      setLiveResults((prev) => [data, ...prev].slice(0, 200)); // keep last 200
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roleId]);

  // ── Main upload function ──────────────────────────────────────
  const startUpload = useCallback(async (files) => {
    if (!files.length || !roleId) return;

    setIsUploading(true);
    setUploadError(null);
    setTotal(files.length);
    setUploaded(0);
    setProcessed(0);
    setFailed(0);
    setLiveResults([]);

    try {
      // Step 1: Batch presign — get one token per file in a single request
      const { data } = await axios.post(
        `${API_BASE}/api/storage/presign`,
        { roleId, files: files.map((f) => ({ name: f.name, size: f.size })) },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } },
      );

      const tokens = data.tokens; // [{ token, uploadUrl, filename }]

      // Step 2: Upload all files concurrently in batches of 10
      // (simulates client uploading directly to S3 in parallel)
      const BATCH_SIZE = 10;
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batch = tokens.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async ({ token, uploadUrl }, batchIdx) => {
            const file = files[i + batchIdx];
            const form = new FormData();
            form.append('file', file);
            try {
              await axios.put(`${API_BASE}${uploadUrl}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              setUploaded((n) => n + 1);
            } catch (e) {
              setFailed((n) => n + 1);
              console.error(`Failed to upload ${file?.name}:`, e.message);
            }
          }),
        );
      }

      console.log(`✅ [Queue] All ${files.length} files uploaded. Worker processing in background...`);
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message);
    } finally {
      setIsUploading(false);
    }
  }, [roleId]);

  const reset = useCallback(() => {
    setTotal(0);
    setUploaded(0);
    setProcessed(0);
    setFailed(0);
    setLiveResults([]);
    setUploadError(null);
    setIsUploading(false);
  }, []);

  // Upload progress (0–100): split into two phases
  // Phase 1 (0–50%): transferring files to server storage
  // Phase 2 (50–100%): worker processing resumes
  const uploadProgress = total > 0 ? Math.round((uploaded / total) * 50) : 0;
  const processProgress = total > 0 ? Math.round((processed / total) * 50) : 0;
  const overallProgress = Math.min(uploadProgress + processProgress, 100);

  return {
    startUpload,
    reset,
    total,
    uploaded,
    processed,
    failed,
    isUploading,
    isProcessing: uploaded > 0 && processed < uploaded,
    overallProgress,
    liveResults,
    uploadError,
    isDone: total > 0 && processed >= total && !isUploading,
  };
}

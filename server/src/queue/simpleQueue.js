/**
 * simpleQueue.js — Lightweight in-memory async job queue
 * ───────────────────────────────────────────────────────────────
 * Replaces BullMQ + ioredis-mock for local development.
 * Same interface as BullMQ from the caller's perspective.
 *
 * Supports:
 *  - enqueue(jobName, data) → processes inline (no separate process needed)
 *  - concurrency: N jobs run in parallel
 *  - retry on failure (up to 3 times)
 *  - event callbacks: onJob, onDone, onFail
 *
 * For production: swap this out for real BullMQ + Redis.
 */

const EventEmitter = require('events');

class SimpleQueue extends EventEmitter {
  constructor(name, { concurrency = 4, maxRetries = 3 } = {}) {
    super();
    this.name = name;
    this.concurrency = concurrency;
    this.maxRetries = maxRetries;
    this._queue = [];
    this._active = 0;
    this._handlers = [];
  }

  /**
   * Register a job processor function.
   * fn(job) should return a Promise.
   */
  process(fn) {
    this._handlers.push(fn);
  }

  /**
   * Enqueue a job. Returns immediately.
   * The processor runs asynchronously.
   */
  add(name, data) {
    const job = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, data, attempts: 0 };
    this._queue.push(job);
    setImmediate(() => this._tick());
    return Promise.resolve(job);
  }

  async _tick() {
    if (this._active >= this.concurrency || this._queue.length === 0 || this._handlers.length === 0) return;

    const job = this._queue.shift();
    this._active++;

    const fn = this._handlers[0];

    const tryJob = async (attempt) => {
      try {
        const result = await fn(job);
        this.emit('completed', job, result);
      } catch (err) {
        job.attempts++;
        if (job.attempts < this.maxRetries) {
          const delay = Math.pow(2, job.attempts) * 500;
          setTimeout(() => tryJob(job.attempts), delay);
          return;
        }
        this.emit('failed', job, err);
        console.error(`[Queue:${this.name}] Job ${job.id} failed after ${job.attempts} attempts: ${err.message}`);
      } finally {
        if (job.attempts >= this.maxRetries || this._active > 0) {
          this._active--;
          this._tick(); // process next
        }
      }
    };

    tryJob(0);
  }

  getStats() {
    return {
      waiting: this._queue.length,
      active: this._active,
      name: this.name,
    };
  }
}

// ── Singleton queues shared across the process ─────────────────
const queues = {};

function getQueue(name, opts = {}) {
  if (!queues[name]) queues[name] = new SimpleQueue(name, opts);
  return queues[name];
}

module.exports = { SimpleQueue, getQueue };

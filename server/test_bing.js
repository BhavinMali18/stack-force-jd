const https = require('https');
const q = encodeURIComponent('site:linkedin.com/in "react developer"');
const url = 'https://www.bing.com/search?q=' + q;

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Bing usually encapsulates search results in <li class="b_algo">...
    // Let's just find linkedin URLs
    const matches = [...data.matchAll(/href="([^"]*linkedin\.com\/in\/[^"]+)"[^>]*>([^<]+)<\/a>/g)];
    console.log('Matches:', matches.length);
    if(matches.length > 0) {
      console.log(matches[0][1]);
      console.log(matches[0][2].replace(/<[^>]+>/g, ''));
    } else {
      console.log('No matches. HTML Length:', data.length);
    }
  });
}).on('error', console.error);

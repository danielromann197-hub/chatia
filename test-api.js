const key = 'sk_wsMy3gGNUbHFSEiU0VxFEXH2xHWhOXjV';
const run = async () => {
  const urls = [
    { url: `https://image.pollinations.ai/prompt/cat?key=${key}`, headers: {} },
    { url: 'https://image.pollinations.ai/prompt/cat', headers: { 'Authorization': `Bearer ${key}` } },
    { url: 'https://image.pollinations.ai/prompt/cat', headers: { 'Authorization': key } },
  ];
  
  for (const config of urls) {
     const res = await fetch(config.url, { headers: config.headers });
     console.log('Testing:', config.url.includes('key=') ? 'Query Key' : 'Header Auth', '->', res.status);
     if (!res.ok) {
        require('fs').appendFileSync('out.json', `\n--- ${res.status} ---\n` + await res.text());
     }
  }
};
run();

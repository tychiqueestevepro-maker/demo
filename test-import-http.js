import http from 'http';

const csvPayload = `Lead,First Name,Last Name,Title,Seniority,Company,Email,LinkedIn
-,Lucas Martin,,Head of Operations,,NovaGrowth Agency,lucas@example.com,https://linkedin.com/in/lucasmartin
-,Emma Dubois,,RevOps Manager,,ScaleBridge Consulting,emma@example.com,`;

const postData = JSON.stringify({ csv: csvPayload });

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/campaigns/cmqduy5ux0001l8043ot73suw/targets/import',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();

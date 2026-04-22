const https = require('https');
const fs = require('fs');

const url = 'https://toddboswell.ehost.com/Cameo/index.html';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('index.html', data);
    console.log('Success! Downloaded index.html');
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});

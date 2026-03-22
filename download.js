import https from 'https';
import fs from 'fs';

https.get('https://raw.githubusercontent.com/xilione/VignaMeteo/Master/app/src/App.tsx', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { fs.writeFileSync('temp.txt', data); });
});

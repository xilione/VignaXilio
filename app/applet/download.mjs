import fs from 'fs';

const response = await fetch('https://raw.githubusercontent.com/xilione/VignaMeteo/Master/app/src/App.tsx');
const text = await response.text();
fs.writeFileSync('temp.txt', text);
console.log('Downloaded', text.length, 'bytes');

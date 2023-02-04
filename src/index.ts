import fs from 'fs';

const s = fs
  .readFileSync('.env')
  .toString()
  .split('\n')
  .map(line => line.split('='));
console.log(s);

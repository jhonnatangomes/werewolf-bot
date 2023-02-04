const fs = require('fs');

const s = fs
  .readFileSync('../.env')
  .toString()
  .split('\n')
  .map((line) => line.split('='));
console.log(s);

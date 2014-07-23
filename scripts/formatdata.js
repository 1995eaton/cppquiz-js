var fs = require('fs');

var data = JSON.parse(fs.readFileSync('data.json'));

var output = Object.keys(data).map(function(e) {
  return data[e];
}).sort(function(a, b) {
  return +a.difficulty - +b.difficulty;
});

console.log(JSON.stringify(output, null, 2));

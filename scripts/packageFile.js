'use strict';

const fs = require('fs');
const packageFile = './package.json';

module.exports = {
  read: function () {
    return JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  },

  write: function (pkg) {
    fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2));
    fs.appendFileSync(packageFile, '\n');
  }
}

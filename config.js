const fs = require('fs'),
  path = require('path')
const conf = fs.existsSync(path.join(__dirname, 'config.json'))
  ? require(path.join(__dirname, 'config.json'))
  : {};
const userConfig = fs.existsSync(path.join(__dirname, 'config.user.json'))
  ? require(path.join(__dirname, 'config.user.json'))
  : {};

module.exports = Object.assign(conf, userConfig)
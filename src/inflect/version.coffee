path = require 'path'

if process.title == 'browser'
  data = require('files')['package.json']
else
  data = require('fs').readFileSync(path.join(__dirname, '/../../package.json'))

# version information
exports.package = JSON.parse(data)
exports.version = exports.package.version

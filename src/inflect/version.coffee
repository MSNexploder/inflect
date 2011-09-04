path = require 'path'

# version information
exports.package = JSON.parse(require('fs').readFileSync(path.join(__dirname, '/../../package.json')))
exports.version = exports.package.version

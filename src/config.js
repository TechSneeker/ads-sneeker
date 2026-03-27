const fs = require('fs')
const path = require('path')

function getVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
    )
    return packageJson.version
  } catch (_) {
    return '1.0.0'
  }
}

module.exports = { getVersion }

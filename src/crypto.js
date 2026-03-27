const crypto = require('crypto')

function getSalt() {
  const salt = process.env.ENCRYPTION_SALT
  if (!salt) throw new Error('ENCRYPTION_SALT não configurado no .env')
  return salt
}

// Deriva uma chave AES-256 a partir do userId + salt fixo do servidor
function deriveKey(userId) {
  return crypto.scryptSync(userId + getSalt(), 'adsneeker', 32)
}

function encrypt(text, userId) {
  const key = deriveKey(userId)
  const iv  = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // formato: iv(12) + tag(16) + ciphertext — tudo em base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decrypt(data, userId) {
  const key = deriveKey(userId)
  const buf = Buffer.from(data, 'base64')
  const iv        = buf.slice(0, 12)
  const tag       = buf.slice(12, 28)
  const encrypted = buf.slice(28)
  const decipher  = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}

module.exports = { encrypt, decrypt }

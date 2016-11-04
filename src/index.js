import fetch from 'node-fetch'

if (!global._babelPolyfill) {
  require('babel-polyfill')
}

export const apiCheck = async (url) => {
  const response = await fetch(url)

  if (!response.ok) return false

  return true
}

export const mongoCheck = async (mongoose) => {
  return (mongoose.connection.readyState === 1)
}

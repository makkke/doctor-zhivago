import { OK, SERVICE_UNAVAILABLE } from 'http-status'
import fetch from 'node-fetch'
import tcpp from 'tcp-ping'
import redis from 'redis'

function probe(hostname, port) {
  return new Promise((resolve, reject) => {
    tcpp.probe(hostname, port, (err, available) => {
      if (err) {
        reject(err)
        return
      }
      resolve(available)
    })
  })
}

export const apiCheck = async (url) => {
  try {
    const response = await fetch(url)

    return response.ok
  } catch (err) {
    return false
  }
}

export const mongoCheck = async mongoose => mongoose.connection.readyState === 1

export const oracleCheck = async (oracledb) => {
  try {
    const pong = await oracledb.ping()

    return pong
  } catch (err) {
    return false
  }
}

export const exchangeCheck = async (hostname) => {
  try {
    const available = await probe(hostname, 25)

    return available
  } catch (err) {
    return false
  }
}

export const redisCheck = async (hostname) => {
  try {
    const client = redis.createClient(6379, hostname)
    client.on('error', (err) => {
      client.quit()
      throw err
    })

    return true
  } catch (err) {
    return false
  }
}

export default dependencies => async (req, res) => {
  const promises = Object.keys(dependencies).map((key) => {
    switch (dependencies[key].type) {
      case 'mongo': return mongoCheck(dependencies[key].instance)
      case 'oracle': return oracleCheck(dependencies[key].instance)
      case 'api': return apiCheck(dependencies[key].url)
      case 'exchange': return exchangeCheck(dependencies[key].hostname)
      case 'redis': return redisCheck(dependencies[key].hostname)
      default: return Promise.reject()
    }
  })

  const statuses = await Promise.all(promises)

  const health = Object.keys(dependencies)
    .reduce((acc, dependency, i) => ({ ...acc, [dependency]: statuses[i] }), {})
  const status = Object.values(health).every(x => x) ? OK : SERVICE_UNAVAILABLE

  res.status(status).json(health)
}

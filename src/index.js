import 'babel-polyfill'
import { OK } from 'http-status'
import fetch from 'node-fetch'


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

export default dependencies => async (req, res) => {
  const promises = Object.keys(dependencies).map((key) => {
    switch (dependencies[key].type) {
      case 'mongo':
        return mongoCheck(dependencies[key].instance)

      case 'oracle':
        return oracleCheck(dependencies[key].instance)

      case 'api':
        return apiCheck(dependencies[key].url)

      default: return Promise.reject()
    }
  })

  const statuses = await Promise.all(promises)

  const health = Object.keys(dependencies)
    .reduce((acc, dependency, i) => ({ ...acc, [dependency]: statuses[i] }), {})

  res.status(OK).json(health)
}

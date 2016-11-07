import fetch from 'node-fetch'
import { Router } from 'express'
import { OK, SERVICE_UNAVAILABLE } from 'http-status'

if (!global._babelPolyfill) {
  require('babel-polyfill')
}

export const apiCheck = async (url) => {
  const response = await fetch(url)

  if (!response.ok) return false

  return true
}

export const mongoCheck = async (mongoose) => {
  return mongoose.connection.readyState === 1
}

export const oracleCheck = async (oracledb) => {
  const pong = await oracledb.ping()
  if (!pong) return false

  return true
}

export default (dependencies) => {
  const router = new Router()
  router.get('/', async (req, res) => {
    try {
      const promises = dependencies.map(dependency => {
        switch (dependency.type) {
          case 'mongo': {
            return mongoCheck(dependency.instance)
          }
          case 'oracle': {
            return oracleCheck(dependency.instance)
          }
          case 'api': {
            return apiCheck(dependency.URL)
          }

          default: return Promise.reject
        }
      })

      const statuses = await Promise.all(promises)

      res.status(OK).json(dependencies.map((dependency, i) => {
        return { [dependency.name]: statuses[i] }
      }))
    } catch (e) {
      console.log(e)
      res.status(SERVICE_UNAVAILABLE).json({})
    }
  })
  return router
}

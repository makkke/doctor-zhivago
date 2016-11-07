import mongoose from 'mongoose'

import { apiCheck, mongoCheck } from './index'

const mCheck = async () => {
  // promisify mongoose
  mongoose.Promise = global.Promise
  // connect to mongo db
  await mongoose.connect('mongodb://admin:admin@devdocker01.surrey.ca/mejai-development', { server: { socketOptions: { keepAlive: 1 } } })
  await mongoose.connection.on('error', () => {
    console.log('unable to connect to database')
  })
  const xxx = await mongoCheck(mongoose)
  console.log(xxx)
}

const mongooseCheck = async

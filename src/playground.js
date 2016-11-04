import mongoose from 'mongoose'

import { apiCheck, mongoCheck } from './index'


// promisify mongoose
mongoose.Promise = global.Promise

// connect to mongo db
mongoose.connect('mongodb://admin:admin@devdocker01.surrey.ca/mejai-development', { server: { socketOptions: { keepAlive: 1 } } })
mongoose.connection.on('error', () => {
  console.log('unable to connect to database')
})

const abc = async () => {
  const xxx = await mongoCheck(mongoose)
  console.log(xxx)
}

abc()

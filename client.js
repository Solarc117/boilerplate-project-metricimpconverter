require('dotenv').config()
const { MongoClient, MongoError } = require('mongodb')

module.exports = async function (callback) {
  const client = new MongoClient(process.env.MONGO_URI, {
    // @ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  try {
    await client.connect()
  } catch (e) {
    console.error(e)
    throw new Error('Unable to connect to database: ' + e)
  } 
  await callback(client)
}

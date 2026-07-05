import dns from 'dns'
import mongoose from 'mongoose'

// Some networks fail SRV lookups with the system DNS resolver (querySrv ECONNREFUSED).
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

/**
 * Connects to MongoDB Atlas using the connection string from environment variables.
 * The server must not start if the database connection fails.
 */
export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in the .env file.')
  }

  await mongoose.connect(mongoUri)
  console.log('MongoDB Atlas connected successfully')
}

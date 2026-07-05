import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'

dotenv.config()

const DEV_ADMIN_ROLL = 'MEK23CS024'
const DEV_ADMIN_PASSWORD = 'pass123'

async function seedAdmin() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('MONGODB_URI is not defined in .env')
    process.exit(1)
  }

  await mongoose.connect(uri)

  let user = await User.findOne({ rollNumber: DEV_ADMIN_ROLL }).select('+password')

  if (user) {
    user.role = 'admin'
    user.status = 'Active'
    user.password = DEV_ADMIN_PASSWORD
    await user.save()
    console.log(`Updated existing admin user: ${DEV_ADMIN_ROLL}`)
  } else {
    await User.create({
      fullName: 'League Admin',
      rollNumber: DEV_ADMIN_ROLL,
      department: 'CSE',
      semester: 'S6',
      password: DEV_ADMIN_PASSWORD,
      role: 'admin',
      status: 'Active',
    })
    console.log(`Created admin user: ${DEV_ADMIN_ROLL}`)
  }

  await mongoose.disconnect()
}

seedAdmin().catch((error) => {
  console.error(error)
  process.exit(1)
})

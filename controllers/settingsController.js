import Settings from '../models/Settings.js'
import ActivityLog from '../models/ActivityLog.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { formatSettings } from '../utils/formatters.js'

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getAppSettings()
  res.json({ success: true, settings: formatSettings(settings) })
})

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getAppSettings()
  Object.assign(settings, req.body)
  await settings.save()
  await ActivityLog.log('Update Settings', 'Tournament and website settings updated', req.user)
  res.json({ success: true, settings: formatSettings(settings) })
})

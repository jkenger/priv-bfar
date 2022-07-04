
const publicAttendance = require('../Controller/publicAttendance')
const route = require('express').Router()
// attendance || public
route.post('/attendance', publicAttendance.attendance_post)
route.get('/time_monitoring', publicAttendance.monitorTime)

module.exports = route
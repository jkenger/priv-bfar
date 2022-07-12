
const publicAttendance = require('../Controller/publicAttendance')
const route = require('express').Router()
// attendance || public
route.post('/attendance', publicAttendance.attendance_post)
route.get('/time_monitoring', publicAttendance.monitorTime)
route.get('/', publicAttendance.monitorTime)
route.get('/case', publicAttendance.case)

module.exports = route
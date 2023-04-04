const route = require('express').Router()
const employeeAuthView = require('../Controller/employeeAuthView')
const employeeAuth = require('../Controller/employeeAuth')
const employeeView = require('../Controller/employeeView')
const employee = require('../Controller/employee')
const {checkToken, checkUser, checkEmployeeRole}  = require('../Middleware/auth')

route.get('/login', employeeAuthView.login)
route.get('/logout', employeeAuthView.logout)
// route.get('/logout', (req, res)=>{
//     res.send('hello')
// })
route.post('/login', employeeAuth.login_post)


route.get('*', checkUser)   
route.get('/', checkEmployeeRole, employeeView.homeView)

// leave routes
// route.get('/leave', employeeView.leaveStatusView)
route.get('/leave', checkEmployeeRole, employeeView.employeeLeaveView)
// route.get('/leave/leavehistory', employeeView.leaveHistoryView))
route.get('/attendance/:id', checkEmployeeRole, employeeView.attendanceView)
route.get('/payroll/:id', checkEmployeeRole, employeeView.payrollView)

//back end routes

route.post('/api/leave', checkEmployeeRole, employee.postLeaveRequest)

route.get('/api/attendance', checkEmployeeRole, employee.getAttendance)


module.exports = route
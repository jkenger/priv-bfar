const route = require('express').Router()
const employeeAuthView = require('../Controller/employeeAuthView')
const employeeView = require('../Controller/employeeView')
const employee = require('../Controller/employee')

route.get('/login', employeeAuthView.login)

// route.get('/logout', (req, res)=>{
//     res.send('hello')
// })


route.get('/', employeeView.homeView)

// leave routes
// route.get('/leave', employeeView.leaveStatusView)
route.get('/leave', employeeView.employeeLeaveView)
// route.get('/leave/leavehistory', employeeView.leaveHistoryView)

//back end routes

route.post('/api/leave', employee.postLeaveRequest)


module.exports = route
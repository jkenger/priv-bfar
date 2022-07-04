const route = require('express').Router()
const admin = require('../Controller/admin')
const adminAuthView = require('../Controller/adminAuthView')
const adminAuth = require('../Controller/adminAuth')
const adminView = require('../Controller/adminView')
const {checkToken, checkUser, checkRoles}  = require('../Middleware/auth')



// AUTHENTICATION VIEW
route.get('/LOGIN', adminAuthView.login)
route.get('/REGISTER', adminAuthView.register)
route.get('/LOGOUT', adminAuthView.logout) 

// AUTHENTICATION CONTROLLERS
route.post('/REGISTER', adminAuth.register_post)
route.post('/LOGIN', adminAuth.login_post)


// ADMIN VIEW
route.get('*', checkUser)
route.get('/', checkToken, checkRoles, adminView.home)
route.get('/EMPLOYEES',checkToken, checkRoles, adminView.employees)
route.get('/PAYROLL', checkToken, checkRoles, adminView.payroll)
route.get('/RECORDS', checkToken, checkRoles, adminView.records)

// ADMIN CONTROLLERS
route.get('/EMPLOYEES_GET',  admin.employees_get)
route.get('/EMPLOYEES_COUNT_GET', admin.employees_count_get)
route.get('/DELETE_ATTENDANCE', admin.delete_attendance)
route.get('/RECORDS_GET', admin.records_get)
route.get('/PAYROLL_GET', admin.payroll_get)



module.exports = route
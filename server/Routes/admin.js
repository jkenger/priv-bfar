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
route.post('/register', adminAuth.register_post)
route.post('/login', adminAuth.login_post)


// ADMIN VIEW
route.get('*', checkUser)
route.get('/', checkToken, checkRoles, adminView.home)
// employees page

route.get('/employees',checkToken, checkRoles, adminView.employees)
route.get('/employees/add',checkToken, checkRoles, adminView.addEmployee)
route.get('/employees/view',checkToken, checkRoles, adminView.viewEmployee)
route.get('/employees/view/edit',checkToken, checkRoles, adminView.editEmployee)

route.get('/payroll', checkToken, checkRoles, adminView.payroll)
route.get('/records', checkToken, checkRoles, adminView.records)

// ADMIN CONTROLLERS || APIS

// dashboard
route.get('/EMPLOYEES_COUNT_GET', admin.employees_count_get)

// employee controller
route.get('/employees_get',  admin.readEmployees)
route.get('/employee_view',  admin.viewEmployee)
route.post('/employee_add',  admin.addEmployee)
route.put('/employee_update',  admin.updateEmployee)
route.delete('/employee_delete',  admin.deleteEmployee)

// record page
route.get('/RECORDS_GET', admin.records_get)

// payroll page
route.get('/PAYROLL_GET', admin.payroll_get)



// tests
route.get('/DELETE_ATTENDANCE', admin.delete_attendance)



module.exports = route
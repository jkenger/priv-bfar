const route = require('express').Router()
const admin = require('../Controller/admin')
const adminAuthView = require('../Controller/adminAuthView')
const adminAuth = require('../Controller/adminAuth')
const adminView = require('../Controller/adminView')
const {checkToken, checkUser, checkRoles}  = require('../Middleware/auth')



// // authentication endpoints
// route.get('/login', adminAuthView.login)
// route.get('/register', adminAuthView.register)
// route.get('/logout', adminAuthView.logout) 

// // authentication api
// route.post('/register', adminAuth.register_post)
// route.post('/login', adminAuth.login_post)


// // all
// route.get('*', checkUser)
// route.get('/', checkToken, checkRoles, adminView.home)

// // employee endpoints
// route.get('/employees',checkToken, checkRoles, adminView.employees)
// route.get('/employees/add',checkToken, checkRoles, adminView.addEmployee)
// route.get('/employees/view',checkToken, checkRoles, adminView.viewEmployee)
// route.get('/employees/view/edit',checkToken, checkRoles, adminView.editEmployee)

// // payroll endpoints
// route.get('/payroll', checkToken, checkRoles, adminView.payroll)

// // record endpoints 
// route.get('/records', checkToken, checkRoles, adminView.records)

// all
route.get('*', )
route.get('/', adminView.home)

// employee endpoints
route.get('/employees', adminView.employees)
route.get('/employees/add', adminView.addEmployee)
route.get('/employees/view', adminView.viewEmployee)
route.get('/employees/view/edit', adminView.editEmployee)

// payroll endpoints
route.get('/payroll', adminView.payroll)

// record endpoints 
route.get('/records',  adminView.records)

// [api]
// dashboard
route.get('/api/employees_count', admin.employees_count_get)

// employee api
route.get('/api/employees',  admin.readEmployees)
route.get('/api/employees/:id',  admin.viewEmployee)
route.post('/api/employees',  admin.addEmployee)
route.patch('/api/employees/:id',  admin.updateEmployee)
route.delete('api/employees/:id',  admin.deleteEmployee)

// record api
route.get('/api/records', admin.records_get)

// payroll api
route.get('/api/payrolls', admin.payroll_get)



// tests
route.get('/DELETE_ATTENDANCE', admin.delete_attendance)



module.exports = route
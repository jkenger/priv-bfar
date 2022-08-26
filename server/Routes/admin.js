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
route.get('/employees', adminView.readEmployeesView)
route.get('/employees/add', adminView.addEmployeeView)
route.get('/employees/view/:id', adminView.viewEmployeeView)
route.get('/employees/view/edit', adminView.editEmployeeView)

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
route.delete('/api/employees/:id',  admin.deleteEmployee)

    // travel orders and official businesses must be retrieve from the admin client,
    // after the client submitted the date and name of the person that was to be excused in that day,
    // the system must create an attendance that write the current order# in am pm

// events | holidays and travel orders api
route.post('/api/events/travelorder', admin.addTravelOrder)

    // 

// record api
route.get('/api/records', admin.readRecords)

// payroll api
route.get('/api/payrolls', admin.readPayrolls)



// tests
route.delete('/api/testdelete', admin.testdelete)



module.exports = route
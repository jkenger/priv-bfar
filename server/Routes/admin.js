const route = require('express').Router()
const admin = require('../Controller/admin')
const adminAuthView = require('../Controller/adminAuthView')
const adminAuth = require('../Controller/adminAuth')
const adminView = require('../Controller/adminView')
const {checkToken, checkUser, checkRoles}  = require('../Middleware/auth')
const { id } = require('date-fns/locale')



// authentication endpoints
route.get('/login', adminAuthView.login)
route.get('/register', adminAuthView.register)
route.get('/logout', adminAuthView.logout) 

// authentication api
route.post('/register', adminAuth.register_post)
route.post('/login', adminAuth.login_post)


// all
route.get('*', checkUser)
route.get('/', checkToken, checkRoles, adminView.homeView)

// employee endpoints
route.get('/employees',checkToken, checkRoles, adminView.readEmployeesView)
route.get('/employees/add',checkToken, checkRoles, adminView.addEmployeeView)
route.get('/employees/view/:id',checkToken, checkRoles, adminView.viewEmployeeView)
route.get('/employees/view/edit',checkToken, checkRoles, adminView.editEmployeeView)

// deduction endpoints
route.get('/deductions', checkToken, checkRoles, adminView.deductionView)

// payroll endpoints
route.get('/payroll', checkToken, checkRoles, adminView.payrollView)

// record endpoints 
route.get('/records', checkToken, checkRoles, adminView.recordView)

// holidays and travel orders endpoint
route.get('/holidays', checkToken, checkRoles, adminView.holidayView)
route.get('/holidays/add', checkToken, checkRoles, adminView.addHolidayView)
route.get('/travelpass', checkToken, checkRoles, adminView.travelPassView)

// // all
// route.get('*', )
// route.get('/', adminView.home)

// // employee endpoints
// route.get('/employees', adminView.readEmployeesView)
// route.get('/employees/add', adminView.addEmployeeView)
// route.get('/employees/view/:id', adminView.viewEmployeeView)
// route.get('/employees/view/edit', adminView.editEmployeeView)

// // payroll endpoints
// route.get('/payroll', adminView.payroll)

// // record endpoints 
// route.get('/records',  adminView.records)

// [api]
// dashboard
route.get('/api/employees_count', admin.employees_count_get)

// employee api
route.get('/api/employees',  admin.readEmployees)
route.get('/api/employees/:id',  admin.viewEmployee)
route.post('/api/employees',  admin.addEmployee)
route.patch('/api/employees/:id',  admin.updateEmployee)
route.delete('/api/employees/:id',  admin.deleteEmployee)

// deductions
route.get('/api/deductions', admin.readDeductions)
route.post('/api/deductions', admin.addDeduction)
route.delete('/api/deductions', admin.deleteDeduction)
route.patch('/api/deductions', admin.editDeduction)

    // travel orders and official businesses must be retrieve from the admin client,
    // after the client submitted the date and name of the person that was to be excused in that day,
    // the system must create an attendance that write the current order# in am pm

// events | holidays and travel orders api
route.get('/api/events/holiday', admin.readHoliday)
route.get('/api/events/travelpass', admin.readTravelPass)
route.post('/api/events/holiday', admin.addHoliday)
route.delete('/api/events/holiday/:id', admin.deleteHoliday)
route.post('/api/events/travelpass', admin.addTravelPass)
route.delete('/api/events/travelpass/:id', admin.deleteTravelPass)

    // 

// record api
route.get('/api/records', admin.readRecords)

// payroll api
route.get('/api/payrolls', admin.readPayrolls)

// holiday and travel orders api

// tests
route.delete('/api/testdelete', admin.testdelete)



module.exports = route
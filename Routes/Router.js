const route = require('express').Router()
const { localsName } = require('ejs')
const { Router } = require('express')
const UserController = require('./../Controller/UserController')
const EmployeeController = require('./../Controller/EmployeeController')
const {checkToken, checkUser, checkRoles}  = require('./../Middleware/AuthMiddleware')


// AUTHENTICATION
// /login
route.get('/login', UserController.login)
route.post('/login', UserController.login_post)

// /register
route.get('/register', UserController.register)
route.post('/register', UserController.register_post)

// logout
route.get('/logout', UserController.logout) 

route.get('*', checkUser)
route.get('/', checkToken, checkRoles, UserController.home)


// attendance
route.post('/attendance', EmployeeController.attendance_post)
// employees
route.get('/employees',checkToken, checkRoles, UserController.employees)
route.get('/time_monitoring', EmployeeController.monitorTime)

route.get('/EMPLOYEES_GET',  UserController.employees_get)
route.get('/EMPLOYEES_COUNT_GET', UserController.employees_count_get)
route.get('/delete_attendance', UserController.delete_attendance)

// records
route.get('/records', checkToken, checkRoles, UserController.records)
route.get('/records_get', UserController.records_get)

// payroll
route.get('/payroll', checkToken, checkRoles, UserController.payroll)
route.get('/payroll_get', UserController.payroll_get)

module.exports = route
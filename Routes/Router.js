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
route.get('/time_monitoring', checkToken, checkRoles, EmployeeController.monitorTime)

route.get('/EMPLOYEES_GET',  UserController.employees_get)
route.get('/EMPLOYEES_COUNT_GET', UserController.employees_count_get)

// records
route.get('/records', checkToken, checkRoles, UserController.records)

module.exports = route
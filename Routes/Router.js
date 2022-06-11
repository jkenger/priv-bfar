const route = require('express').Router()
const { localsName } = require('ejs')
const { Router } = require('express')
const userAPI = require('./../Controller/APIs/API')
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

// attendance
route.post('/attendance', EmployeeController.attendance_post)

//APIS
route.get('/EMPLOYEES_GET',  userAPI.employees_get)
route.get('/EMPLOYEES_COUNT_GET', userAPI.employees_count_get)

route.get('*', checkUser)
route.get('/', checkToken, checkRoles, UserController.home)
// employees
route.get('/employees',checkToken, checkRoles, EmployeeController.employees)
route.get('/time_monitoring', checkToken, checkRoles, UserController.monitorTime)


module.exports = route
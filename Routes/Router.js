const route = require('express').Router()
const { localsName } = require('ejs')
const { Router } = require('express')
const UserController = require('./../Controller/UserController')
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


//APIS
route.get('/EMPLOYEES_GET',  UserController.employees_get)
route.get('/EMPLOYEES_COUNT_GET', UserController.employees_count_get)


route.get('*', checkUser)
route.get('/', checkToken, checkRoles, UserController.home)
// employees
route.get('/employees',checkToken, checkRoles, UserController.employees)


module.exports = route
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

// employees
route.get('/employees', UserController.employees)

//APIS
route.get('/employees_get', UserController.employees_get)

route.get('*', checkUser)
route.get('/', checkToken, checkRoles, UserController.home)

module.exports = route
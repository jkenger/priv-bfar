const route = require('express').Router()
const { Router } = require('express')
const UserController = require('./../Controller/UserController')
const {checkToken, checkUser, checkRoles}  = require('./../Middleware/AuthMiddleware')


// AUTHENTICATION
// /login
route.get('/login', UserController.login_get)
route.post('/login', UserController.login_post)

// /register
route.get('/register', UserController.register_get)
route.post('/register', UserController.register_post)

// logout
route.get('/logout', UserController.logout)

route.get('*', checkUser)
route.get('/', checkToken, checkRoles , UserController.home)

module.exports = route
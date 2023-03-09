const route = require('express').Router()
const employeeAuthView = require('../Controller/employeeAuthView')
const employeeView = require('../Controller/employeeView')

route.get('/login', employeeAuthView.login)

// route.get('/logout', (req, res)=>{
//     res.send('hello')
// })


route.get('/', employeeView.homeView)

module.exports = route
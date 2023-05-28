const express = require('express')
const morgan = require('morgan')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const cors = require('cors')
const adminRoute = require('./server/Routes/admin')
const employeeRoute = require('./server/Routes/employee');
const publicRoute = require('./server/Routes/public')
var path = require('path')
require('dotenv').config()

const app = express()

// MIDDLEWARES
app.use(morgan('dev'))
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// MIDDLEWARES || Public Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, '/node_modules/onscan.js/')))
app.use('/assets', express.static(path.join(__dirname, '/node_modules/moment.min.js/')))
app.use('/scripts', express.static(path.join(__dirname, '/public/script/')))
console.log('DIRNAME', __dirname)

// CONNECTION
mongoose.connect(process.env.DB_URI)
.then(result=>{
    try{
        app.listen(process.env.PORT, [process.env.HOST], (req, res)=>{
            console.log('LISTENING AT PORT', process.env.PORT)
        })
    }catch(err){console.log('err')}
})

// ROUTES
app.use('/admin', adminRoute)
app.use('/employee', employeeRoute)
app.use('/', publicRoute)

// ROUTES || Not Found URLS || Redirects

// admin
app.use('/admin/', (req, res)=>{
    res.redirect('/admin/')
})

app.use('/employee/', (req, res)=>{
    res.redirect('/employee/')
})

// employees
app.use('/admin/employees/', (req, res)=>{
    res.redirect('/admin/employees')
})
// !employees

// payroll
app.use('/admin/payroll/history/', (req, res)=>{
    res.redirect('/admin/payroll/history/all')
}   )
app.use('/admin/payroll/groups/', (req, res)=>{
    res.redirect('/admin/payroll/groups')
} )
app.use('/admin/payroll/', (req, res)=>{
    res.redirect('/admin/payroll/all')
} )


// !payroll

// attendance
app.use('/admin/attendance/history/', (req, res)=>{
    res.redirect('/admin/attendance/history/all')
})
app.use('/admin/attendance/', (req, res)=>{
    res.redirect('/admin/attendance/all')
})
// !attendance
app.use('*', (req, res)=>{
    res.render('404')
})



// Template Engine
app.set('view engine', 'ejs')









const express = require('express')
const morgan = require('morgan')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const cors = require('cors')
const adminRoute = require('./server/Routes/admin')
const publicRoute = require('./server/Routes/public')
var path = require('path')
require('dotenv').config()

const app = express()

// MIDDLEWARES
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// MIDDLEWARES || Public Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, '/node_modules/onscan.js/')))
app.use('/scripts', express.static(path.join(__dirname, '/public/script/')))

// ROUTES
app.use('/admin', adminRoute)
app.use('/', publicRoute)

// ROUTES || Not Found URLS
app.use('*', (req, res)=>{
    res.send('404 NOT FOUND')
})


// Template Engine
app.set('view engine', 'ejs')




// CONNECTION
mongoose.connect(process.env.DB_URI)
.then(result=>{
    try{
        app.listen(process.env.PORT, [process.env.HOST], (req, res)=>{
            console.log('LISTENING AT PORT', process.env.PORT)
        })
    }catch(err){console.log('err')}
})





const express = require('express')
const morgan = require('morgan')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const userSchema = require('./Model/UserSchema')
const route = require('./Routes/Router')
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const cors = require('cors')
const checkToken = require('./Middleware/AuthMiddleware')
const UserController = require('./Controller/UserController')
require('dotenv').config()

const app = express()

// MIDDLEWARES
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(route)
app.options('*', cors())
// Template Engine
app.set('view engine', 'ejs')
// Public files
app.use(express.static('public'))


// CONNECTION
mongoose.connect(process.env.DB_URI)
.then(result=>{
    try{
        app.listen(process.env.PORT, [process.env.HOST], (req, res)=>{
            console.log('LISTENING AT PORT', process.env.PORT)
        })
    }catch(err){
        console.log('err')
    }
})





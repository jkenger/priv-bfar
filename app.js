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
mongoose.connect('mongodb+srv://user-ken:1011jksg@cluster0.gej4o.mongodb.net/node?retryWrites=true&w=majority')
.then(result=>{
    try{
        app.listen(3000, ['192.168.254.100' || 'localhost'], (req, res)=>{
            console.log('LISTENING AT PORT', 3000)
        })
    }catch(err){
        console.log('err')
    }
})



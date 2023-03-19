const jwt = require('jsonwebtoken')
const User = require('../Model/user')
const EmployeeUser = require('../Model/employeeUser')

// VERIFY TOKEN to access the home page
const checkToken = (req, res, next) => {
    const token = req.cookies['token']
    if (token) {
        jwt.verify(token, '02fh1000movah', (err, decordedToken) => {
            if (err) {
                res.cookie('token', '')
                res.redirect('/admin/login')
            } else {
                console.log('/auth.checkToken:', decordedToken)
                next()
            }

        })
    } else {
        console.log('Token not found')
        res.redirect('/admin/login')
    }
}

// CHECK ROLE to access role specified pages
const checkRoles = (req, res, next)=>{
    const token = req.cookies['token']
    const role = req.cookies['isAdmin']
    if (token) {
        jwt.verify(token, '02fh1000movah', (err, decordedToken) => {
            if (err) {
                res.cookie('token', '')
                res.redirect('/admin/login')
            } else {
                if(role === 'admin'){
                    console.log('/auth.checkRoles :', decordedToken)
                    next()
                }else{
                    // DEFAULT ATM, REDIRECT TO USER ACCESS IF AVAIALABLE
                    res.redirect('/employee/')
                }
                
            }

        })
    } else {
        console.log('Token not found')
        res.redirect('/admin/login')
    }
}

const checkEmployeeRole = (req, res, next)=>{
    const token = req.cookies['token']
    const role = req.cookies['isAdmin']
    if (token) {
        jwt.verify(token, '02fh1000movah', (err, decordedToken) => {
            if (err) {
                res.cookie('token', '')
                res.redirect('/employee/login')
            } else {
                if(role === 'employee'){
                    console.log('/auth.checkRoles :', decordedToken)
                    next()
                }else{
                    // DEFAULT ATM, REDIRECT TO USER ACCESS IF AVAIALABLE
                    res.redirect('/admin/')
                }
                
            }

        })
    } else {
        console.log('Token not found')
        res.redirect('/employee/login')
    }
}

// CHECK USER if authenticated, give access.
const checkUser = (req, res, next) => {
    const token = req.cookies['token']
    const role = req.cookies['isAdmin']
    if (token) {
        jwt.verify(token, '02fh1000movah', async (err, decordedToken) => {
            if (err) {
                console.log('CHECKNIG USER ERR:', err)
                res.locals.user = null
                next()
            }else{
                var data = {}
                if(role === 'admin'){
                    data = await User.findById(decordedToken.id)
                }
                else if(role === 'employee'){
                    data = await EmployeeUser.findById(decordedToken.id)
                }
                res.locals.user = data
                console.log('/auth.checkUser:', res.locals.user)
                next()
            }
        })
    } else {
        res.locals.user = null
        next()
    }
}

module.exports = { checkToken, checkUser, checkRoles, checkEmployeeRole }
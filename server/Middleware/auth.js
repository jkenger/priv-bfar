const jwt = require('jsonwebtoken')
const User = require('../Model/user')
const EmployeeUser = require('../Model/employeeUser')
const Employee = require('../Model/employee')

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
                console.log(data)
                if(data !== null){ 
                    res.locals.user = data
                    const result = await Employee.findOne({'employee_details.designation.id': res.locals.user.emp_code})
                    res.locals.employee = result
                    console.log('/auth.checkUser:', res.locals.user)
                    console.log('/auth.checkUser.employeeDate:', res.locals.employee)
                } 
                
                next()
            }
        })
    } else {
        res.locals.user = null
        next()
    }
}

const checkApiAuth = (req, res, next) => {
    let id = '';
    if(req.params){
         id = req.params.id
    }
    const authorization = req.query.auth
    if(authorization !== 'admin'){
        if(id !== authorization){
            return res.status(403).send({message: 'You are not authorized to access this information'});
        }
    }
    next()
}

module.exports = { checkToken, checkUser, checkRoles, checkEmployeeRole, checkApiAuth }
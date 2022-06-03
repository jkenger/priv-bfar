const jwt = require('jsonwebtoken')
const UserSchema = require('./../Model/UserSchema')

// VERIFY TOKEN to access the home page
const checkToken = (req, res, next) => {
    const token = req.cookies['token']
    if (token) {
        jwt.verify(token, '02fh1000movah', (err, decordedToken) => {
            if (err) {
                res.cookie('token', '')
                res.redirect('/login')
            } else {
                console.log(decordedToken)
                next()
            }

        })
    } else {
        console.log('Token not found')
        res.redirect('/login')
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
                res.redirect('/login')
            } else {
                if(role === 'admin'){
                    console.log(decordedToken)
                    next()
                }else{
                    // DEFAULT ATM, REDIRECT TO USER ACCESS IF AVAIALABLE
                    res.redirect('/logout') 
                }
                
            }

        })
    } else {
        console.log('Token not found')
        res.redirect('/login')
    }
}

// CHECK USER if authenticated, give access.
const checkUser = (req, res, next) => {
    const token = req.cookies['token']
    if (token) {
        jwt.verify(token, '02fh1000movah', async (err, decordedToken) => {
            if (err) {
                console.log('CHECKNIG USER ERR:', err)
                res.locals.user = null
                next()
            }else{
                const data = await UserSchema.findById(decordedToken.id)
                res.locals.user = data
                console.log(res.locals.user)
                next()
            }
        })
    } else {
        res.locals.user = null
        next()
    }
}

module.exports = { checkToken, checkUser, checkRoles }
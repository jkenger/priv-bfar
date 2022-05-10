const jwt = require('jsonwebtoken')
const UserSchema = require('./../Model/UserSchema')

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

module.exports = { checkToken, checkUser }
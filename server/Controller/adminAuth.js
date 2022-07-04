const users = require('../Model/UserSchema')
const { errorHandler, fetchData } = require('./services/services')
const cookie = require('cookie-parser')
const jwt = require('jsonwebtoken')

// CREATE TOKEN AND EXPIRY
const maxAge = 3 * 24 * 60 * 60; // 3 Days
const createToken = (id) => {
    return jwt.sign({ id }, '02fh1000movah', { expiresIn: maxAge })
}

// LOGIN POST
exports.login_post = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    if (!req.body) {
        res.status(500).send("CANNOT LOGIN")
    } else {
        try {
            const user = await users.login(email, password)
            const token = await createToken(user._id)
            res.cookie('isAdmin', user.role, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.cookie('token', token, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.status(200).send({ user: user })
        } catch (err) {
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
    }
}
// REGISTER POST
exports.register_post = async (req, res) => {
    if (!req.body) {
        res.status(500).send('CANNOT REGISTER')
    } else {
        try {
            const { email, password, role } = req.body
            const user = await users.create({ email, password, role })
            res.cookie('isAdmin', role, { httpOnly: true, expiresIn: maxAge * 1000 })
            const token = await createToken(user._id)
            res.cookie('token', token, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.status(200).send({ user: user })
        } catch (err) {
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
    }
}
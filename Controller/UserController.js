const users = require('./../Model/UserSchema')
const {errorHandler, fetchData} = require('./services/services')
const cookie = require('cookie-parser')
const jwt = require('jsonwebtoken')


exports.login = (req, res) => {
    if (req.cookies['token']) {
        res.status(200).redirect('/')
    } else {
        res.status(200).render('Login')
    }
}

exports.register = (req, res) => {
    if (req.cookies['token']) {
        res.status(200).redirect('/')
    } else {

        res.status(200).render('Signup')
    }
}

// CREATE TOKEN

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, '02fh1000movah', { expiresIn: maxAge })
}


// LOGIN REQ
exports.login_post = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    if (!req.body) {
        res.status(500).send("CANNOT LOGIN")
    } else {
        try {
            const user = await users.login(email, password)
            const token = await createToken(user._id)
            console.log(user)
            res.cookie('isAdmin', user.role, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.cookie('token', token, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.status(200).send({ user: user })
        } catch (err) {
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
    }
}
// REGISTER REQ
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

// RENDERER
exports.home = async (req, res) => {
    try {
        const data = await fetchData('employees_count_get')
        res.status(200).render('Home', { data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}
exports.employees = async (req, res) => {
    try {
        const data = await fetchData('employees_get')
        res.status(200).render('Employees', { data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}
exports.monitorTime = async (req, res) => {
    try {
        // const data = await fetchData('time_monito')
        res.status(200).render('TimeMonitoring', { url: req.url })
    } catch (err) {
        console.log(err)
    }
}   

exports.logout = (req, res) => {
    res.cookie('token', '')
    res.cookie('isAdmin', '')
    res.redirect('/login')
}


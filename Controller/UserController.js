const users = require('./../Model/UserSchema')
const employees = require('./../Model/EmployeesSchema')
const cookie = require('cookie-parser')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

const errorHandler = (err) => {
    const error = { email: '', password: '' }

    if (err.message === 'Invalid email') {
        error.email = err.message
        return error
    }

    if (err.message === 'Invalid password') {
        error.password = err.message
        return error
    }

    if (err.code === 11000) {
        error.email = 'Email already exist.'
        return error
    }

    if (err.message.includes('users validation failed')) {
        Object.values(err.errors).forEach(properties => {
            error[properties.path] = properties.message
        })
    }
    return error
}

// RENDERER
exports.home = async (req, res) => {

    res.status(200).render('Home',{url: req.url})
}
exports.employees = async (req, res)=>{
    try {
        const result = await fetch('http://localhost:3000/employees_get', {
            headers: {'Content-Type': 'application/json'},
            method: 'GET'
        })
        const data = await result.json()
        console.log(data)
        res.status(200).render('Employees', {data , url: req.url})
    } catch (err) {
        console.log(err)
    }
}

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

// APIs
exports.employees_get = async (req, res) => {
    const emp = await employees.find()
    res.status(200).send({emp})
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
            res.cookie('isAdmin', user.role, {httpOnly: true, expiresIn: maxAge * 1000})
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
            res.cookie('isAdmin', role, {httpOnly: true, expiresIn: maxAge * 1000})
            const token = await createToken(user._id)
            res.cookie('token', token, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.status(200).send({ user: user })
        } catch (err) {
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
    }
}

exports.logout = (req, res) => {
    res.cookie('token', '')
    res.cookie('isAdmin', '')
    res.redirect('/login')
}
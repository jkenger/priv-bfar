const users = require('../Model/user')
const employeeUsers = require('../Model/employeeUser')
const Employee = require('../Model/employeee')
const { errorHandler, fetchData } = require('./services/services')
const cookie = require('cookie-parser')
const jwt = require('jsonwebtoken')

// CREATE TOKEN AND EXPIRY
const maxAge = 3 * 24 * 60 * 60; // 3 Days
const createToken = (id) => {
    return jwt.sign({ id }, '02fh1000movah', { expiresIn: maxAge })
}

module.exports = {

    // LOGIN
    login_post: async (req, res) => {
        const email = req.body.email
        const password = req.body.password
        const rememberme = req.body.remember

        if (!req.body) { res.status(500).send("Failed processing login authorization") }

        try {
            const user = await users.login(email, password)
            const token = await createToken(user._id)
            res.cookie('isAdmin', user.role, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.cookie('token', token, { httpOnly: true, expiresIn: maxAge * 1000 })
            const data = await Employee.findOne({'employee_details.account_details.portal_account': user.id})
            const authorization = data.employee_details.designation.id
            res.cookie('authorization', authorization, { httpOnly: true, expiresIn: maxAge * 1000 })
            res.status(200).send({ user: user })
        } catch (err) {
            const error = errorHandler(err)
            res.status(500).send({err: error})
        }

    },
    
}

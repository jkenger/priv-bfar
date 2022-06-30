const users = require('./../Model/UserSchema')
const { errorHandler, fetchData } = require('./services/services')
const cookie = require('cookie-parser')
const jwt = require('jsonwebtoken')
const employees = require('./../Model/EmployeesSchema')
const attendances = require('./../Model/Attendance')
const payroll = require('./../Model/Payroll')



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
exports.employees_count_get = async (req, res) => {
    const empC = await employees.find().count()
    res.status(200).send({ empC })
}

// GET ALL THE EMPLOYEE
exports.employees_get = async (req, res) => {
    const emp = await employees.find()
    res.status(200).send({ emp })
}


exports.delete_attendance = async (req, res) => {
    try {
        const data = await attendances.deleteMany({})
        console.log(data)
    } catch (err) {
        console.log(err)
    }
}

exports.records_get = async (req, res) => {
    try {
        const records = await attendances.find().sort({ date: 'desc' });
        res.status(200).send({ records })
    } catch (err) {
        console.log(err)
    }
}

// Payroll EMPLOYEES
exports.payroll_get = async (req, res) => {
    let doc = {}
    try {
        // Query the employee table
        await employees.aggregate([
            {
                // Select the attendance table
                $lookup: {
                    from: 'attendances',
                    localField: 'employee_id',
                    foreignField: 'emp_code',
                    as: 'attendance',
                    let: { time_out: '$time_out' },
                    pipeline: [
                        {
                            // where time_out is not equal to ''
                            $match: { time_out: { $ne: '' } }
                        }
                    ]
                }
            },
            {
                // Join
                $group: {
                    _id: "$_id",
                    emp_code: {$first: '$employee_id'},
                    name: {$first: '$name'},
                    designation: {$first: '$position'},
                    // sum up the total attendance
                    no_of_days: { $sum: { $size: "$attendance" } } 
                }
            },
            {
                $sort:{
                    emp_code: 1
                }
            }
        ]).then(async user => {
            res.status(200).json({user})
        })
    } catch (err) {
        console.log(err)
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
exports.records = async (req, res) => {
    try {
        const data = await fetchData('records_get')
        res.status(200).render('TimeRecords', { data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}
exports.payroll = async (req, res) => {
    try {
        const data = await fetchData('payroll_get')
        res.status(200).render('Payroll', {data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}


exports.logout = (req, res) => {
    res.cookie('token', '')
    res.cookie('isAdmin', '')
    res.redirect('/login')
}


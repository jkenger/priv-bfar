const employees = require('./../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { errorHandler } = require('./services/services')
const fetch = require('node-fetch')

exports.attendance_post = async (req, res) => {
    if (!req.body) {
        res.status(500).send('The system cannot process your attendance.')
    } else {
        try {
            const { employee_id, currentDate, time_in, time_out, time_type } = req.body
            console.log( employee_id, currentDate, time_in, time_type)
            // USER WANTS TO TIME IN
            if (time_type === 'timein') {
                const loggedIn = await attendances.timein(employee_id, currentDate, time_in)
                if (loggedIn) {
                    res.status(200).send({log_in: loggedIn});
                }
            }
            // USER WANTS TO TIME OUT
            if (time_type === 'timeout') {
                const loggedOut = await attendances.timeout(employee_id, time_out, currentDate)
                if (loggedOut) {
                    res.status(200).send({log_out: loggedOut});
                }
            }

        } catch (err) {
            console.log(err)
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
    }
}
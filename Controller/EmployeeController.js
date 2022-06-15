const employees = require('./../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { errorHandler, fetchData } = require('./services/services')
const fetch = require('node-fetch')

exports.attendance_post = async (req, res) => {
    if (!req.body) {
        res.status(500).send('The system cannot process your attendance.')
    } else {
        try {
            const {
                employee_id,
                time_type
            } = req.body

            // find if exist
            const result = await employees.findOne({
                employee_id: employee_id 
            })
            // send an error if not
            console.log(result)
            if (!result) {
                if(!employee_id){
                    throw Error(`Please input a valid employee ID!`)
                }
                throw Error(`ID Number: ${employee_id}, not recognized by the system!`)
            } else {
                if (time_type==='timein') {
                    const logIn = await attendances.timein(employee_id)
                    if (logIn) {
                        res.status(200).send({log_in: logIn});
                    }
                }
                if (time_type==='timeout') {
                    const logOut = await attendances.timeout(employee_id)
                    if (logOut) {
                        res.status(200).send({log_out: logOut});
                    }
                }
            }
        } catch (err) {
            console.log(err)
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
    }
}


exports.monitorTime = async (req, res) => {
    try {
        // const data = await fetchData('time_monito')
        res.status(200).render('TimeMonitoring', {
            url: req.url,
            currentDate: new Date().toLocaleDateString(),
            currentTime: new Date().toLocaleTimeString()
        })
    } catch (err) {
        console.log(err)
    }
}   


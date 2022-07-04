const employees = require('../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { errorHandler, fetchData } = require('./services/services')
const fetch = require('node-fetch')

exports.attendance_post = async (req, res) => {
    if (!req.body) {
        res.status(500).send('The system cannot process your attendance.')
    } else {
        try {
            const {
                emp_code,
                time_type
            } = req.body

            // find if exist
            const result = await employees.findOne({
                emp_code: emp_code
            })
            
            // send an error if not
            if (!result) {
                if(!emp_code){
                    throw Error(`Please enter valid employee code!`)
                }
                throw Error(`ID Number: ${emp_code}, not recognized by the system!`)
            } else {
                const _id = result._id
                const currentDate = new Date().toISOString()
                const currentTime = new Date().toLocaleTimeString()
                const currentDateString = new Date().toLocaleDateString()
                if (time_type==='timein') {
                    const logIn = await attendances.timein(emp_code, _id, currentDate, currentDateString, currentTime)
                    if (logIn) {
                        res.status(200).send({log_in: logIn});
                    }
                }
                if (time_type==='timeout') {
                    const logOut = await attendances.timeout(emp_code, _id, currentDate, currentDateString, currentTime)
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

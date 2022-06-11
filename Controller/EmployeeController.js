const employees = require('./../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { errorHandler, fetchData } = require('./services/services')
const fetch = require('node-fetch')

exports.attendance_post = async (req, res) => {
    if (!req.body) {
        res.status(500).send('The system cannot process your attendance.')
    } else {
        try {
            const {employee_id, time_type} = req.body //ASSIGN FROM RES
            const empExist = await employees.findOne({employee_id: employee_id}) // CHECK IF EMPLOYEE ID IN EMPLOYEE DATA BASE 
            if(!empExist){ // IF DOES NOT EXIST
                throw Error('Employee id does not exist')
            }else{ //IF DOES LET THE USER TIME IN

                // USER WANTS TO TIME IN
                if (time_type === 'timein') {
                    const logIn = await attendances.timein(employee_id)
                    if (logIn) {
                        res.status(200).send({log_in: logIn});
                    }
                }
                // USER WANTS TO TIME OUT
                if (time_type === 'timeout') {
                    const logOut = await attendances.timeout(employee_id)
                    if (logOut) {
                        res.status(200).send({log_out: logOut});
                    }
                }
            }
            
            // const { employee_id, currentDate, time_in, time_out, time_type } = req.body //ASSIGN FROM RES
            // const empExist = await employees.findOne({employee_id: employee_id}) // CHECK IF EMPLOYEE ID IN EMPLOYEE DATA BASE 
            // if(!empExist){ // IF DOES NOT EXIST
            //     throw Error('Employee id does not exist')
            // }else{ //IF DOES LET THE USER TIME IN

            //     // USER WANTS TO TIME IN
            //     if (time_type === 'timein') {
            //         const loggedIn = await attendances.timein(employee_id, currentDate, time_in)
            //         console.log(loggedIn)
            //         if (loggedIn) {
            //             res.status(200).send({log_in: loggedIn});
            //         }
            //     }
            //     // USER WANTS TO TIME OUT
            //     if (time_type === 'timeout') {
            //         const loggedOut = await attendances.timeout(employee_id, time_out, currentDate)
            //         if (loggedOut) {
            //             res.status(200).send({log_out: loggedOut});
            //         }
            //     }
            // }

            
            

        } catch (err) {
            console.log(err)
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
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
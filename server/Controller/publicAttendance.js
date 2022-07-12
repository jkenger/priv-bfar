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
                if (!emp_code) {
                    throw Error(`Please enter valid employee code!`)
                }
                throw Error(`ID Number: ${emp_code}, not recognized by the system!`)
            } else {
                // ASSIGN EMPLOYEE TABLE ID
                const _id = result._id
                // // CURRENT ISO DATE AND TIME
                // const currentISODate = new Date()
                // currentISODate.setTime(currentISODate.getTime() - new Date().getTimezoneOffset() * 60 * 1000); // convert to local time zone
                // // const officeISOEndTime = new Date().toISOString().split('T')[0] + 'T11:59:59.000Z';
                // const officeISOEndTime = '2022-07-10T11:59:59.000Z';
                // const OFFICE_AM_END_TIME = new Date(officeISOEndTime)

                // if (time_type === 'timein') {
                    // // AM
                    // console.log('time in')
                    // console.log(currentISODate <= OFFICE_AM_END_TIME)
                    // console.log(currentISODate, OFFICE_AM_END_TIME)

                    // if(currentISODate <= OFFICE_AM_END_TIME){
                    //     console.log('AM')
                        
                    // }
                    // const attendance = await attendances.am_attendance(emp_code, _id, time_type) // pass emp code, emp table id
                    //     if (attendance) { res.status(200).send({ log_in: attendance }); }
                    const attendance = await attendances.am_attendance(emp_code, _id, time_type) // pass emp code, emp table id
                        if (attendance) { res.status(200).send({ log_in: attendance }); }
                    // //PM
                    // if(currentISODate > OFFICE_AM_END_TIME){
                    //     const result = await attendances.pm_attendance(emp_code, _id, time_type) // pass emp code, emp table id
                    //     if (result) {
                    //         res.status(200).send({ log_in: result });
                    //     }
                    // }
                // }
                // if (time_type === 'timeout') {
                //     // AM
                //     if(currentISODate > OFFICE_AM_END_TIME){
                //         const result = await attendances.am_attendance(emp_code, _id, time_type) // pass emp code, emp table id
                //         if (result) {
                //             res.status(200).send({ log_in: result });
                //         }
                //     }
                //     // const result = await attendances.timeout(emp_code, _id)
                //     // if (result) {
                //     //     res.status(200).send({ log_out: result });
                //     // }
                // }
            }
        } catch (err) {
            console.log(err)
            const error = errorHandler(err)
            res.status(500).send({ err: error })
        }
    }
}

exports.case = async(req,res)=>{
    res.render('Case', {url: req.url});
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

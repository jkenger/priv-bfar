const { errorHandler, fetchData } = require('./services/services')
const employees = require('../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { query } = require('express')

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
    if (req.query) {
        const fromDate = `${(req.query.from.includes('T')) ? req.query.from : req.query.from + 'T00:00:00.000Z'}`
        const toDate = `${(req.query.to.includes('T')) ? req.query.to : req.query.to + 'T23:59:59.999Z'}`
        console.log(fromDate)
        console.log(toDate)
        try {
            // Query the employee table
            await employees.aggregate([
                {
                    // Select the attendance table
                    $lookup: {
                        from: 'attendances',
                        localField: 'emp_code',
                        foreignField: 'emp_code',
                        as: 'attendance',
                        let: { time_out: '$time_out'},
                        pipeline: [ 
                            {          // where time_out is not equal to ''
                                $match: { 
                                    time_out: { $ne: '' },
                                    date:{$gte: fromDate, $lte: toDate}
                                }
                            }
                        ]
                    }
                },
                {
                    // Join
                    $group: {
                        _id: "$_id",
                        emp_code: {$first: '$emp_code'},
                        name: {$first: '$name'},
                        designation: {$first: '$position'},
                        // sum up the total attendance
                        no_of_days: { $sum: { $size: "$attendance" } },
                        date: {$first: '$date'}
                    }
                },
                {
                    $sort:{
                        emp_code: 1
                    }
                }
            ]).then(async records => {
                console.log(records)
                res.status(200).send({records})
            })
        } catch (err) {
            console.log(err)
        }
    }
    
}
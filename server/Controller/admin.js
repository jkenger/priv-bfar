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
        const records = await attendances.find().sort({ emp_code: 1 });
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
        const pipeline = [
            {
                // Select the attendance table
                $lookup: {
                    from: 'attendances',
                    localField: 'emp_code',
                    foreignField: 'emp_code',
                    as: 'attendance',
                    let: {
                        time_in: '$time_in',
                        time_out: '$time_out'
                    },
                    pipeline: [
                        {
                            $match: {
                                time_out: { $ne: '' },
                                // date:{$gte: fromDate, $lte: toDate}
                            },
                        }
                    ]
                }
            },

            { // Join
                $group: {
                    _id: "$_id",
                    emp_code: { $first: '$emp_code' },
                    name: { $first: '$name' },
                    designation: { $first: '$position' },
                    // sum up the total attendance
                    no_of_days: { $sum: { $size: "$attendance" } }
                }
            },
            {
                $lookup: {
                    from: 'attendances',
                    localField: 'emp_code',
                    foreignField: 'emp_code',
                    as: 'attendance',
                    let: {
                        time_in: '$time_in',
                        time_out: '$time_out'
                    },
                    pipeline: [
                        {
                            $match: {
                                time_out: { $ne: '' },
                                // date:{$gte: fromDate, $lte: toDate}
                            },

                        },
                        {
                            $project:
                            {
                                _id: '$emp_code',
                                duration:
                                {
                                    $dateDiff: {
                                        startDate: "$time_in", endDate: "$time_out", unit: "hour"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: '$_id',
                                no_of_hours: { $sum: '$duration' }
                            }
                        }
                    ]
                }
            },
             { // Join
                $group: {
                    _id: "$_id",
                    emp_code: { $first: '$emp_code' },
                    name: { $first: '$name' },
                    designation: { $first: '$designation' },
                    // sum up the total attendance
                    no_of_days: { $first: '$no_of_days' },
                    no_of_hours: {$first: '$attendance'}
                }
            },
            {
                $unwind:'$no_of_hours'
            },
            {
                $group: {
                    _id: "$_id",
                    emp_code: { $first: '$emp_code' },
                    name: { $first: '$name' },
                    designation: { $first: '$designation' },
                    // sum up the total attendance
                    no_of_days: { $first: '$no_of_days' },
                    no_of_hours: {$first: '$no_of_hours.no_of_hours'}
                }
            },
            { $sort: { emp_code: 1 } }
        ]
        try {
            // Query the employee table
            await employees.aggregate(pipeline).then(async records => {
                console.log(records)
                res.status(200).send({ records })
            })
        } catch (err) {
            console.log(err)
        }
    }

}
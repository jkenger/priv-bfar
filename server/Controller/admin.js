const { errorHandler, fetchData } = require('./services/services')
const employees = require('../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { query } = require('express')
const moment = require('moment')

module.exports = {
    // GET TOTAL EMPLOYEE
    employees_count_get: async (req, res) => {
        try {
            const empC = await employees.find().count()
            res.status(200).send({ empC })
        } catch (err) { res.status(500).send(err) }
    },
    // GET ALL THE EMPLOYEE
    employees_get: async (req, res) => {
        try {
            const emp = await employees.find()
            res.status(200).send({ emp })
        } catch (err) { res.status(500).send(err) }
    },

    delete_attendance: async (req, res) => {
        try {
            const data = await attendances.updateMany({$ne: {emp_code: ''}}, {am_office_in: '2022-07-26T00:00:00.000+00:00', pm_office_in: '2022-07-26T05:00:00.000+00:00'})
            console.log(data)
        } catch (err) { res.status(500).send(err) }
    },
    records_get: async (req, res) => {
        try {
            const records = await attendances.find().sort({ date: -1 });
            res.status(200).send({ records })
        } catch (err) { res.status(500).send(err) }
    },
    payroll_get: async (req, res) => {
        if (req.query) {
            // const fromDate = new Date(`${(req.query.from.includes('T')) ? req.query.from : req.query.from + 'T00:00:00.000+00:00'}`)
            
            const fromDate = new Date(req.query.from)
            const toDate = new Date(req.query.to)
            console.log(fromDate)
            console.log(toDate)
            const calendarDays = 12
            

            // TODO//
            // QUERY AND JOIN EMPLOYEE AND ATTENDANCE DOCUMENT
            // WHERE IT WILL RETURN:
            // EMPLOYEE CODE, NAME, NUMBER OF DAYS, NUMBER OF ABSENTEE, TOTAL UNDERTIME.
            // NO. OF DAYS MUST: 
            // NOT INCLUDE WEEKENDS AS DAILY ATTENDANCE.
            // CONSIDER HOLIDAYS 1 DAY IF: THE EMPLOYEE ATTENDED BEFORE THE HOLIDAY DATE.
            // ELSE: EMPLOYEE WILL BE MARKED AS ABSENT FOR 2 WORKING DAYS.


            // PIPELINES
            const pipeline = [
                {$lookup: {
                    from: 'attendances',
                    localField: 'emp_code',
                    foreignField: 'emp_code',
                    as: 'attendances',
                    let: { time_in: '$time_in', time_out: '$time_out' },
                    pipeline: [{ $match: { $or: [{pm_time_out: { $ne: '' }}, {am_time_out: {$ne: ''}}], date: { $gte: fromDate, $lte: toDate } } }] // NOTE: fromdate and todate should be formatted for accurate results
                }},
                // IF ONE ATTENDANCE TIME OUT IS EMPTY, COUNT AS HALF or .5 
                { $unwind: '$attendances' },
                {$project: {
                    _id: '$emp_code',
                    emp_code: 1,
                    name: 1,
                    salary: 1,
                    designation: '$position',
                    isLate: '$attendances.isLate',
                    full_days: { $sum: 1 },
                    no_of_days: { $cond: { if: { $eq: ['$attendances.isHalf', true] }, then: { $sum: .5 }, else: { $sum: 1 } } },
                    am_office: '$attendances.am_office_in',
                    pm_office: '$attendances.pm_office_in',
                    am: '$attendances.am_time_in',
                    pm: '$attendances.pm_time_in'
                    // no_of_undertime: { $dateDiff: { startDate: "$attendances.am_office_in", endDate: "$attendances.am_time_in", unit: "minute" }}
                    
                }},
                {$addFields: {
                    // return 0 if time in has negative value; negative value denotes that the employee is not late for that shift
                    no_of_undertime: {$cond: {
                        if: {$eq: ['$isLate', false]}, 
                        then: 0, 
                        else: {$sum: [
                            {$cond: {
                                if: {$lt: [{ $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" }}, 0]}, 
                                then: 0, 
                                else: { $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" }}
                            }}, 
                            {$cond: {
                                if: { $lt: [{ $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" }}, 0]}, 
                                then: 0, 
                                else: { $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" }}
                        }}
                    ]}}}
                }},
                {$group: {
                    _id: '$_id',
                    emp_code: {$first: '$emp_code'},
                    name: { $first: '$name' },
                    designation: { $first: '$designation' },
                    salary: {$first: '$salary'},
                    no_of_days: { $sum: '$no_of_days' },
                   full_days: {$sum: '$full_days'},
                    no_of_undertime: {$sum: '$no_of_undertime'} // removed for testing purposes
                    // full_days: {$first: 13},
                    // no_of_undertime: {$first: 32} // test
                    
                }},
                {$addFields: { 
                    // if this employee have no absentee, monthly salary will be divided by 2 and return the 2 weeks rate.
                    week2_rate: {$divide: ['$salary', 2]},
                    no_of_absents: {$cond: {
                        if:{$lt: [{ $subtract: [calendarDays, '$full_days'] }, 0]},
                        then: 0,
                        else: { $subtract: [calendarDays, '$full_days'] }
                    }},

                    // IF HAS ABSENTEE, RETRIEVE ABSENTEE DEDUCTION
                    hasab_deduction: {$let: {
                        vars: { 
                            daily_rate: {$round: [{$divide: [{$divide: ['$salary', 2]}, calendarDays]}, 2]},
                            no_of_absents:  {$cond: {
                                if:{$lt: [{ $subtract: [calendarDays, '$full_days'] }, 0]},
                                then: 0,
                                else: { $subtract: [calendarDays, '$full_days'] }
                            }}
                        },
                        in: {$round: [{$multiply: ['$$no_of_absents', '$$daily_rate']},2]}
                    }},

                    // IF HAS UNDERTIME, RETRIEVE UNDERTIME DEDUCTION
                    ut_deduction: {$let:{ 
                    // ut_deduction = (((dailyrate / 8hr) / 60 secs) * 32) * no_of_undertime
                        vars:{
                            week2_rate: {$divide: ['$salary', 2]},
                            daily_rate: {$round: [{$divide: [{$divide: ['$salary', 2]}, calendarDays]}, 2]},
                        },
                        in:{$round: [{$multiply: [{$divide: [{$divide: ['$$daily_rate', 8]}, 60]}, '$no_of_undertime']},2]}
                    }},
                }},
                {$group: {
                    _id: '$_id',
                    emp_code: {$first: '$emp_code'},
                    name: { $first: '$name' },
                    designation: { $first: '$designation' },
                    salary: {$first: '$salary'},
                    no_of_days: { $first: '$no_of_days' },
                    no_of_absents: {$first: '$no_of_absents'},
                    no_of_undertime: {$first: '$no_of_undertime'},
                    gross_salary: {$first: '$week2_rate'},
                    hasab_deduction: {$first: '$hasab_deduction'},
                    ut_deduction: {$first: '$ut_deduction'}
                }},
                {$addFields: {
                    // 
                    gross_salary: {$round: [{$subtract: ['$gross_salary', {$sum: ['$hasab_deduction', '$ut_deduction']}]},2]}
                }},
                // {$addFields: {
                //     weekly_rate: {$divide: ['$salary', 2]}, // if this employee have no absentee, monthly salary will be divided by 2 and return the 2 weeks rate.
                //     daily_rate: {$round: [{$divide: [{$divide: ['$salary', 2]}, calendarDays]}, 2]}, // daily rate

                //     // IF HAS ABSENTEE, RETRIEVE THE DEDUCTION THE SUBTRACT WITH THE 2WKs RATE
                //     deduction: {$multiply: ['$no_of_absents',{$round: [{$divide: [{$divide: ['$salary', 2]}, calendarDays]}, 2]}]}, // deduction
                    
                //     // gross amount = 2wks rate - deduction
                //     //INSERT THE CONDITION HERE WHETHER THE EMPLOYEE HAS DEDUCTION OR NOT
                //     nout_nondeducted_ga: {$divide: ['$salary', 2]}, // with no absent
                //     nout_deducted_ga: {$subtract: [{$divide: ['$salary', 2]}, {$multiply: ['$no_of_absents',{$round: [{$divide: [{$divide: ['$salary', 2]}, calendarDays]}, 2]}]}]} //with absentee

                //     // IF EMPLOYEE HAS UNDERTIME OR NUMBER OF MINUTES BY LATE, PERFORM THE FOLLOWING THEN RETURN AS NEW GROSS AMOUNT: 
                //     // IF NOT, RETURN THE RESULT OF GROSS AMOUNT ABOVE
                // }},
                /* TODO 
                    Create a query where it will return the total minutes of undertime 
                    If every employee's time in has gone above the given office time by isLate as true.
                */

                // {$group: { // Join
                //         _id: "$_id",
                //         emp_code: { $first: '$emp_code' },
                //         name: { $first: '$name' },
                //         designation: { $first: '$position' },
                //         // sum up the total attendance
                //         no_of_days: { $sum: { $size: "$attendance" } }
                // }},
                // {$lookup: {
                //         from: 'attendances',
                //         localField: 'emp_code',
                //         foreignField: 'emp_code',
                //         as: 'attendance',
                //         let: { time_in: '$time_in', time_out: '$time_out' },
                //         pipeline: [ {$match: { time_out: { $ne: '' },date: { $gte: fromDate, $lte: toDate } }},
                //             { $project: {
                //                     _id: '$emp_code',
                //                     duration:
                //                     { $dateDiff: { startDate: "$time_in", endDate: "$time_out", unit: "hour" }}
                //             }},
                //             { $group: {
                //                     _id: '$_id',
                //                     no_of_hours: { $sum: '$duration' }
                //             }} ]
                // }},
                // {$group: { // Join
                //         _id: "$_id",
                //         emp_code: { $first: '$emp_code' },
                //         name: { $first: '$name' },
                //         designation: { $first: '$designation' },
                //         // sum up the total attendance
                //         no_of_days: { $first: '$no_of_days' },
                //         no_of_hours: { $first: '$attendance' }
                // }},

                // ------------GET THE NUMBER OF DAYS INCLUDING HALFS-------------

                // {
                //     $unwind: '$attendance'
                //   },
                //   {
                //     $project: {
                //       '_id': '$name',
                //       'status': '$attendance.status',
                //       'attendance': {$cond: {
                //       if: {
                //         $eq: ['$attendance.status', 'full']}, 
                //         then: {
                //           $sum: 1
                //         },
                //         else:{
                //           $sum: .5
                //         }
                //       }
                //       }
                //     }
                //   },
                //   {
                //     $group: {
                //       _id: '$_id',
                //       'no_of_days': {$sum: '$attendance'}
                //     }
                //   }
                // --------------------------------------------------------------

                // {
                //     $unwind:'$no_of_hours'
                // },
                // {
                //     $group: {
                //         _id: "$_id",
                //         emp_code: { $first: '$emp_code' },
                //         name: { $first: '$name' },
                //         designation: { $first: '$designation' },
                //         // sum up the total attendance
                //         no_of_days: { $first: '$no_of_days' },
                //         no_of_hours: {$first: '$no_of_hours.no_of_hours'}
                //     }
                // },
                { $sort: { emp_code: 1 } }
            ]
            try {
                // QUERY PAYROLL RECORDS CONDITION
                await employees.aggregate(pipeline).then(async records => {
                    console.log(records)
                    res.status(200).send({ records })
                })
            } catch (err) {
                res.status(500).send(err)
                console.log(err)
            }
        }

    }
}


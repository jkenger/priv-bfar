const { errorHandler, fetchData } = require('./services/services')
const employees = require('../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { query } = require('express')
const  moment  = require('moment')

module.exports = {
    // GET TOTAL EMPLOYEE
    employees_count_get: async (req, res) => {
        const empC = await employees.find().count()
        res.status(200).send({ empC })
    },
    // GET ALL THE EMPLOYEE
    employees_get: async (req, res) => {
        const emp = await employees.find()
        res.status(200).send({ emp })
    },

    delete_attendance : async (req, res) => {
        try {
            const data = await attendances.deleteMany({})
            console.log(data)
        } catch (err) {
            console.log(err)
        }
    },
    records_get : async (req, res) => {
        try {
            const records = await attendances.find().sort({ date: -1 });
            res.status(200).send({ records })
        } catch (err) {
            console.log(err)
        }
    },
    payroll_get : async (req, res) => {
        if (req.query) {
            // const fromDate = new Date(`${(req.query.from.includes('T')) ? req.query.from : req.query.from + 'T00:00:00.000+00:00'}`)
            const fromDate = new Date(req.query.from)
            const toDate = new Date(req.query.to)
            console.log(fromDate)
            console.log(toDate)
            
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
    
                //JOIN THE EMPLOYEE AND ATTENDANCE MODEL TOGETHER
                {$lookup: {
                    from: 'attendances',
                    localField: 'emp_code',
                    foreignField: 'emp_code',
                    as: 'attendance',
                    let: { time_in: '$time_in', time_out: '$time_out' },
                    pipeline:   [{ $match: { pm_time_out: { $ne: '' }, date: { $gte: fromDate, $lte: toDate}} }] // NOTE: fromdate and todate should be formatted for accurate results
                }},
                // IF ONE ATTENDANCE TIME OUT IS EMPTY, INITIATE AS HALF or .5 
                {$unwind: '$attendance' },
                {$project: {
                    _id: '$emp_code',
                    name: 1,
                    isHalf: '$attendance.isHalf',
                    attendance: {$cond: { if: { $eq: ['$attendance.isHalf', true]}, then: {$sum: .5}, else:{$sum: 1} }}
                }},
                {$group:{
                    _id: '$_id',
                    name: {$first: '$name'},
                    attendances: {$sum: '$attendance'}
                }},
                

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
                { $sort: { date: 1 } }
            ]
            try {
                // QUERY PAYROLL RECORDS
                await employees.aggregate(pipeline).then(async records => {
                    console.log(records)
                    res.status(200).send({ records })
                })
            } catch (err) {
                console.log(err)
            }
        }
    
    }
}


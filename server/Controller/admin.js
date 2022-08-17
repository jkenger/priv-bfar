const { errorHandler, fetchData } = require('./services/services')
const employees = require('../Model/EmployeesSchema')
const attendances = require('../Model/Attendance')
const { query } = require('express')
const moment = require('moment')

module.exports = {
    // get total employee count
    employees_count_get: async (req, res) => {
        try {
            const result = await employees.find().count()
            if(!result) res.status(500).send('Failure to find any data.')
            res.status(200).send({result})
        } catch (e) { res.status(500).send(e) }
    },

    // employee controllers
    readEmployees: async (req, res) => {
        try {
            const result = await employees.find()
            if(!result) res.status(500).send('Failure to find any data')
            else res.status(200).send({result})

        } catch (e) { res.status(500).send(e) }
    },
    viewEmployee: async (req, res) => {
        try{
            const id = req.query.id
            if (!id) res.status(500).send('Failutre to process the given id')
            
            const result = await employees.findById(id)
            if(!result) res.status(500).send('Failure to find any document by the id')
            else res.status(200).send({result})
        }catch(e) {res.status(500).send(e)}
            
    },
    addEmployee: async (req, res) => {
        try {
            const doc = req.body
            console.log(doc)
            const result = await employees.create(doc)
            
            if(!result) res.status(500).send('Failure to process creation')
            else res.status(200).send({result})
        } catch (e) { 
            const error = errorHandler(e)
            res.status(500).send({err: error}) 
        }
    },
    updateEmployee: async (req, res) => {
        try {
            const id = req.params.id
            const update = req.body
            if(!id) res.status(500).send('Failure to process the given id')

            const result = await employees.updateOne({_id: id}, {$set: update})
            if(!result) res.status(500).send('Failure to update the employee')
            res.status(200).send(result)
        } catch (e) { res.status(500).send(e) }
    },
    deleteEmployee: async (req, res) => {
        try {
            const id = req.params.id
            res.send(id)
        } catch (e) { res.status(500).send(e) }
    },

    // test/ delete all attendances
    delete_attendance: async (req, res) => {
        try {
            const data = await attendances.updateMany({$ne: {emp_code: ''}}, {am_office_in: '2022-07-26T00:00:00.000+00:00', pm_office_in: '2022-07-26T05:00:00.000+00:00'})
            console.log(data)
        } catch (e) { res.status(500).send(e) }
    },

    // get all records
    records_get: async (req, res) => {
        try {
            const records = await attendances.find().sort({ date: -1 });
            res.status(200).send({records})
        } catch (e) { res.status(500).send(e) }
    },

    // get payroll transaction
    payroll_get: async (req, res) => {
        if (req.query) {
            // const fromDate = new Date(`${(req.query.from.includes('T')) ? req.query.from : req.query.from + 'T00:00:00.000+00:00'}`)
            
            const fromDate = new Date(req.query.from)
            const toDate = new Date(req.query.to)
            console.log(req.query.to)
            console.log(fromDate)
            console.log(toDate)
            const holiDate = new Date('2022-09-06') // from user
            const holiDateBefore = new Date('2022-09-05') // from user
            
            const calendarDays = 11 // from user


            // TODO//
            // QUERY AND JOIN EMPLOYEE AND ATTENDANCE DOCUMENT
            // WHERE IT WILL RETURN:
            // EMPLOYEE CODE, NAME, NUMBER OF DAYS, NUMBER OF ABSENTEE, TOTAL UNDERTIME.
            // NO. OF DAYS MUST: 
            // NOT INCLUDE WEEKENDS AS DAILY ATTENDANCE.
            // CONSIDER HOLIDAYS 1 DAY IF: THE EMPLOYEE ATTENDED BEFORE THE HOLIDAY DATE.
            // ELSE: EMPLOYEE WILL BE MARKED AS ABSENT FOR 2 WORKING DAYS.

            // DO NOT COUNT SATURDAYS
            // FIND A WAY TO 


            // PIPELINES
            const pipeline = [
                {$lookup: {
                    from: 'attendances',
                    localField: 'emp_code',
                    foreignField: 'emp_code',
                    as: 'attendances',
                    let: { time_in: '$time_in', time_out: '$time_out' },
                    pipeline: [{ $match: { $or: [{am_time_out: {$ne: null}}, {pm_time_out: {$ne: null}}],date: { $gte: fromDate, $lte: toDate } } }] // NOTE: fromdate and todate should be formatted for accurate results
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
                    whalf_days: { $cond: {if: { $eq: ['$attendances.isHalf', true] }, then: { $sum: .5 }, else: { $sum: 1 }} },// 
                    am_office: '$attendances.am_office_in',
                    pm_office: '$attendances.pm_office_in',
                    am: '$attendances.am_time_in',
                    pm: '$attendances.pm_time_in',
                    // no_of_undertime: { $dateDiff: { startDate: "$attendances.am_office_in", endDate: "$attendances.am_time_in", unit: "minute" }}
                    created_from: '$attendances.date'
                    
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
                    ]}}},

                    // HOLIDAY LOGIC HERE
                    holiday: {$let:{
                        vars: {
                            holiday_date: {$cond: { // get the holiday date, return 0 if there is no holiday given
                                if: {$and: [{$gte:[holiDate, fromDate]}, {$lte: [holiDate, toDate]} ]},
                                then: holiDate,
                                else: 0
                            }},
                            holiday_date_before:  {$cond: { // get the holiday date, return 0 if there is no holiday given
                                if: {$and: [{$gte:[holiDateBefore, fromDate]}, {$lte: [holiDateBefore, toDate]} ]},
                                then: holiDateBefore,
                                else: 0
                            }},
                            date: '$created_from'
                        },
                         // check each document if the user attended before the holiday date.
                        in: {$cond: {
                                if: {$eq: ['$$holiday_date', 0]},
                                then: 0, // if no holiday
                                else: {$cond:{
                                    if: {$and: [{$gte: ['$$date', '$$holiday_date_before']}, {$lte: ['$$date', '$$holiday_date']}]},
                                    then: 1, //if there is holiday
                                    else: 2, // user didn't meet the condition 
                                }}
                        }}
                    }},
                    // 
                }},


                {$group: {
                    _id: '$_id',
                    emp_code: {$first: '$emp_code'},
                    name: { $first: '$name' },
                    designation: { $first: '$designation' },
                    salary: {$first: '$salary'},
                    holiday: {$first: '$holiday'},
                    whalf_days: {$sum: '$whalf_days'},
                    no_of_undertime: {$sum: '$no_of_undertime'}, 
                    // whalf_days: {$first: 11}, // test
                    // no_of_undertime: {$first: 32} // test
                    
                }},
                {$addFields: { 
                    week2_rate: {$divide: ['$salary', 2]},
                    whalf_days: {$switch: {
                        branches:[
                            {case: {$eq: ['$holiday', 0]}, then: '$whalf_days'},                // no holiday, no additions
                            {case: {$eq: ['$holiday', 1]}, then: {$cond: {                      // add 1 day
                                if: {$gte: [{$sum: ['$whalf_days', '$holiday']}, calendarDays]}, 
                                then: calendarDays, 
                                else: {$sum: ['$whalf_days', '$holiday']}}}
                            },
                            {case: {$eq: ['$holiday', 2]}, then: {$subtract: ['$whalf_days', 1]}} // deduct 1 day
                        ]
                     }},

                    no_of_absents: {$cond: {
                        if:{$lt: [{ $subtract: [calendarDays, {$sum: ['$whalf_days', '$holiday']}] }, 0]},
                        then: 0,
                        else: { $subtract: [calendarDays, {$sum: ['$whalf_days', '$holiday']}] }
                    }},

                    // IF HAS ABSENTEE, RETRIEVE ABSENTEE DEDUCTION
                    hasab_deduction: {$let: {
                        vars: { 
                            daily_rate: {$round: [{$divide: [{$divide: ['$salary', 2]}, calendarDays]}, 2]},
                            no_of_absents:  {$cond: {
                                if:{$lt: [{ $subtract: [calendarDays, {$sum: ['$whalf_days', '$holiday']}] }, 0]},
                                then: 0,
                                else: { $subtract: [calendarDays, {$sum: ['$whalf_days', '$holiday']}] }
                            }}
                        },
                        in: {$round: [{$multiply: ['$$no_of_absents', '$$daily_rate']},2]}
                    }},

                    // IF HAS UNDERTIME, RETRIEVE UNDERTIME DEDUCTION
                    ut_deduction: {$let:{ 
                    // ut_deduction = (((dailyrate / 8hr) / 60 secs) * 32) * no_of_undertime
                        vars:{
                            week2_rate: {$round: [{$divide: ['$salary', 2]},2]},
                            daily_rate: {$round: [{$divide: [{$divide: ['$salary', 2]}, calendarDays]}, 2]},
                        },
                        in:{$round: [{$multiply: [{$round: [{$divide: [{$divide: ['$$daily_rate', 8]}, 60]}, 2]}, '$no_of_undertime']},2]}
                    }},
                }},
                {$group: {
                    _id: '$_id',
                    emp_code: {$first: '$emp_code'},
                    name: { $first: '$name' },
                    designation: { $first: '$designation' },
                    salary: {$first: '$salary'},
                    holiday: {$first: '$holiday'}, // INCLUDED FOR TESTING PURPOSES
                    whalf_days: { $first: '$whalf_days' },
                    no_of_absents: {$first: '$no_of_absents'}, // INCLUDED FOR TESTING PURPOSES
                    no_of_undertime: {$first: '$no_of_undertime'}, // INCLUDED FOR TESTING PURPOSES
                    gross_salary: {$first: '$week2_rate'}, 
                    hasab_deduction: {$first: '$hasab_deduction'},
                    ut_deduction: {$first: '$ut_deduction'}
                }},
                {$addFields: {
                    gross_salary: {$round: [{$subtract: ['$gross_salary', {$sum: ['$hasab_deduction', '$ut_deduction']}]},2]}
                }},
                { $sort: { emp_code: 1 } }
            ]
            try {
                const result = await employees.aggregate(pipeline)
                if (!result) res.status(500).send('Invalid request')
                console.log(result)
                res.status(200).send({result})
            } catch (e) {
                res.status(500).send(e)
                console.log(e)
            }
        }

    }
}


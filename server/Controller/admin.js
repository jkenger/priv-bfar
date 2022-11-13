const { errorHandler, fetchData } = require('./services/services')
const { getFormattedDate } = require('./services/date')
const employees = require('../Model/employee')
const attendances = require('../Model/attendance')
const Holiday = require('../Model/holiday')
const TravelPass = require('../Model/Travelpass')
const { query } = require('express')
const moment = require('moment')
const { createIndexes } = require('../Model/employee')

module.exports = {
    // get total employee count
    employees_count_get: async (req, res) => {
        try {
            const result = await employees.find().count()
            if (!result) res.status(500).send({err: 'Failure to find any data'})
            res.status(200).send({ result })
        } catch (e) { res.status(500).send(e) }
    },

    // employee controllers
    readEmployees: async (req, res) => {
        try {
            const result = await employees.find()
            if (!result) res.status(500).send({err: 'Failure to find any data'})
            res.status(200).send({ result })

        } catch (e) { res.status(500).send(e) }
    },
    viewEmployee: async (req, res) => {
        try {
            const id = req.params.id
            if (!id) res.status(500).send({err: 'Failutre to process the given id'})

            const result = await employees.findById(id)
            if (!result) res.status(500).send({err: 'Failure to find any document by the id'})
            res.status(200).send({ result })
        } catch (e) { res.status(500).send(e) }

    },
    addEmployee: async (req, res) => {
        try {
            const doc = req.body
            console.log(doc)
            const result = await employees.create(doc)

            if (!result) res.status(500).send({err: 'Failure to process creation'})
            res.status(200).send({ result })
        } catch (e) {
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
    },
    updateEmployee: async (req, res) => {
        try {
            console.log('UPDATING')
            const id = req.params.id
            const update = req.body
            if (!req.body) { throw Error('Invalid input') }

            if (!id) res.status(500).send({err: 'Failure to process the given id'})

            const result = await employees.updateOne({ _id: id }, { $set: update })
            if (!result) res.status(500).send({err: 'Failure to update the employee'})
            res.status(200).send(result)
        } catch (e) {
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
    },
    deleteEmployee: async (req, res) => {
        console.log('ASDASDS')
        try {
            const id = req.params.id
            if (!id) res.status(500).send({err: 'Failure to process the given id'})
            const result = await employees.findOneAndDelete({ _id: id })
            if (!result) res.status(500).send({err: 'Failure to delete employee'})
            res.status(200).send(result)
        } catch (e) { res.status(500).send(e) }
    },

    // test/ delete all attendances
    testdelete: async (req, res) => {
        try {
            const result = await attendances.deleteMany({am_time_in: 'T.O'})
            res.send(result)
        } catch (e) { res.status(500).send(e) }
    },

    // events || holiday and traver orders
    readHoliday: async(req, res) =>{
        try{
            const result = await Holiday.find()
            res.status(200).send(result)
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
        
    },
    readTravelPass: async(req, res) =>{
        try{
            const result = await TravelPass.find()
            res.status(200).send(result)
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
    },
    addHoliday: async(req, res) =>{
        try{
            const {name, predate, date} = req.body
            const formattedDate = getFormattedDate()
            var from = new Date(predate)
            var to = new Date(date)
            var currentDate = new Date(formattedDate)
            console.log(from, to)
            if(from < currentDate) {
                const error = errorHandler({message: 'Given date must be equal or ahead of the current date'})
                res.status(500).send({err: error })
            }

            if(to < from){
                const error = errorHandler({message: 'Holiday must be ahead of prerequisite date'})
                res.status(500).send({ err: error })
            }

            if(from >= currentDate && to >= from){
                const schema = {
                    name: name,
                    preDate: predate,
                    date: date
                }
                const result = await Holiday.create(schema)
                if(!result){
                    res.status(500).send('failure to create data.')
                }
                res.status(200).send(result)
            }
            
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
    },

    addTravelPass: async (req, res) => {
        try {
            // PROBLEM
            const { emp_code, name, fromDate, toDate } = req.body
            
            const formattedDate = getFormattedDate()
            var from = new Date(fromDate)
            var to = new Date(toDate)
            var currentDate = new Date(formattedDate)
            var docs = []
            console.log('travel', fromDate, toDate)

            const attendance = await attendances.findOne({
                emp_code: emp_code,
                $and: [{date: {$gte: from}}, {date: {$lte: to}}],
                am_time_in: { $ne: '' }
            })
            console.log(attendance)
            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            // NOTE: date should be formatted to local date.
            if (!attendance) {   
                console.log('ATTENDANCE')
                employees.findOne({emp_code: emp_code})
                .then(async (employee, err)=>{
                    if(err){
                        res.status(500).send({err: "System can't find employee with this id"})
                    }else if(!fromDate || !toDate) {
                        const error = errorHandler({message: 'Dates are required'})
                        res.status(500).send({ err: error })
                    }else  if(from < currentDate) {
                        const error = errorHandler({message: 'Given date must be equal or ahead of the current date'})
                        res.status(500).send({err: error})
                    }else if(to < from){
                        const error = errorHandler({message: 'Date must be ahead of prerequisite date'})
                        res.status(500).send({ err: error })
                    }else{
                        TravelPass.find({emp_code: emp_code, date_added: ({$gte:moment(from).startOf('isoweek').toDate()} || {$lte:moment(to).startOf('isoweek').toDate()})})
                            .then(documents =>{
                                let existingDoc = []
                                console.log('date: ', documents)
                                console.log('from-to', moment(from).startOf('isoweek').toDate(), moment(to).endOf('isoweek').toDate())
                                for(let i = 0; i < documents.length; i++){
                                    if(documents[i].from_date >= from || to <= documents[i].to_date){
                                        existingDoc.push(documents[i])
                                    }
                                }
                                console.log('valid Documents:', existingDoc)
                                if(existingDoc.length){
                                    const error = errorHandler({message: 'Selected date were already given'})
                                    res.status(500).send({ err: error })
                                }
                                if(!existingDoc.length){
                                    TravelPass.insertMany({
                                        emp_code: employee.emp_code,
                                        emp_id: employee._id,
                                        name: employee.name,
                                        from_date: from,
                                        to_date:to,
                                        date_added: from
                                    })
                                        .then(async (pass, err)=>{
                                            console.log('pass:', pass)
                                            if(err){
                                                res.status(500).send({err: 'Failed creating travel pass'})
                                            }
                                            if(pass){
                                                //loop for every day
                                                for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {
                                                    
                                                    var newDay = new Date(day.setDate(day.getDate()))
                                                    docs.push({
                                                        emp_code: employee.emp_code,
                                                        emp_id: employee._id,
                                                        name: employee.name,
                                                        date: newDay,
                                                        date_string: newDay.toLocaleDateString(),
                                                        isHalf: 'false',
                                                        message: 'T.O',
                                                    })
                                                }
                                                // [done] NOTE: attendance document not inserting as subdocument from the travel order
                                                // TO DO: attendances must be deleted from the originally collection when a user deleted a travel order record.
                                                attendances.insertMany(docs)
                                                .then(result=>{
                                                    TravelPass.findOneAndUpdate(
                                                        {_id: pass[0]._id},
                                                        {$push: {attendances: result}}
                                                    )
                                                    .then(result=>{
                                                        res.status(200).send(result)
                                                    })
                                                })
                                                    
                                                

                                            }
                                        })
                                }
                            })
                    }
                })
            } else{ res.status(500).send({err: 'Failed to process event creation. Employee might already attended between the selected date'})}
        } catch (e) { res.status(500).send(e) }
    },

    deleteTravelPass: async(req, res)=>{
        try{
            const id = req.params.id
            TravelPass.findOneAndDelete({_id: id})
                .then((result, err)=>{
                    const resLength = result.attendances.length
                    const dataId = []
                    if(result){
                        if(resLength > 1){
                            result.attendances.forEach(data=>{
                                dataId.push(data._id)
                            })
                        }else{
                            dataId.push(result.attendances[0]._id)
                        }
                        if(dataId.length){
                            attendances.deleteMany({_id: {$in: dataId}})
                                .then((result, err)=>{
                                    res.status(200).send({
                                        dataId: dataId,
                                        datas: result   
                                    })
                                })
                            
                        }else{
                            res.status(501).send({err:'No IDS Found.'})
                        }
                    }else{
                        res.status(501).send({err:'Failed to process deletion. Try again later.'})
                    }
                })
            
            
        }catch(e){
            res.status(500).send(e)
        }
    },

    // get all records
    readRecords: async (req, res) => {
        try {
            const records = await attendances.find().sort({ date: -1 });
            res.status(200).send({ records })
        } catch (e) { res.status(500).send(e) }
    },

    // get payroll transaction
    readPayrolls: async (req, res) => {
        if (req.query) {
            // const fromDate = new Date(`${(req.query.from.includes('T')) ? req.query.from : req.query.from + 'T00:00:00.000+00:00'}`)
            const fromDate = new Date(req.query.from)
            const toDate = new Date(req.query.to)
            console.log(req.query.to)
            console.log(fromDate)
            console.log(toDate)

            // variables that must be retrive from the client
            const holiDate = new Date('2022-09-06') // from user
            const holiDateBefore = new Date('2022-09-05') // from user
           // const holidays = await Holiday.find().sort({date: 1})

            // let holidayDates = []
            // holidays.forEach(holiday=>{
            //     let date = new Date(holiday.date)
            //     // if holiday date is within two queried date, add as valid holiday dates.
            //     if(fromDate < date && toDate > date){
            //         holidayDates.push({
            //             preDate: holiday.preDate,
            //             date: holiday.date
            //         })
            //     }
            // })

            // console.log(holidayDates)

            const calendarDays = 11 // from user

            const tax = 0.02
            



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
                    pipeline: [{ $match: { $or: [{$or: [{am_time_out: { $ne: null }}, {$or: [{am_time_in: 'T.O'}, {am_time_in: 'O.B'}]}]}, { pm_time_out: { $ne: null } }], date: { $gte: fromDate, $lte: toDate } } }] // NOTE: fromdate and todate should be formatted for accurate results
                    
                }},
                // IF ONE ATTENDANCE TIME OUT IS EMPTY, COUNT AS HALF or .5 
                {$unwind: '$attendances'},
                {$project: {
                        _id: '$emp_code',
                        emp_code: 1,
                        name: 1,
                        salary: 1,
                        designation: '$position',
                        isLate: '$attendances.isLate',
                        whalf_days: { $cond: { if: { $eq: ['$attendances.isHalf', true] }, then: { $sum: .5 }, else: { $sum: 1 } } },// 
                        am_office: '$attendances.am_office_in',
                        pm_office: '$attendances.pm_office_in',
                        am: '$attendances.am_time_in',
                        pm: '$attendances.pm_time_in',
                        // no_of_undertime: { $dateDiff: { startDate: "$attendances.am_office_in", endDate: "$attendances.am_time_in", unit: "minute" }}
                        created_from: '$attendances.date'

                }},
                {$addFields: {
                    no_of_undertime: {$cond: {
                        if: { $eq: ['$isLate', false] },
                        then: 0,
                        else: {
                            $sum: [{$cond:{
                                if: { $lt: [{ $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" } }, 0] },
                                then: 0,
                                else: { $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" } }
                            }},
                            {$cond: {
                                if: { $lt: [{ $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" } }, 0] },
                                then: 0,
                                else: { $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" } }
                            }}]}
                        }},
                    // HOLIDAY LOGIC HERE

                        // TASK:
                        // BETEEN TWO DATES CHECK IF THERE IS HOLIDAYS
                        // GET HOW MANY HOLIDAYS IS IN TWO DATES
                    holiday: {$let: {
                        vars: {
                            holiday_date: {$cond: {
                                if: { $and: [{ $gte: [holiDate, fromDate] }, { $lte: [holiDate, toDate] }] },
                                then: holiDate,
                                else: 0
                            }},
                            holiday_date_before: {$cond: { // get the holiday date, return 0 if there is no holiday given
                                if: { $and: [{ $gte: [holiDateBefore, fromDate] }, { $lte: [holiDateBefore, toDate] }] },
                                then: holiDateBefore,
                                else: 0
                            }},
                            date: '$created_from'
                        },
                            // check each document if the user attended before the holiday date.
                        in: {$cond: {
                            if: { $eq: ['$$holiday_date', 0] },
                            then: 0, // if no holiday
                            else: {$cond:{
                                if: { $and: [{ $gte: ['$$date', '$$holiday_date_before'] }, { $lte: ['$$date', '$$holiday_date'] }] },
                                then: 1, //if there is holiday
                                else: 2, // user didn't meet the condition 
                            }}
                        }}
                    }},
                }},
                {$group: {
                    _id: '$_id',
                    emp_code: { $first: '$emp_code' },
                    name: { $first: '$name' },
                    designation: { $first: '$designation' },
                    salary: { $first: '$salary' },
                    // holiday: { $first: '$holiday' },
                    whalf_days: { $sum: '$whalf_days' },
                    no_of_undertime: { $sum: '$no_of_undertime' },
                    holiday: { $first: 1 },
                    // whalf_days: {$first: 11}, // test
                    // no_of_undertime: {$first: 0} // test
                }},
                {$addFields: {
                    week2_rate: { $divide: ['$salary', 2] },
                    whalf_days: {
                        $switch: {
                            branches: [
                                {case: { $eq: ['$holiday', 0] }, then: '$whalf_days' },                // no holiday, no additions
                                {case: { $eq: ['$holiday', 1] }, then: {
                                    $cond: {
                                        if: {$gte: [{ $sum: ['$whalf_days', '$holiday'] }, calendarDays] },
                                        then: calendarDays,
                                        else: { $sum: ['$whalf_days', '$holiday'] }
                                    }
                                }},
                                { case: { $eq: ['$holiday', 2] }, then: { $subtract: ['$whalf_days', 1] } } // deduct 1 day
                            ]
                        }},

                        no_of_absents: {$cond: {
                            if: { $lt: [{ $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }, 0] },
                            then: 0,
                            else: { $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }
                        }},
                        // IF HAS ABSENTEE, RETRIEVE ABSENTEE DEDUCTION
                        hasab_deduction: { 
                            $let: {
                                vars: {
                                    daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                                    no_of_absents: {$cond: {
                                        if: { $lt: [{ $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }, 0] },
                                        then: 0,
                                        else: { $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }
                                    }
                                }},
                                in: { $round: [{ $multiply: ['$$no_of_absents', '$$daily_rate'] }, 2] }
                            }
                        },

                        // IF HAS UNDERTIME, RETRIEVE UNDERTIME DEDUCTION
                        // ut_deduction = (((dailyrate / 8hr) / 60 secs) * 32) * no_of_undertime
                        ut_deduction: {
                            $let: {
                                vars: {
                                    week2_rate: { $round: [{ $divide: ['$salary', 2] }, 2] },
                                    daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                                },
                                in: { $round: [{ $multiply: [{ $round: [{ $divide: [{ $divide: ['$$daily_rate', 8] }, 60] }, 2] }, '$no_of_undertime'] }, 2] }
                            }
                        },
                    }},
                    {$group: {
                        _id: '$_id',
                        emp_code: { $first: '$emp_code' },
                        name: { $first: '$name' },
                        designation: { $first: '$designation' },
                        salary: { $first: '$salary' },
                        holiday: { $first: '$holiday' }, // INCLUDED FOR TESTING PURPOSES
                        whalf_days: { $first: '$whalf_days' },
                        no_of_absents: { $first: '$no_of_absents' }, // INCLUDED FOR TESTING PURPOSES
                        no_of_undertime: { $first: '$no_of_undertime' }, // INCLUDED FOR TESTING PURPOSES
                        gross_salary: { $first: '$week2_rate' },
                        hasab_deduction: { $first: '$hasab_deduction' },
                        ut_deduction: { $first: '$ut_deduction' },
                    }},
                    {$addFields: {
                        whalf_days: {
                            $cond: {
                                if: {$gte:['$whalf_days', calendarDays]},
                                then: calendarDays,
                                else: '$whalf_days'
                            }
                        },
                        gross_salary: { $round: [{ $subtract: ['$gross_salary', { $sum: ['$hasab_deduction', '$ut_deduction'] }] }, 2] },
                            // (gross salary - 10417) *.02 // 2% Tax
                        tax_deduction: {$multiply: [{$subtract: ['$gross_salary', 10417]}, tax]},
                            // gross salary - tax deduction
                        net_amount_due: {$let:{
                            vars: {
                                gross_salary: { $round: [{ $subtract: ['$gross_salary', { $sum: ['$hasab_deduction', '$ut_deduction'] }] }, 2] },
                                tax_deduction: { $cond: {
                                    if: {$lt: [{$round: [{ $multiply: [{$round: [{$subtract: ['$gross_salary', 10417.00]},2]}, tax] }, 2]}, 0]},
                                    then: 0,
                                else: {$round: [{ $multiply: [{$round: [{$subtract: ['$gross_salary', 10417.00]},2]}, tax] }, 2]}
                                }}
                            },
                            in: {$round:[{$subtract: ['$$gross_salary', '$$tax_deduction']}, 2]}
                        }}
                    }},
                    {$sort: { emp_code: 1 }}
            ]
            try {
                const result = await employees.aggregate(pipeline)
                
                if (!result) res.status(500).send({err: 'Invalid request'})
                 console.log(result)
                res.status(200).send({ result })
            } catch (e) {
                res.status(500).send(e)
                console.log(e)
            }
        }
    }
    
}


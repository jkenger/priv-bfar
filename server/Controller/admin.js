const { errorHandler, fetchData } = require('./services/services')
const { getFormattedDate } = require('./services/date')
const employees = require('../Model/employee')
const attendances = require('../Model/attendance')
const Holiday = require('../Model/holiday')
const Payroll = require('../Model/payroll')
const TravelPass = require('../Model/travelPass')
const Employees = require('./../Model/employee')
const Deductions = require('../Model/deductions')
const { query } = require('express')
const moment = require('moment')
const { createIndexes, count } = require('../Model/employee')
const countWeekdays = require('./services/calendarDays')
const mongoose = require('mongoose')


module.exports = {
    // TODO: 
        //ACCOUNTS MUST BE CREATED BY THE ADMIN.
            // must be included when creating new employee.
        // CREATE FRONTEND FOR DEDUCTIONS.
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
            const projected = await employees.getProjectedEmployees()
            console.log(projected)
            await employees.getTotalData()
            .then((result, error)=>{
                if(error) console.log(error)
                else console.log(result)
            })
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

    // test/
    testdelete: async (req, res) => {
        try {
            const result = await attendances.deleteMany({am_time_in: 'T.O'})
            res.send(result)
        } catch (e) { res.status(500).send(e) }
    },
    updateAttendance: async (req, res) =>{
        // For each document, print all have no names

        await attendances.updateMany()
        .then((result, error)=>{
            const docHasName = []

            if(error){
                res.status(500).send(error)
            }else{
                result.forEach(async attendance=>{
                    if(!attendance.name){
                        console.log('if', attendance.name)
                        // await Employees.findOne({emp_code: attendance.emp_code}).select('name')
                        // .then(async (updateName)=>{
                        //     await attendances.updateMany({emp_code: attendance.emp_code}, {$set:{name: updateName.name}})
                        //     .then((update, err)=>{
                        //         if(err){
                        //             console.log(err)
                        //         }else{
                        //             console.log('update', update)
                        //         }
                        //     })
                        // })
                    }else{
                        console.log('else', attendance.name)
                    }
                    // if (!('name' in doc)) {
                    //     console.log('Document does not have a "name" key');
                    //   } else {
                    //     console.log('Document has a "name" key');
                    //   }
                })
                res.status(200).send(docHasName)
            }
        })
    },

    updateTimeOut: async (req, res)=>{
        const officeISODate = new Date().toISOString().split('T')[0]; // current date || yyyy-mm-dd
        console.log(officeISODate)
        const testISODate = '2022-12-29'; // current date for tioday|| yyyy-mm-dd (ie 2022-09-27)
        console.log(officeISODate)
        
        const db_ISO_AM_END = officeISODate + 'T12:00:00.000Z'
        const db_ISO_PM_END = officeISODate + 'T09:00:00.000Z'
        // For each document, print all have no names
        await attendances.updateMany({message: {$exists: false}}, {$set: {am_office_out: db_ISO_AM_END, pm_office_out: db_ISO_PM_END}})
        .then((result, err)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(result)
            }
        })
    },
    updateUndertime: async (req, res)=>{
        const officeISODate = new Date().toISOString().split('T')[0]; // current date || yyyy-mm-dd
        console.log(officeISODate)
        const testISODate = '2022-12-29'; // current date for tioday|| yyyy-mm-dd (ie 2022-09-27)
        console.log(officeISODate)
        
        const db_ISO_AM_END = officeISODate + 'T12:00:00.000Z'
        const db_ISO_PM_END = officeISODate + 'T09:00:00.000Z'

        // For each document, print all have no names
        await attendances.find()
        .then((docs, error)=>{
            if(error) res.status(500).send(error)
            else{
                let tobeUpdated = []
                docs.forEach(async doc=>{
                    if(doc.am_time_out >= doc.am_office_out || doc.pm_time_out >= doc.pm_office_out){
                        tobeUpdated.push(doc.emp_code)
                        // await attendances.findOneAndUpdate({emp_code: doc.emp_code}, {$set: {isUndertime: false}})
                        // .then(result=>{
                        //     console.log(result)
                        // })
                        console.log(doc)
                    }
                })

                console.log(tobeUpdated.length)
            }
        })

        // await attendances.updateMany(
        //     {$or: [{am_time_out: {$gte: am_office_out}}, {pm_time_out: {$gte: db_ISO_PM_END}}]}, 
        //     {$set: {isUndertime: false}
        // })
        // .then((result, err)=>{  
        //     if(err){
        //         res.status(500).send(err)
        //     }else{
        //         res.status(200).send(result)
        //     }
        // })
    },

    // deductions
    
    // read deduction
    readDeductions: async(req, res)=>{
        Deductions.find().sort({createdAt: 1})
            .then(result=>{
                res.status(200).send(result)
            })
    },
    // add deduction
    addDeduction: async(req, res)=>{
        const {name, amount} = req.body
        const doc = {
            name: name,
            amount: amount
        }
        Deductions.create(doc)
            .then(result=>{
                res.status(200).send(result)
            })
    },
    // delete deduction
    deleteDeduction: async(req, res)=>{
        const id = req.params.id
        Deductions.findByIdAndDelete(id)
            .then(result=>{
                res.status(200).send(result)
            })
    },
    // edit deduction
    editDeduction: async(req, res)=>{
        const {id, name, amount} = req.body
        const doc = {
            name: name,
            amount: amount
        }
        Deductions.findByIdAndUpdate(id, doc)
            .then(result=>{
                res.status(200).send(result)
            })
    },

    // events || holiday and traver orders
    addHoliday: async(req, res) =>{
        try{
            const {name, predate, date} = req.body
            const formattedDate = getFormattedDate()
            var from = new Date(predate)
            var to = new Date(date)
            var currentDate = new Date(formattedDate)
            console.log(from, to)
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
            // if(from < currentDate) {
            //     const error = errorHandler({message: 'Given date must be equal or ahead of the current date'})
            //     res.status(500).send({err: error })
            // }

            // if(to < from){
            //     const error = errorHandler({message: 'Holiday must be ahead of prerequisite date'})
            //     res.status(500).send({ err: error })
            // }

            // if(from >= currentDate && to >= from){
            //     const schema = {
            //         name: name,
            //         preDate: predate,
            //         date: date
            //     }
            //     const result = await Holiday.create(schema)
            //     if(!result){
            //         res.status(500).send('failure to create data.')
            //     }
            //     res.status(200).send(result)
            // }
            
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
    },
    deleteHoliday: async(req, res)=>{
        try{
            const id = req.params.id
            Holiday.findOneAndDelete({_id: id})
                .then((result, err)=>{
                    if(result){
                        res.status(200).send({result: result})
                    }else{
                        res.status(501).send({err:'Failed to process deletion. Try again later.'})
                    }
                })
        }catch(err){
            res.status(500).send(err)
        }
    },
    
    readHoliday: async(req, res) =>{
        try{
            const result = await Holiday.find()
            res.status(200).send(result)
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
        
    },

    // travel pass
    readTravelPass: async(req, res) =>{
        try{
            const result = await TravelPass.find()
            res.status(200).send(result)
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

    // get all attendance
    readAttendance: async (req, res) => {
        try {
           
            const records = await attendances.getAttendanceData()
            const totalData = await attendances.getTotalData()
            console.log(totalData)
            // const selectedRecords = await attendances.getSelectedAttendanceData()
            // console.log(selectedRecords)
            res.status(200).send({ records })

        } catch (e) { res.status(500).send(e) }
    },

 
    
    // get payroll transaction
    readPayrolls: async (req, res) => {
        if (req.query) {

            // NEEDED TO BE FIXED: FROMDATE FROM PHASE CALENDAR CHANGES EVEN WITHOUT A TRIGGER
            // const fromDate = new Date(`${(req.query.from.includes('T')) ? req.query.from : req.query.from + 'T00:00:00.000+00:00'}`)
            try{
                const fromDate = new Date(req.query.from)
                const toDate = new Date(req.query.to)

                const result = await Payroll.getPayrollData(fromDate, toDate)
                if (!result) res.status(500).send({err: 'Invalid request'})
                 console.log(result)
                res.status(200).send({result})
            } catch (e) {
                res.status(500).send(e)
                console.log(e)
            }
        }
    }
    
}


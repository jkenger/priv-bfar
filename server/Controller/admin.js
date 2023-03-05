const { errorHandler, fetchData } = require('./services/services')
const { getFormattedDate } = require('./services/date')
const employees = require('../Model/employeee')
const attendances = require('../Model/attendance')
const Holiday = require('../Model/holiday')
const Payroll = require('../Model/payroll')
const TravelPass = require('../Model/travelPass')
const Employees = require('./../Model/employee')
const Deductions = require('../Model/deductions')
const { query } = require('express')
const { createIndexes, count, create } = require('../Model/employee')
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
            if (!result.length) res.status(500).send({err: 'Failure to find any data'})
            else res.status(200).send({ result })
        } catch (e) { res.status(500).send(e) }
    },
    // employee controllers
    readEmployees: async (req, res) => {
        try {   
            const projected = await employees.getProjectedEmployees()
            // const employeeData = await employees.getTotalData()
            // console.log(employeeData)
            console.log(projected)
            res.status(200).send({ result: projected})

        } catch (e) { res.status(500).send(e) }
    },
    viewEmployee: async (req, res) => {
        try {
            const id = req.params.id
            if (!id) res.status(500).send({err: 'Failutre to process the given id'})
            const projected = await employees.findOne({_id: id})
            if(projected) res.status(200).send({result: projected})
            if (!projected) res.status(500).send({err: 'Failure to find any document by the id'})
           
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
            console.log(e)
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
            
            //update name
            update.personal_information.name = update.personal_information.fname + ' ' + update.personal_information.mname + ' ' + update.personal_information.lname
            
            //set update
            const result = await employees.findOneAndUpdate({ _id: id }, {$set: update,})
            if (!result) res.status(500).send({err: 'Failure to update the employee'})
            res.status(200).send(result)
        } catch (e) {
            const error = errorHandler(e)
            res.status(500).send({ err: error})
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
        try{
            const projectedData = await Deductions.find()
            console.log(projectedData)
            res.status(200).send({result: projectedData})   
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
       
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
        const {name, amount} = req.body
        const id = req.params.id
        console.log(req.body)
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
            const {name, preDate, date, description} = req.body
            const formattedDate = getFormattedDate()
            var from = new Date(preDate)
            var to = new Date(date)
            var currentDate = new Date(formattedDate)

            if(!name || !date || !preDate){
                const error = errorHandler({message: 'Input must not be empty'})
                res.status(500).send({err: error })
                console.log(error)
            }

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
                        preDate: preDate,
                        date: date,
                        description: description
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

    readHoliday: async(req, res) =>{
        try{
            const projectedData = await Holiday.find()
            res.status(200).send({result: projectedData})
            console.log(projectedData) 
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
        
    },

    editHoliday: async(req, res) =>{
        try{
            const id = req.params.id
            const {name, description, preDate, date} = req.body
            
            const formattedDate = getFormattedDate()
            const from = new Date(preDate)
            const to = new Date(date)
            const currentDate = new Date(formattedDate)

            if(!name || !date || !preDate){
                const error = errorHandler({message: 'Input must not be empty'})
                res.status(500).send({err: error })
                console.log(error)
            }

            if(from < currentDate) {
                const error = errorHandler({message: 'Given date must be equal or ahead of the current date'})
                res.status(500).send({err: error })
            }

            if(to < from){
                const error = errorHandler({message: 'Holiday must be ahead of prerequisite date'})
                res.status(500).send({ err: error })
            }

            if(from >= currentDate && to >= from){
                const doc = await Holiday.findByIdAndUpdate(id, {
                    name,
                    description,
                    preDate,
                    date
                })
                if(!doc){
                    res.status(500).send('failure to create data.')
                }
                res.status(200).send({result: doc})
            }
           
            // res.status(200).send(req.body)
            // const projectedData = await Holiday.find()
            // res.status(200).send({result: projectedData})
            // console.log(projectedData) 
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
    

    // travel pass
    readTravelPass: async(req, res) =>{
        try{
            const projectedData = await TravelPass.find().sort({from_date: 1})
            res.status(200).send({result: projectedData})
        }catch(e){
            const error = errorHandler(e)
            res.status(500).send({ err: error })
        }
    },
    addTravelPass: async (req, res) => {
        try {
            // PROBLEM
            const { emp_code, name, fromDate, toDate, project } = req.body
            console.log(project)
            const result = await TravelPass.addPass(emp_code, name, fromDate, toDate, project)
            res.status(200).send({result: result})
        } catch (e) { 
            const error = errorHandler(e)
            res.status(500).send({err:error}) 
        }
    },
    editTravelPass: async(req, res)=>{
        try{
            console.log(req.body)
            //delete then add new travelpass
            // const deletedPass = TravelPass.deletePass(id)
            const { emp_code, name, fromDate, toDate, project } = req.body

        
        }catch (e) { 
            const error = errorHandler(e)
            res.status(500).send({err:error}) 
        }
    },
    deleteTravelPass: async(req, res)=>{
        try{
            const id = req.params.id
            const deleteResult = TravelPass.deletePass(id)
            console.log(deleteResult)
            res.status(200).send({result: deleteResult})
            
        }catch(e){
            res.status(500).send(e)
        }
    },

   

    // get all attendance
    readAttendance: async (req, res) => {
        try {
            const fromDate = new Date(req.query.from)
            const toDate = new Date(req.query.to)
            const projectedData = await attendances.getProjectedAttendanceData(fromDate, toDate)
            const totalData = await attendances.getTotalData()
            // const selectedRecords = await attendances.getSelectedAttendanceData()
            // console.log(selectedRecords)
            res.status(200).send({ result: projectedData, data: totalData})

        } catch (e) { res.status(500).send(e) }
    },

 
    
    // get payroll transaction
    readPayrolls: async (req, res) => {
        if (req.query) {
            try{
                const fromDate = new Date(req.query.from)
                const toDate = new Date(req.query.to)
                console.log(fromDate, toDate)
                const projectedData = await Payroll.getPayrollData(fromDate, toDate)
                const totalData = await Payroll.getTotalData(fromDate, toDate)
                console.log(totalData)
                res.status(200).send({result: projectedData, data: totalData})
            } catch (e) {
                res.status(500).send(e)
                console.log(e)
            }
        }
    }
    
}


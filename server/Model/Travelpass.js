const mongoose = require('mongoose')
const validator = require('validator')
const Attendance = require('./attendance')
const Employees = require('./employee')
const moment = require('moment')
const { errorHandler, fetchData } = require('../Controller/services/services')
const { getFormattedDate } = require('../Controller/services/date')

const TravelPassSchema = mongoose.Schema({
    emp_code:{
        type: String,
        ref: 'Employees',
        required: [true, 'Please enter employee code'],
        validate: [validator.isInt, "Invalid ID"]
    },
    emp_id: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Employee ID was not found'],
        ref: 'Employees'
    },
    name:{
        type: String
    },
    project:{
        type: String,
        required: [true, 'Project type is required'],
    },
    from_date:{
        type: Date,
        required: [true, 'Date is required'],
    },
    to_date:{
        type: Date,
        required: [true, 'Date is required'],
    },
    attendances: [{
        type: mongoose.Types.ObjectId,
        ref: ('Attendance'),
        default: null,
    }]
},{timestamps: true})

//checks if document is valid
function executeIfDateRangeWithin(fromDate, toDate, databaseFromDate, databaseToDate) {
    // Check if the entire date range falls within the database date range
    if (fromDate >= databaseFromDate && toDate <= databaseToDate) {
        console.log('from to witihin')
      return true
    }
  
    // Check if either the fromDate or toDate falls within the database date range
    else if (fromDate >= databaseFromDate && fromDate <= databaseToDate) {
        console.log('from witihin')
        if (toDate > databaseToDate) {
            return true
          } else {
            return false
          }
    } else if (toDate >= databaseFromDate && toDate <= databaseToDate) {
        console.log('to witihin')
        if (fromDate < databaseFromDate) {
            return true
          } else {
            return false
          }
    }
}

TravelPassSchema.statics.addPass = async function(emp_code, name, fromDate, toDate, project){
            const formattedDate = getFormattedDate()
            var from = new Date(fromDate)
            var to = new Date(toDate)
            var currentDate = new Date(formattedDate)
            var docs = []
            
            const attendance = await Attendance.findOne({
                emp_code: emp_code,
                $and: [{date: {$gte: from}}, {date: {$lte: to}}],
                am_time_in: { $ne: '' }
            })
            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            // NOTE: date should be formatted to local date.
            if (!attendance) {   
                console.log('ATTENDANCE')
                Employees.findOne({'employee_details.designation.id': emp_code})
                .then(async (employee, err)=>{
                    if(!emp_code){
                        return Error("NoIDError") 
                    }else if(!fromDate || !toDate) {
                        return Error('Dates are required')
                    }else  if(from < currentDate) {
                        return Error('Given date must be equal or ahead of the current date')
                    }else if(to < from){
                        return Error('Date must be ahead of prerequisite date')
                    }else{
                        TravelPass.find({emp_code: emp_code, date_added: ({$gte:moment(from).startOf('isoweek').toDate()} || {$lte:moment(to).startOf('isoweek').toDate()})})
                            .then(documents =>{
                                let existingDoc = []
                                for(let i = 0; i < documents.length; i++){
                                    if(executeIfDateRangeWithin(from, to, documents[i].from_date, documents[i].to_date)){
                                        existingDoc.push(documents[i])
                                    }
                                }
                                console.log('existing Documents:', existingDoc)
                                if(existingDoc.length){
                                    const error = errorHandler({message: 'Selected date were already given'})
                                    return error
                                }
                                if(!existingDoc.length){
                                    TravelPass.insertMany({
                                        emp_code: employee.employee_details.designation.id,
                                        emp_id: employee._id,
                                        name: employee.personal_information.name,
                                        from_date: from,
                                        to_date:to,
                                        project: project
                                    })
                                    .then(async (pass, err)=>{
                                        console.log('pass:', pass)
                                        if(err){
                                            return 'Failed creating travel pass'
                                        }
                                        if(pass){
                                            //loop for every day
                                            for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {
                                                
                                                var newDay = new Date(day.setDate(day.getDate()))
                                                docs.push({
                                                    emp_code: employee.employee_details.designation.id,
                                                    emp_id: employee._id,
                                                    name: employee.personal_information.name,
                                                    date: newDay,
                                                    date_string: newDay.toLocaleDateString(),
                                                    isHalf: 'false',
                                                    message: project,
                                                })
                                            }
                                            // [done] NOTE: attendance document not inserting as subdocument from the travel order
                                            // TO DO: attendances must be deleted from the originally collection when a user deleted a travel order record.
                                            Attendance.insertMany(docs)
                                            .then(result=>{
                                                result.forEach(element => {
                                                    TravelPass.findOneAndUpdate(
                                                        {_id: pass[0]._id},
                                                        {$push: {attendances: element._id}}
                                                    )
                                                    .then(result=>{
                                                        return result
                                                    })
                                                })
                                               
                                            })
                                        }
                                    })
                                }
                            })
                    }
                })
            } else{
                return 'Failed to process event creation. Employee might already attended between the selected date'
            }
}

TravelPassSchema.statics.editPass = async function(_id, emp_code, name, fromDate, toDate, project){
    try{
        // Find travel pass by _id
        // update fromDate to toDate
        // update Attendance 
        console.log(_id, emp_code, name, fromDate, toDate, project)
        const from = new Date(fromDate)
        const to = new Date(toDate)

        let dataId = []
        let docs = []


        TravelPass.findOneAndUpdate({_id: _id}, {from_date: from, to_date: to, project: project, attendances: []})
        .then((result, err)=>{
            result.attendances.forEach(attendance=>{
                dataId.push(attendance._id)
            })
            console.log(dataId)
            Attendance.deleteMany({_id: {$in: dataId}})
            .then(result=>{
                Employees.findOne({'employee_details.designation.id': emp_code})
                .then((employee, err)=>{
                    for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {                     
                        var newDay = new Date(day.setDate(day.getDate()))
                        docs.push({
                            emp_code: employee.employee_details.designation.id,
                            emp_id: employee._id,
                            name: employee.personal_information.name,
                            date: newDay,
                            date_string: newDay.toLocaleDateString(),
                            isHalf: 'false',
                            message: project,
                        })
                    }
                    // [done] NOTE: attendance document not inserting as subdocument from the travel order
                    // TO DO: attendances must be deleted from the originally collection when a user deleted a travel order record.
                    Attendance.insertMany(docs)
                    .then(result=>{
                        let newDataId = []
                        result.forEach(element => {
                            newDataId.push(element._id)
                        })
                        TravelPass.findOneAndUpdate(
                            {_id: _id},
                            {$push:{attendances: newDataId}}
                        )
                        .then(result=>{
                            return result
                        })
                    })
                    
                })
            })
        })
        
        console.log(dataId)
        console.log(tp)
        // Attendance.deleteMany({_id: {$in: dataId}})
        // .then(async (result, err)=>{
        //     const updatedPass = await this.addPass(emp_code, name, fromDate, toDate, project)
        // })
        
        
    }catch(e){
        const error = errorHandler(e)
        return error
    }
    
    
    // const updatedResult = TravelPass.updateOne()
}

TravelPassSchema.statics.deletePass = async function(id){
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
                            Attendance.deleteMany({_id: {$in: dataId}})
                                .then((result, err)=>{
                                    return result
                                })
                            
                        }else{
                            throw Error('No IDS Found.')
                        }
                    }else{
                        throw Error('Failed to process deletion. Try again later.')
                    }
                })
}

const TravelPass = mongoose.model('Travelpass', TravelPassSchema)

module.exports = TravelPass
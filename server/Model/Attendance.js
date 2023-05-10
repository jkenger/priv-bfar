const e = require('express')
const mongoose = require('mongoose')
const validator = require('validator')
const moment = require('moment')
const Employees = require('./employeee')
const { startOfDay } = require('date-fns')
const setTime = require('../Controller/services/setTime')


const Attendance = mongoose.Schema({
    emp_code: {
        type: String,
        ref: "Employees",
        required: [true, 'Please enter employee code'],
        validate: [validator.isInt, "Invalid ID"]
    },
    emp_id: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Employee ID was not found'],
        ref: 'Employees'
    },
    name:{
        type: String,
    },
    date: {
        type: Date
    },
    date_string: {
        type: String,
    },
    am_time_in: {
        type: Date
    },
    am_time_out: {
        type: Date
    },
    pm_time_in: {
        type: Date
    },
    pm_time_out: {
        type: Date
    },
    duration: {
        type: Number
    },
    am_office_in: {
        type: Date
    },
    pm_office_in: {
        type: Date
    },
    am_office_out: {
        type: Date
    },
    pm_office_out: {
        type: Date
    },
    offset: {
        type: Number
    },
    isLate: {
        type: Boolean,
        default: false
    },
    isUndertime: {
        type: Boolean,
        default: false
    },
    isHalf: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        default: "Office"
    }
})

Attendance.post('save', async function(){
    const currentDate = moment(new Date())
    const employeeDate = moment(this.am_office_out)
    const filter = {emp_code: this.emp_code, date_string: this.date_string}
    // set time_in for am or pm
    if(currentDate.isBefore(employeeDate)){
        const result = await EmpAttendance.findOneAndUpdate(filter, {am_time_in: currentDate})
        console.log('am')
        return result
    }else{
        const result = await EmpAttendance.findOneAndUpdate(filter, {pm_time_in: currentDate})
        console.log('pm')
        return result
    }
    
})
Attendance.post('findOneAndUpdate', async function(){
    const doc = await this.model.findOne(this.getQuery());
    // set half
    if(!(doc.am_time_in && doc.am_time_out) || (!doc.pm_time_in || !doc.pm_time_out)){
        await this.model.updateOne(this.getQuery(), {$set: {isHalf: true}});
    }else{
        await this.model.updateOne(this.getQuery(), {$set:{isHalf: false}});
    }
    //set undertime
    if(!(doc.am_time_in && doc.am_time_out)){
        if(doc.pm_time_out < doc.pm_office_out){
            await this.model.updateOne(this.getQuery(), {$set: {isUndertime: true}});
            console.log('true 23')
        }else{
            await this.model.updateOne(this.getQuery(), {$set: {isUndertime: false}});
        }
    }else if(!(doc.pm_time_in && doc.pm_time_out)){
        if(doc.am_time_out < doc.am_office_out){
            await this.model.updateOne(this.getQuery(), {$set: {isUndertime: true}});
            console.log('true 12')
        }else{
            await this.model.updateOne(this.getQuery(), {$set: {isUndertime: false}});
        }
    }else if(doc.am_time_in && doc.pm_time_in){
        if((doc.pm_time_out < doc.pm_office_out) || doc.am_time_out < doc.am_office_out){
            await this.model.updateOne(this.getQuery(), {$set: {isUndertime: true}});
            console.log('true f')
        }else if(doc.pm_time_out > doc.pm_office_out && doc.am_time_out > doc.am_office_out){
            await this.model.updateOne(this.getQuery(), {$set: {isUndertime: false}});
            console.log('true s')
        }
    }
    
    // set late
    if(doc.am_time_in > doc.am_office_in || doc.pm_time_in > doc.pm_office_in){
        await this.model.updateOne(this.getQuery(), {$set: {isLate: true}});
    }else{
        
        await this.model.updateOne(this.getQuery(), {$set: {isLate: false}});
    }
})
// TABLE AND EMPLOYEE ID IS REQUIRED
Attendance.statics.timeIn = async function (emp_code, _id, time_type) {  

    //database office hours
    const db_ISO_AM_START = new Date() // 8
    setTime(db_ISO_AM_START, 8, 0, 0)
    const db_ISO_AM_END = new Date()// 12
    setTime(db_ISO_AM_END, 12, 0, 0)
    const db_ISO_PM_START = new Date() // 1
    setTime(db_ISO_PM_START, 13, 0, 0)
    const db_ISO_PM_END = new Date()// 5
    setTime(db_ISO_PM_END, 17, 0, 0)
    
    // isodate
    const currentISODate = moment(new Date( )).local()
    // datestring
    const currentDateString = new Date().toLocaleDateString()

    // TIME-IN STARTS HERE ----------------------------------------------
    if (time_type === 'timein') {
        const employee = await Employees.findOne({'employee_details.designation.id': emp_code}).select('personal_information.name')
        const filter = {emp_code: emp_code, date_string: currentDateString}
        const doc = await EmpAttendance.findOne(filter) 
        // if no document this day, create one
        if(!doc){
            const result = await this.create({
                emp_code: emp_code,
                emp_id: _id,
                name: employee.personal_information.name,    
                date: currentISODate,
                date_string: currentDateString,
                am_office_in: db_ISO_AM_START,
                am_office_out: db_ISO_AM_END,
                pm_office_in: db_ISO_PM_START,
                pm_office_out: db_ISO_PM_END,
            })
            return result
        }
        if(doc && (doc.am_time_out && doc.pm_time_out)){
            throw Error(`You have already time in at ${doc.am_time_in} and ${doc.pm_time_out} this day.`)
        }
        if(doc && (doc.message === 'T.O' || doc.message === 'O.B')){
           
            throw Error(`You have already time in as O.B for ${moment(currentISODate).format('LL')}.`)
        }
        //check if document logged for am or pm
        if(doc.am_time_in && moment(currentISODate).isBefore(doc.am_office_out)){
            console.log('asssdoc')
            throw Error(`You have already time in at ${moment(doc.am_time_in).format('LTS')}.`)
        }
        if(doc.pm_time_in && moment(currentISODate).isAfter(doc.am_office_out)){
            throw Error(`You have already time in at ${moment(doc.pm_time_in).format('LTS')}.`)
        }
        
        if(doc.am_time_in && !doc.pm_time_in && moment(currentISODate).isAfter(doc.am_office_out)){
            // if document has am log, time in for pm
            const result = await EmpAttendance.findOneAndUpdate(filter, {pm_time_in: currentISODate})
            return result
        }
    }
    if (time_type === 'timeout') {
        const doc = await this.findOne({emp_code: emp_code, date_string: currentDateString})
        if(doc === null){
            throw Error('This ID have not timed in yet.')
        }
        if(doc && (doc.message === 'T.O' || doc.message === 'O.B')){
            console.log('asdsds')
            throw Error(`You have already time out as O.B for ${moment(currentISODate).format('LL')}.`)
        }
        // if before 1pm and am time out do not exist, update am  time out
        if(moment(currentISODate).isBefore(doc.pm_office_in) && doc.am_time_in && !doc.am_time_out){
            const result = await this.findOneAndUpdate({emp_code: doc.emp_code, date_string: doc.date_string}, {am_time_out: currentISODate})
            return result
        }
        if(moment(currentISODate).isAfter(doc.am_office_out) && doc.pm_time_in && !doc.pm_time_out){
            const result = await this.findOneAndUpdate({emp_code: doc.emp_code, date_string: doc.date_string}, {pm_time_out: currentISODate})
            return result
        }
        if(doc.am_time_out && moment(currentISODate).isBefore(doc.pm_office_in)){
            throw Error(`sYou have already time out at ${moment(doc.am_time_out).format('LTS')}.`)
        }
        if(doc.pm_time_out && moment(currentISODate).isAfter(doc.am_office_out)){
            throw Error(`You have already time out at ${moment(doc.pm_time_out).format('LTS')}.`)
        }
        
        
    }
}



// GET ALL ATTENDANCE INFORMATION
Attendance.statics.getAttendanceData = async function(f){
    const result = await this.find({})
    return result
}

Attendance.statics.getProjectedAttendanceData = async function(fromDate, toDate, id){
    const filter = (id)? {emp_code: id, date: {$gte: fromDate, $lte: toDate}} : {date: {$gte: fromDate, $lte: toDate}} 
    const pipeline = [
        {$match: filter},
        {$project: {
            emp_code: 1,
            name: 1,
            date:1,
            am: {
                office_in: '$am_office_in',
                office_out: '$am_office_out',
                time_in: '$am_time_in',
                time_out: '$am_time_out',
            },
            pm: {
                office_in: '$pm_office_in',
                office_out: '$pm_office_out',
                time_in: '$pm_time_in',
                time_out: '$pm_time_out',
            },
            status:{
                isLate: '$isLate',
                isUndertime: '$isUndertime',
                isHalf: '$isHalf'
            },
            message: 1
        }},
        {$addFields: {
            no_of_late: {$cond: {
            if: { $eq: ['$status.isLate', false] },
            then: 0,
            else: {
                $sum: [{$cond:{
                    if: { $lt: [{ $dateDiff: { startDate: "$am.office_in", endDate: "$am.time_in", unit: "minute" } }, 0] },
                    then: 0,
                    else: { $dateDiff: { startDate: "$am.office_in", endDate: "$am.time_in", unit: "minute" } }
                }},
                {$cond: {
                    if: { $lt: [{ $dateDiff: { startDate: "$pm.office_in", endDate: "$pm.time_in", unit: "minute" } }, 0] },
                    then: 0,
                    else: { $dateDiff: { startDate: "$pm.office_in", endDate: "$pm.office_in", unit: "minute" } }
                }}]}
            }},
            no_of_undertime: {$cond: {
                if: { $eq: ['$status.isUndertime', false] },
                then: 0,
                else: {
                    $sum: [{$cond:{
                        if: { $lt: [{ $dateDiff: { startDate: "$am.am_office_out", endDate: "$am.am_time_out", unit: "minute" } }, 0] },
                        then: 0,
                        else: { $dateDiff: { startDate: "$am.am_office_out", endDate: "$am.am_time_out", unit: "minute" } }
                    }},
                    {$cond: {
                        if: { $lt: [{ $dateDiff: { startDate: "$pm.pm_office_out", endDate: "$pm.pm_time_out", unit: "minute" } }, 0] },
                        then: 0,
                        else: { $dateDiff: { startDate:  "$pm.pm_office_out", endDate: "$pm.pm_time_out", unit: "minute" } }
                    }}]}
                }}
        }},
        {$sort: {date: -1}}
    ]
    const result = await this.aggregate(pipeline)
    return result
}

// GET TOTAL DATAS
Attendance.statics.getTotalData = async function(){
    const pipeline = [
        {$match: {}},
        {$project: {
            emp_code: 1,
            name: 1,
            am: {
                time_in: '$am_time_in',
                time_out: '$am_time_out',
            },
            pm: {
                time_in: '$pm_time_in',
                time_out: '$pm_time_out',
            },
            message: 1,
            isLate: 1,
            totals:{
                present: {$cond:
                    // IF TIME INS AND OUT IS NOT NULL PR MESSAGE IS NOT EQUAL TO 'OFFICE', 
                    {if: {$or:[
                        {$or: [{$and:[
                            {$ne:['$am_time_in', null]},
                            {$ne:['$am_time_out', null]}]},
                            {$and:[
                                {$ne:['$pm_time_in', null]},
                                {$ne:['$pm_time_out', null]}
                            ]}
                        ]}, 
                        {$ne:['$message', 'Office']}
                        ]},
                    then: {$sum: 1},
                    else: {$sum: 0}
                    }
                },
                absent:{$cond:
                    // IF TIME INS AND OUT IS NOT NULL PR MESSAGE IS NOT EQUAL TO 'OFFICE', 
                    {if: {$or:[
                        {$and: [
                            {$ne:['$am_time_in', null]},
                            {$ne:['$am_time_out', null]},
                            {$ne:['$pm_time_in', null]},
                            {$ne:['$pm_time_out', null]},
                        ]}, 
                        {$ne:['$message', 'Office']}
                        ]},
                    then: {$sum: 0},
                    else: {$sum: 1}
                    }
                },
                lates: {$cond: {
                    if: {$eq: ['$isLate', true]},
                    then: {$sum: 1},
                    else: {$sum: 0}
                }},
                undertime: {$cond: {
                    if: {$eq: ['$isUndertime', true]},
                    then: {$sum: 1},
                    else: {$sum: 0}
                }}
            }
            
        }},
        
        {$group:{
            _id: null,
            presents: {$sum: '$totals.present'},
            absents: {$sum: '$totals.absent'},
            lates: {$sum: '$totals.lates'},
            undertime: {$sum: '$totals.undertime'}
        }}
    ]
    const result = await this.aggregate(pipeline)
    return result
}

const EmpAttendance = mongoose.model('attendances', Attendance)

module.exports = EmpAttendance;
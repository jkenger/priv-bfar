const e = require('express')
const mongoose = require('mongoose')
const validator = require('validator')
const moment = require('moment')


const EMP_TIME_RECORD = mongoose.Schema({
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
        type: String
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
    offset: {
        type: Number
    },
    isLate: {
        type: Boolean
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


// TABLE AND EMPLOYEE ID IS REQUIRED
EMP_TIME_RECORD.statics.am_attendance = async function (emp_code, _id, time_type) {

    // VARIABLES--------------------------------------------------------

    // OFFICE ISO DATE AND TIME
    const officeISODate = new Date().toISOString().split('T')[0]; // current date || yyyy-mm-dd
    console.log(officeISODate)
    const testISODate = '2022-10-29'; // current date for tioday|| yyyy-mm-dd (ie 2022-09-27)
    console.log(officeISODate)

    // 8 AM TIME IN
    const db_ISO_AM_START = officeISODate + 'T00:00:00.000Z'
    const OFFICE_AM_START = testISODate + 'T08:00:00.000Z';
    const OFFICE_ISO_AM_START = new Date(OFFICE_AM_START)

    // 12 PM  AM-TIME OUT
    const OFFICE_AM_END = testISODate + 'T12:00:00.000Z';
    const OFFICE_ISO_AM_END = new Date(OFFICE_AM_END)

    // 12:45 PM 
    const OFFICE_PM_START = testISODate + 'T12:45:00.000Z';
    const OFFICE_ISO_PM_START = new Date(OFFICE_PM_START)

    // 1 PM OFFICIAL PM START
    const OFFICE_OFF_PM_START = testISODate + 'T13:00:00.000Z';
    const OFFICE_ISO_OFF_PM_START = new Date(OFFICE_OFF_PM_START)

    // 5PM OUT
    const db_ISO_PM_START = officeISODate + 'T05:00:00.000Z'
    const OFFICE_PM_END = testISODate + 'T17:00:00.000Z';
    const OFFICE_ISO_PM_END = new Date(OFFICE_PM_END)

    console.log(testISODate + OFFICE_PM_END)

    // CURRENT ISO DATE AND TIME
    const currentISODate = new Date() // FOR DATABASE STORING
    const currentLocalISODate = currentISODate.getTime() - new Date().getTimezoneOffset() * 60 * 1000 // FOR TIME COMPARISON


    // CURRENT DATE STRING
    const currentDateString = new Date().toLocaleDateString()

    //-------------------------------------------------------------------
    
    // TIME-IN STARTS HERE ----------------------------------------------
    if (time_type === 'timein') {
        if(currentLocalISODate > OFFICE_ISO_PM_END){
            throw Error('Office hour ended')
        }

        //  AM TIME FRAME
        if (currentLocalISODate < OFFICE_ISO_AM_END) {
            console.log(currentLocalISODate < OFFICE_ISO_AM_END, currentLocalISODate, OFFICE_ISO_AM_END)
            // FIND ID WHERE THERE IS NO RECORD WITHIN TEH DAY
            const status = await this.find({
                emp_code: emp_code,
                date_string: currentDateString,
                am_time_in: { $ne: '' }
            })
            // LOG
            console.log('Attendee', status)
            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            // NOTE: date should be formatted to local date.
            if (!status.length) {
                const result = await this.create({
                    emp_code: emp_code,
                    emp_id: _id,
                    date: currentLocalISODate,
                    date_string: currentDateString,
                    am_office_in: db_ISO_AM_START,
                    am_time_in: currentISODate,
                    am_time_out: '',
                    pm_office_in: db_ISO_PM_START, 
                    pm_time_in: '',
                    pm_time_out: '',
                    offset: new Date().getTimezoneOffset(),
                    isLate: false
                })
                if(currentLocalISODate > OFFICE_ISO_AM_START){
                    console.log('AM IS LATE: **LATE**')
                    await this.findOneAndUpdate({ 
                        emp_code: emp_code,
                        date_string: currentDateString},
                        {isLate: true})
                }
                console.log(currentISODate)
                return result
            }else { throw Error('You have already logged in for morning shift') }
        }

        // IF LATE
        

        // CREATE NEW DOCUMENT IF NO AM TIME IN AND TIME OUT IS EMPTY
        // UPDATE THE EXISTING DOCUMENT IF THERE IS AM TIME IN AND NO TIME OUT

        // FIND A DOCUMENT WHERE AM TIME IN IS EMPTY
        // IF STATUS RETURNED 1, CHECK IF PM TIMEIN IS EMPTY
        // IF EMPTY, CREATE NEW DOCUMENT. IF NOT THROW AN ERROR.
        // IF STATUS RETURNED 0, UPDATE EXISTING DOCUMENT


        // 12 PM STARTS HERE
        if (currentLocalISODate > OFFICE_ISO_AM_END) {
            console.log(currentLocalISODate > OFFICE_ISO_AM_END, currentLocalISODate, OFFICE_ISO_AM_END)
            console.log('AFTER 12 PM')

            // FIND RECORD WHERE AM TIME-IN IS EMPTY
            const status = await this.find(
                { emp_code: emp_code, date_string: currentDateString }
            )
            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            if (!status.length) {
                const result = await this.create({
                    emp_code: emp_code,
                    emp_id: _id,
                    date: currentLocalISODate,
                    date_string: currentDateString,
                    am_office_in: db_ISO_AM_START,
                    am_time_in: '',
                    am_time_out: '',
                    pm_office_in: db_ISO_PM_START,
                    pm_time_in: currentISODate,
                    pm_time_out: '',
                    offset: new Date().getTimezoneOffset(),
                    isLate: false
                })
                // IF LATE
                if(currentLocalISODate > OFFICE_ISO_OFF_PM_START){
                    console.log(currentLocalISODate > OFFICE_ISO_OFF_PM_START, currentLocalISODate, OFFICE_ISO_OFF_PM_START)
                    console.log('PM IS LATE: **LATE**')
                    await this.findOneAndUpdate({ 
                        emp_code: emp_code,
                        date_string: currentDateString},
                        {isLate: true})
                }
                return result

                // IF STATUS RETURNED 1, UPDATE EXISTING
            } else {
                const status = await this.find({ emp_code: emp_code, date_string: currentDateString })
                
                const result = await this.findOneAndUpdate(
                    {emp_code: emp_code, date_string: currentDateString,
                     am_time_in: { $ne: '' }, pm_time_in: ''},
                    // UPDATE PM TIME-IN AND AM TIME-OUT // DO NOT OVERWRITE AM TIME OUT IF EXIST
                    (status[0].am_time_out)
                    ? { pm_time_in: currentISODate,  pm_time_out: ''}
                    : {am_time_out: currentISODate, pm_time_in: currentISODate, pm_time_out: '' }
                )

                

                // THROW AN ERROR 
                if (!result) { throw Error('You have already logged in for afternoon shifts') }

                return result
            }

        } else if (currentLocalISODate > OFFICE_ISO_PM_END) { throw Error('Office hour ended') }
        

    }
    // TIME-IN ENDS HERE-------------------------------------------------------------------

    // TIME OUT STARTS HERE ---------------------------------------------------------------
    if (time_type === 'timeout') {
        console.log(new Date())
        // CHECK 12 PM ONWARDS
        if (currentLocalISODate >= OFFICE_ISO_AM_END && currentLocalISODate <= OFFICE_ISO_OFF_PM_START) {

            // FIND IF HAS RECORD WITHIN AM
            const status = await this.find({
                emp_code: emp_code, date_string: currentDateString,
                am_time_in: { $ne: '' }, am_time_out: ''
            });
            console.log('Attendee outz', status)

            // IF RECORD EXIST
            if (status.length) {

                // FIND AND UPDATE QUERY
                let filter, update;
                if(!status[0].pm_time_in && !status[0].pm_time_out) filter = { emp_code: emp_code, date_string: currentDateString }, update = { am_time_out: currentISODate, isHalf: true };
                else filter = { emp_code: emp_code, date_string: currentDateString }, update = { am_time_out: currentISODate, isHalf: false };
                
                console.log(filter, update)
                const result = await this.findOneAndUpdate(filter, update) // UPDATE
                return result
            }else {
                throw Error('Morning shift ended')
            }

        }
        
        if (currentLocalISODate >= OFFICE_ISO_PM_END) { // 5PM Onwards
            // FIND IF HAS RECORD
            const status = await this.find({ // NOTE: status returns array
                emp_code: emp_code, date_string: currentDateString,
                pm_time_in: { $ne: '' }, pm_time_out: ''
            });

            console.log('Attendee outs', status)
            
            // IF THERE IS, UPDATE THE DOCUMENT
            if (status.length === 1) {
                // QUERY
                let filter, update;
                if(!status[0].am_time_in && !status[0].am_time_out) filter = { emp_code: emp_code, date_string: currentDateString }, update = { pm_time_out: currentISODate, isHalf: true };
                else filter = { emp_code: emp_code, date_string: currentDateString }, update = { pm_time_out: currentISODate, isHalf: false };
                // FIND AND UPDATE
                const result = await this.findOneAndUpdate(filter, update)
                return result
            } else {
                throw Error('Afternoon shift ended')
            }
        }
        if (currentLocalISODate < OFFICE_ISO_AM_END) { throw Error('Morning shift will end at 12 PM') }
        if (currentLocalISODate < OFFICE_ISO_PM_END) { throw Error('Afternoon shift will end at 5 PM') }


    }
    // TIME-OUT ENDS HERE------------------------------------------------------------
}
const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;
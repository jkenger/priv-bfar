const e = require('express')
const mongoose = require('mongoose')
const validator = require('validator')
const { default: isISO4217 } = require('validator/lib/isiso4217')

const EMP_TIME_RECORD = mongoose.Schema({
    emp_code: {
        type: String,
        ref: "users",
        required: [true, 'Please enter employee code'],
        validate: [validator.isInt, "Invalid ID"]
    },
    emp_id: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Employee ID was not found']
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
    isLate: {
        type: Boolean
    }
})


// TABLE AND EMPLOYEE ID IS REQUIRED
EMP_TIME_RECORD.statics.am_attendance = async function (emp_code, _id, time_type) {

    // VARIABLES--------------------------------------------------------

    // OFFICE ISO DATE AND TIME
    const officeISODate = new Date().toISOString().split('T')[0]; // current date || yyyy-mm-dd
    const testISODate = '2022-07-20'; // current date || yyyy-mm-dd
    const OFFICE_AM_START = testISODate + 'T08:00:00.000Z';
    const OFFICE_ISO_AM_START = new Date(OFFICE_AM_START)

    const OFFICE_AM_END = testISODate + 'T12:00:00.000Z';
    const OFFICE_ISO_AM_END = new Date(OFFICE_AM_END)

    const OFFICE_PM_START = testISODate + 'T12:45:00.000Z';
    const OFFICE_ISO_PM_START = new Date(OFFICE_PM_START)

    const OFFICE_PM_END = testISODate + 'T17:00:00.000Z';
    const OFFICE_ISO_PM_END = new Date(OFFICE_PM_END)

    console.log(testISODate + OFFICE_PM_END)

    // CURRENT ISO DATE AND TIME
    const currentISODate = new Date()
    const myTimeZone = currentISODate.getTime() - new Date().getTimezoneOffset() * 60 * 1000 // convert to local time zone
    currentISODate.setTime(myTimeZone);

    // CURRENT DATE STRING
    const currentDateString = new Date().toLocaleDateString()

    //-------------------------------------------------------------------

    console.log(currentISODate)
    console.log(OFFICE_ISO_PM_END)


    // TIME-IN STARTS HERE ----------------------------------------------
    if (time_type === 'timein') {

        // BEFORE 12 PM || AM TIME FRAME
        if (currentISODate < OFFICE_ISO_AM_END) {
            // FIND ID WHERE THERE IS NO RECORD WITHIN TEH DAY
            const status = await this.find({
                emp_code: emp_code,
                date_string: currentDateString,
                am_time_in: { $ne: '' }
            })
            // LOG
            console.log('Attendee', status)

            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            if (status.length === 0) {
                const result = await this.create({
                    emp_code: emp_code,
                    emp_id: _id,
                    date: currentISODate,
                    date_string: currentDateString,
                    am_time_in: currentISODate,
                    am_time_out: '',
                    pm_time_in: '',
                    pm_time_out: '',
                    isLate: false
                })
                return result
                // ELSE THROW AN ERROR
            } else { throw Error('You have already logged in for morning shift') }
        }

        // CREATE NEW DOCUMENT IF NO AM TIME IN AND TIME OUT IS EMPTY
        // UPDATE THE EXISTING DOCUMENT IF THERE IS AM TIME IN AND NO TIME OUT

        // FIND A DOCUMENT WHERE AM TIME IN IS EMPTY
        // IF STATUS RETURNED 1, CHECK IF PM TIMEIN IS EMPTY
        // IF EMPTY, CREATE NEW DOCUMENT. IF NOT THROW AN ERROR.
        // IF STATUS RETURNED 0, UPDATE EXISTING DOCUMENT


        // 12 PM STARTS HERE
        if (currentISODate > OFFICE_ISO_AM_END) {

            console.log('AFTER 12 PM')

            // FIND RECORD WHERE AM TIME-IN IS EMPTY
            const status = await this.find(
                { emp_code: emp_code, date_string: currentDateString }
            )
            console.log(status)
            // IF STATUS RETURNED 0, CREATE NEW DOCUMENT
            if (!status.length) {
                const result = await this.create({
                    emp_code: emp_code,
                    emp_id: _id,
                    date: currentISODate,
                    date_string: currentDateString,
                    am_time_in: '',
                    am_time_out: '',
                    pm_time_in: currentISODate,
                    pm_time_out: '',
                    isLate: false
                })
                return result

                // IF STATUS RETURNED 1, UPDATE EXISTING
            } else {
                // FIND RECORD WHERE PM TIME IN IS EMPTY
                const status = await this.find({
                    emp_code: emp_code, date_string: currentDateString
                })
                
                const result = await this.findOneAndUpdate(
                    {
                        emp_code: emp_code, date_string: currentDateString, // FIND
                        am_time_in: { $ne: '' }, pm_time_in: ''
                    },
                    // UPDATE PM TIME-IN AND AM TIME-OUT
                    (status[0].am_time_out) ? {
                        pm_time_in: currentISODate, //UPDATE
                        pm_time_out: ''
                        
                    } : {
                        am_time_out: currentISODate,
                        pm_time_in: currentISODate, //UPDATE
                        pm_time_out: ''
                    }
                )

                // THROW AN ERROR 
                if (!result) { throw Error('You have already logged in for afternoon shifts') }

                return result
            }

        } else if (currentISODate > OFFICE_ISO_PM_END) { throw Error('Office hour ended') }

    }
    // TIME-IN ENDS HERE-------------------------------------------------------------------

    // TIME OUT STARTS HERE ---------------------------------------------------------------
    if (time_type === 'timeout') {

        // CHECK BETWEEN 12 AND 12:45 PM
        if (currentISODate >= OFFICE_ISO_AM_END && currentISODate <= OFFICE_ISO_PM_START) {

            // FIND IF HAS RECORD WITHIN AM
            const status = await this.find({
                emp_code: emp_code, date_string: currentDateString,
                am_time_in: { $ne: '' }, am_time_out: ''
            });
            console.log('Attendee out', status)

            // IF RECORD EXIST
            if (status.length) {
                const result = await this.findOneAndUpdate(
                    { emp_code: emp_code, date_string: currentDateString }, // FIND
                    { am_time_out: currentISODate }) // UPDATE
                return result
            }

        }

        if (currentISODate >= OFFICE_ISO_PM_END) { // 5PM Onwards

            // FIND IF HAS RECORD
            const status = await this.find({
                emp_code: emp_code, date_string: currentDateString,
                pm_time_in: { $ne: '' }, pm_time_out: ''
            });

            console.log('Attendee out', status)

            // IF THERE IS, UPDATE THE DOCUMENT
            if (status.length === 1) {
                const result = await this.findOneAndUpdate(
                    { emp_code: emp_code, date_string: currentDateString }, //FIND
                    { pm_time_out: currentISODate } // UPDATE
                )
                return result
            } else {
                throw Error('Afternoon shift ended')
            }
        }
        if (currentISODate < OFFICE_ISO_AM_END) { throw Error('Morning shift will end at 12 PM') }
        if (currentISODate < OFFICE_ISO_PM_END) { throw Error('Afternoon shift will end at 5 PM') }


    }
    // TIME-OUT ENDS HERE------------------------------------------------------------
}
const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;
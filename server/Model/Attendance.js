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
    const testISODate = '2022-07-13'; // current date || yyyy-mm-dd
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

        if (currentISODate < OFFICE_ISO_AM_END) { // after 8 AM || time in for AM

            const status = await this.find({ // if the id have record within the day
                emp_code: emp_code,
                date_string: currentDateString,
                am_time_in: { $ne: '' } // AM IS NOT EMPTY
            })
            console.log('Attendee', status)
            if (status.length === 0) { // if no have record
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
            const status = await this.find({
                emp_code: emp_code,
                date_string: currentDateString
            })
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
                const result = await this.findOneAndUpdate({
                    emp_code: emp_code,
                    date_string: currentDateString,
                    am_time_in: {$ne: ''},
                    pm_time_in: ''
                }, {
                    // UPDATE PM TIME-IN AND AM TIME-OUT
                    am_time_out: currentISODate,
                    pm_time_in: currentISODate,
                    pm_time_out: ''
                })
                if (!result) {
                    throw Error('You have already logged in for afternoon shifts')
                }
                return result
            }

        } else if (currentISODate > OFFICE_ISO_PM_END) { throw Error('Office hour ended') }

    }
    // TIME-IN ENDS HERE-------------------------------------------------------------------

    // TIME OUT STARTS HERE ---------------------------------------------------------------
    if (time_type === 'timeout') {
        if (currentISODate >= OFFICE_ISO_AM_END && currentISODate < OFFICE_ISO_PM_START) { // between 12 and 1 PM

            const status = await this.find({ // check if has record within the day
                emp_code: emp_code,
                date_string: currentDateString,
                am_time_in: { $ne: '' },
                am_time_out: ''
            });
            console.log('Attendee out', status)

            if (status.length === 1) { // if record exist, update
                const result = await this.findOneAndUpdate({
                    emp_code: emp_code,
                    date_string: currentDateString
                }, {
                    am_time_out: currentISODate
                })
                return result
            } else { throw Error('Afternoon shift will end at 5 PM') }

        } if (currentISODate >= OFFICE_ISO_PM_END) { // 5PM Onwards

            const status = await this.find({ // chech if has record
                emp_code: emp_code,
                date_string: currentDateString,
                pm_time_in: { $ne: '' },
                pm_time_out: ''
            });
            console.log('Attendee out', status)

            if (status.length === 1) { // if exist, update
                const result = await this.findOneAndUpdate({
                    emp_code: emp_code,
                    date_string: currentDateString
                }, {
                    pm_time_out: OFFICE_ISO_PM_END
                })
                return result
            } else {
                throw Error('Afternoon shift ended')
            }
        }
    }
    // TIME-OUT ENDS HERE------------------------------------------------------------

}

// TABLE AND EMPLOYEE ID IS REQUIRED
EMP_TIME_RECORD.statics.pm_attendance = async function (emp_code, _id, time_type) {
    // OFFICE ISO DATE AND TIME
    // const OFFICE_PM_START_TIME = new Date(new Date().toISOString().split('T')[0] + 'T12:00:00.000Z')
    // const OFFICE_PM_END_TIME = new Date(new Date().toISOString().split('T')[0] + 'T16:00:00.000Z')

    const OFFICE_PM_START = '2022-07-10T12:00:00.000Z';
    const OFFICE_ISO_PM_START = new Date(OFFICE_PM_START);

    // CURRENT ISO DATE AND TIME
    const currentISODate = new Date()
    currentISODate.setTime(currentISODate.getTime() - new Date().getTimezoneOffset() * 60 * 1000); // convert to local time zone

    // CURRENT DATE STRING || MM/DD/YYYY
    const currentDateString = new Date().toLocaleDateString()

    console.log(currentISODate)
    console.log(OFFICE_ISO_PM_START)

    // IF THE ID HAVE NOT TIME OUT


    // PM TIME OUT
    // console.log(currentISODate >= OFFICE_PM_END_TIME)
    // if (currentISODate >= OFFICE_PM_END_TIME) {
    //     const status = await this.find({
    //         emp_code: emp_code,
    //         date_string: currentDateString,
    //         am_time_in: { $ne: '' },
    //         am_time_out: { $ne: '' },
    //         pm_time_in: { $ne: '' },
    //         pm_time_out: '' || null
    //     });
    //     console.log('Attendee out', status)

    //     // THROW IF THERE IS NO EXISTING RECORD
    //     if (status.length === 0) {
    //         throw Error('Afternoon shift ended')
    //     }
    //     if (status.length === 1) {
    //         const result = await this.findOneAndUpdate({
    //             emp_code: emp_code,
    //             date_string: currentDateString
    //         }, {
    //             pm_time_out: currentISODate
    //         })
    //         return result
    //     } else {
    //         throw Error('You have already logged out for afternoon shift')
    //     }

    // }



}

const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;
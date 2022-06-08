const mongoose = require('mongoose')
const validator = require('validator')

const EMP_TIME_RECORD = mongoose.Schema({
    employee_id: {
        type: String,
        required: [true, 'Please enter employee id'],
        validate: [validator.isInt, "Invalid ID"]
    },
    date: {
        type: String
    },
    time_in: {
        type: String
    },
    time_out: {
        type: String
    },
    duration: {
        type: String
    },
})

EMP_TIME_RECORD.statics.timein = async function (employee_id, date, time_in, time_out, status) {
    // FIND USER IF ALREADY LOGGED IN WITHIN THE DAY
    const isAttended = await this.find({ employee_id: employee_id, date: date })
    const empTime_in = time_in
    if (isAttended.length === 0) {
        if (isValidTime_In(empTime_in)) {
            console.log('TIME IN')

            const attendee = await this.create({ employee_id, date, time_in, time_out, status })
            return attendee
        }
        else {
            console.log('LATE')
        }
    }


    // THROW ERROR IF LOGGED IN WITHIN THE DAY

    throw Error('Already logged in');
}

EMP_TIME_RECORD.statics.timeout = async function (employee_id, time_out, date) {
    const currentDate = new Date().toLocaleDateString()
    const isAttended = await this.find({ employee_id: employee_id, date: date, time_out: null });
    if (isAttended.length === 1) {
        const attendee = await this.findOneAndUpdate({ _id: isAttended[0]._id }, { time_out: time_out })
        return attendee
    }


    // THROW ERROR IF THE USER HAVEN'T LOGGED IN FIRST
    if (currentDate === date) {
        throw Error('You have already logged out within this day');
    }
    throw Error('Cannot log in. Please try again');
}

const isValidTime_In = (empTime_In) => {

    const validTime_in = "6:00:00 PM"
    if (empTime_In <= validTime_in && !empTime_In.includes('AM')) {
        return true
    } else {
        return false
    }
}


const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;
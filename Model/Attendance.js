const mongoose = require('mongoose')
const validator = require('validator')

const EMP_TIME_RECORD = mongoose.Schema({
    employee_id: {
        type: String,
        required: [true, 'Please enter employee id'],
        validate: [validator.isInt, "Invalid ID"]
    },
    date: {
        type: Date
    },
    time_in: {
        type: String
    },
    time_out: {
        type: String
    },
    duration: {
        type: String
    }
})

EMP_TIME_RECORD.statics.timein = async function (employee_id, date, time_in, time_out, status) {
    const isAttended = await this.find({ employee_id: employee_id });
    // CAN ONLY TIME IN AFTER 24 HOURS
    if (isAttended) {
        const attendee = await this.create({ employee_id, date, time_in, time_out, status })
        return attendee
    }

    // THROW ERROR IF LOGGED IN WITHIN THE DAY

    throw Error('Invalid input ID');
}

EMP_TIME_RECORD.statics.timeout = async function (employee_id, time_out,) {
    const isAttended = await this.find({ employee_id: employee_id });
    //  CAN ONLY TIME OUT IF THE USER TIME IN
    if(isAttended){
        const attendee = await this.updateOne({ employee_id: employee_id }, { time_out: time_out, status: 0 })
        return attendee
    }


    // THROW ERROR IF THE USER HAVEN'T LOGGED IN FIRST

    throw Error('Invalid input ID');
}


const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;
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
    isLate: {
        type: Boolean
    }
})


isEarlier = (currentTime, startTime) => {
    if (currentTime.includes('AM')) {
        if (parseInt(currentTime) <= parseInt(startTime)) {
            return true
        }
        if(parseInt(currentTime) > parseInt(startTime)){
            return false
        }
    }
    if (currentTime.includes('PM')) {
        return false
    }
}

isEndTime = (currentTime, endTime)=>{
    if(currentTime.includes('PM')){
        if(parseInt(currentTime) >= parseInt(endTime)){
            return true
        }
    }

    if(currentTime.includes('AM')){
        return false
    }
}

EMP_TIME_RECORD.statics.timein = async function (employee_id) {
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
// const currentTime = '12:00:00 AM'
    const testDate = new Date('6/20/2022')
    const testTime = '5:00:00 AM'
    const officeStartTime = '8:00:00 AM'
    const officeEndTime = '5:00:00 PM'
    // Check if id exist.
    const isAttended = await this.find({
        employee_id: employee_id,
        date: currentDate
    })
    console.log('current:', currentTime)
    console.log('office:', officeStartTime)
    console.log('office:', currentDate)
    console.log(isAttended)
    // If the employee already attended this day.
    if (isAttended.length !== 0) {
        throw Error('You have already logged in within this day')
    }
    // If current time is earlier that office start time
    if (isEarlier(currentTime, officeStartTime) === true) {
        // Set Attendance as 8 AM default time in
        const result = await this.create({
            employee_id: employee_id,
            date: currentDate,
            time_in: officeStartTime,
            time_out: '',
            isLate: false
        })
        return result
    }

    // If late display current time
    if (isEarlier(currentTime, officeStartTime) === false) {
        const result = await this.create({
            employee_id: employee_id,
            date: currentDate,
            time_in: currentTime,
            time_out: '',
            isLate: true
        })
        return result
    }
}

EMP_TIME_RECORD.statics.timeout = async function (employee_id) {
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
    // const currentTime = '12:00:00 AM'
    const testDate = new Date('6/20/2022')
    const testTime = '5:00:00 PM'
    const officeStartTime = '8:00:00 AM'
    const officeEndTime = '5:00:00 PM'
    // Check if the id has record within the day
    const isAttended = await this.find({
        employee_id: employee_id,
        date: currentDate,
        time_out: ''
    });
    // If the system found no id time record within the day
    if (isAttended.length === 0) {
        throw Error('Cannot logout, try again later')
    }
    // If office hour is over, allow the users to time out
    if(isEndTime(currentTime, officeEndTime) === true){
        const result = await this.findOneAndUpdate({
            employee_id: employee_id,
            date: currentDate
        },{
            time_out: officeEndTime
        })
        return result
    }
    // If not, send an error
    if(isEndTime(currentTime, officeEndTime) === false){
        throw Error('Office hour will end at 5 PM, try again later')
    }
}

const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;
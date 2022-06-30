const mongoose = require('mongoose')
const validator = require('validator')

const EMP_TIME_RECORD = mongoose.Schema({
    emp_code: {
        type: String,
        ref: "users",
        required: [true, 'Please enter employee code'],
        validate: [validator.isInt, "Invalid ID"]
    },
    emp_id: {
        type: mongoose.Types.ObjectId,
        required:[true, 'Employee ID was not found']
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

// Convert time string to int
function toMilitary(time) { 
    var d = new Date("1/1/2013 " + time); 
    
    var trimmedTime = `${d.getHours()}${(d.getMinutes() < 10 ? "0" : "") + d.getMinutes()}${(d.getSeconds() < 10 ? "0" : "") + d.getSeconds()}`
    
    return trimmedTime; 
}

isEarlier = (currentTime, startTime) => {
     if(parseInt(toMilitary(currentTime)) <= parseInt(toMilitary(startTime))){
        return true
     }else{
        return false
     }
}

isEndTime = (currentTime, endTime)=>{
    if(parseInt(toMilitary(currentTime)) >= parseInt(toMilitary(endTime))){
        return true
     }else{
        return false
     }
}

EMP_TIME_RECORD.statics.timein = async function (emp_code, _id) {
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
// const currentTime = '12:00:00 AM'
    const testDate = new Date('6/20/2022')
    const testTime = '5:00:00 AM'
    const officeStartTime = '8:00:00 AM'
    const officeEndTime = '5:00:00 PM'
    // Check if id exist.
    const isAttended = await this.find({
        emp_code: emp_code,
        date: currentDate
    })
    console.log('current:', currentTime)
    console.log('office:', officeStartTime)
    console.log('office:', currentDate)
    console.log('Attendee', isAttended)
    // If the employee already attended this day.
    if (isAttended.length !== 0) {
        throw Error('You have already logged in within this day')
    }
    
    // If current time is earlier that office start time
    if (isEarlier(currentTime, officeStartTime) === true) {
        // Set Attendance as 8 AM default time in
        const result = await this.create({
            emp_code: emp_code,
            emp_id: _id,
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
            emp_code: emp_code,
            emp_id: _id,
            date: currentDate,
            time_in: currentTime,
            time_out: '',
            isLate: true
        })
        return result
    }
    }

EMP_TIME_RECORD.statics.timeout = async function (emp_code, _id) {
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
    // const currentTime = '12:00:00 AM'
    const testDate = new Date('6/20/2022')
    const testTime = '5:00:00 PM'
    const officeStartTime = '8:00:00 AM'
    const officeEndTime = '5:00:00 PM'
    // Check if the id has record within the day
    const isAttended = await this.find({
        emp_code: emp_code,
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
            emp_code: emp_code,
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
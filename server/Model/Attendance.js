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
        type: Date
    },
    date_string: {
        type: String
    },
    ISO_time_in:{
        type: Date
    },
    ISO_time_out:{
        type: Date
    },
    time_in: {
        type: Date
    },
    time_out: {
        type: Date
    },
    duration: {
        type: Number
    },
    isLate: {
        type: Boolean
    }
})

// // Convert time string to int
// function toMilitary(time) { 
//     var d = new Date("1/1/2013 " + time); 
    
//     var trimmedTime = `${d.getHours()}${(d.getMinutes() < 10 ? "0" : "") + d.getMinutes()}${(d.getSeconds() < 10 ? "0" : "") + d.getSeconds()}`
    
//     return trimmedTime; 
// }

// isEarlier = (currentTime, startTime) => {
//      if(parseInt(toMilitary(currentTime)) <= parseInt(toMilitary(startTime))){
//         return true
//      }else{
//         return false
//      }
// }

// isEndTime = (currentTime, endTime)=>{
//     if(parseInt(toMilitary(currentTime)) >= parseInt(toMilitary(endTime))){
//         return true
//      }else{
//         return false
//      }
// }

// TABLE AND EMPLOYEE ID IS REQUIRED
EMP_TIME_RECORD.statics.timein = async function (emp_code, _id) {
    // OFFICE ISO DATE AND TIME
    const officeISOStartTime = new Date(new Date().toISOString().split('T')[0] + 'T08:00:00.000Z')
    // const officeISOEndTime = new Date(new Date().toISOString().split('T')[0] + 'T16:00:00.000Z')
    // CURRENT ISO DATE AND TIME
    const currentISODate = new Date()
    currentISODate.setTime( currentISODate.getTime() - new Date().getTimezoneOffset()*60*1000 );
    // CURRENT DATE STRING
    const currentDateString = new Date().toLocaleDateString()

    console.log(currentISODate)
    console.log(officeISOStartTime)
    // FIND IF ID EXIST
    const isAttended = await this.find({
        emp_code: emp_code,
        date_string: currentDateString
    })

    console.log('Attendee', isAttended)
    // IF THE ID LOGGED IN WITHIN THE DAY
    if (isAttended.length !== 0) {
        throw Error('You have already logged in within this day')
    }
    
    // IF EARLIER OR ON TIME, DISPLAY OFFICE START
    if (currentISODate <= officeISOStartTime) {
        const result = await this.create({
            emp_code: emp_code,
            emp_id: _id,
            date: currentISODate,
            date_string: currentDateString,
            time_in: officeISOStartTime,
            time_out: '',
            isLate: false
        })
        return result
    }

    // IF LATE DISPLAY THE CURRENT TIME
    if (currentISODate > officeISOStartTime) {
        const result = await this.create({
            emp_code: emp_code,
            emp_id: _id,
            date: currentISODate,
            date_string: currentDateString,
            time_in: currentISODate,
            time_out: '',
            isLate: true
        })
        return result
    }
    }

    // TABLE AND EMPLOYEE ID IS REQUIRED
EMP_TIME_RECORD.statics.timeout = async function (emp_code, _id) {
    // OFFICE ISO DATE AND TIME
    // const officeISOStartTime = new Date(new Date().toISOString().split('T')[0] + 'T08:00:00.000Z')
    const officeISOEndTime = new Date(new Date().toISOString().split('T')[0] + 'T16:00:00.000Z')
    // CURRENT ISO DATE AND TIME
    const currentISODate = new Date()
    // CURRENT DATE STRING
    const currentDateString = new Date().toLocaleDateString()

    // SET TIME TO CURRENT TIME ZONE
    currentISODate.setTime( currentISODate.getTime() - new Date().getTimezoneOffset()*60*1000 );

    console.log(currentISODate)
    console.log(officeISOEndTime)

    // IF THE ID HAVE NOT TIME OUT
    const isAttended = await this.find({
        emp_code: emp_code,
        date_string: currentDateString,
        time_out: ''
    });
    console.log('Attendee out', isAttended.length)
    // THROW IF THERE IS NO EXISTING ID
    if (isAttended.length === 0) {
        throw Error('Cannot logout, try again later')
    }
    // IF OFFICE HOUR IS OVER
    if(currentISODate >= officeISOEndTime){
        const result = await this.findOneAndUpdate({
            emp_code: emp_code,
            date_string: currentDateString
        },{
            time_out: officeISOEndTime
        })
        return result
    }
    // SEND AN ERROR
    if(currentISODate < officeISOEndTime){
        throw Error('Office hour will end at 5 PM, try again later')
    }
}

const EmpAttendance = mongoose.model('attendances', EMP_TIME_RECORD)

module.exports = EmpAttendance;
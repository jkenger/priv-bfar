const mongoose = require('mongoose')
const PayrollGroup = require('./payrollGroup')

const attendanceHistorySchema = mongoose.Schema({
    attendances:{
        type: Array,
        required: true
    },
    date_from:{
        type: String,
        required: true,
    },
    date_to:{
        type: String,
        required: true,
    }
},
{timestamps: true}
)
attendanceHistorySchema.index({createdOn: 1}, {expireAfterSeconds: 2592000});
const AttendanceHistory = mongoose.model('attendancehistories', attendanceHistorySchema)

module.exports = AttendanceHistory

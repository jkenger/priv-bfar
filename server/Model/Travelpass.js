const mongoose = require('mongoose')
const validator = require('validator')
const Attendance = require('../Model/attendance')

const TravelPassSchema = mongoose.Schema({
    emp_code:{
        type: String,
        ref: 'Employees',
        required: [true, 'Please enter employee code'],
        validate: [validator.isInt, "Invalid ID"]
    },
    emp_id: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Employee ID was not found'],
        ref: 'Employees'
    },
    name:{
        type: String
    },
    from_date:{
        type: Date,
        required: [true, 'Date is required'],
    },
    to_date:{
        type: Date,
        required: [true, 'Date is required'],
    },
    date_added: {
        type: Date
    },
    attendances: [Attendance.schema]
})

const TravelPass = mongoose.model('Travelpass', TravelPassSchema)

module.exports = TravelPass
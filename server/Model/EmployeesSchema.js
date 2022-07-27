const mongoose = require('mongoose')
const validator = require('validator')

const EmpSchema = mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: [true, "Please fill in the name."]
    },
    emp_code:{
        type:String,
        unique:true
    },
    rfid: {
        type: String,
        unique:true
    },
    age: {
        type: Number,
        required: [true, "Age is required."]
    },
    email: {
        type: String,
        required: [true, "Please enter an email."],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Invalid email"]
    },
    contact: {
        type: Number,
        required: [true, "Enter contact number."],
    },
    position:{
        type: String,
        required: [true, "Please enter designation role."],
    },
    Salary: {
        type: Number,
        required: [true, "Please enter the right salary."]
    }

})

const Employee = mongoose.model('employees', EmpSchema)

module.exports = Employee
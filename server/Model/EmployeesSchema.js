const mongoose = require('mongoose')
const validator = require('validator')

const EmpSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    emp_code:{
        type:String,
        unique:true,
        required: [true, "ID No. is required"]
    },
    rfid: {
        type: String,
        unique:true
    },
    age: {
        type: Number,
        required: [true, "Age is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Enter a valid email"]
    },
    contact: {
        type: Number,
        required: [true, "Contact number is required"],
    },
    position:{
        type: String,
        required: [true, "Designation role is required"],
    },
    salary: {
        type: Number,
        required: [true, "Salary is required"]
    }

})

const Employee = mongoose.model('employees', EmpSchema)

module.exports = Employee
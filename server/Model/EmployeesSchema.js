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
        validate: [validator.isEmail, "Enter a valid email."]
    },
    contact: {
        type: String,
        required: [true, "Contact number is required"],
        validate: [validator.isMobilePhone, 'Enter a valid phone number. Contact must start with 0 (ex. 09123456879)'],
        minLength: [10, 'Contact number must not be less than 10 chars']
    },
    position:{
        type: String,
        required: [true, "Designation role is required"],
    },
    salary: {
        type: Number,
        required: [true, "Salary is required"]
    },
    isDeleted: {
        type: Boolean,
    }
})

const Employee = mongoose.model('employees', EmpSchema)

module.exports = Employee
const mongoose = require('mongoose')
const validator = require('validator')

const EmpSchema = mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: [true, "Please fill in the name."]
    },
    employee_id:{
        type:String,
        unique:true,
        required: [true, "Enter valid id"]
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
    }

})

const Employee = mongoose.model('employees', EmpSchema)

module.exports = Employee
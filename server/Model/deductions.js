const mongoose = require('mongoose')
const validator = require('validator')

const Schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    }
},
{
    timestamps:true
})

const Deductions = mongoose.model('deductions', Schema)
module.exports = Deductions
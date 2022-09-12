const mongoose = require('mongoose')
const validator = require('validator')

const schema = mongoose.Schema({
    emp_code: {
        type: String,
        required: [true, 'Employee code is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    fromDate: {
        type: Date,
        required: [true, 'Date is required']
    },
    toDate: {
        type: Date,
        required: [true, 'Date is required']
    }
})

const event = mongoose.model('events', schema)
module.exports = event
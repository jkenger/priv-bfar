const mongoose = require('mongoose')
const validator = require('validator')

const Schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    preDate: {
        type: String,
        required: [true, 'Date is required']
    },
    date: {
        type: String,
        required: [true, 'Date is required']
    }
})

const Holiday = mongoose.model('holidays', Schema)
module.exports = Holiday
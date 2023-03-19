const mongoose = require('mongoose')
const validator = require('validator')


const Schema = mongoose.Schema({
    leave_type: {
        type:String,
        required:[true, 'Leave Type is required'],
    },
    description: {
        type: String
    }
}, {timestamps:true})

const LeaveTypes = mongoose.model('LeaveTypes', Schema)

module.exports = LeaveTypes
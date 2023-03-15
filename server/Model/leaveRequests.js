const mongoose = require('mongoose')
const validator = require('validator')


const Schema = mongoose.Schema({
    doc_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'bfaremployees',
        required: [true, 'Document ID is required']
    },
    emp_id:{
        type:String,
        required: [true, 'ID is required']

    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    leave_type: {
        type: String,
        required: [true, 'Leave Type is required']
    },
    leave_reason: {
        type: String,
        required: [true, 'Leave Reason is required']
    },
    start_date: {
        type: Date,
        required: [true, 'Start Date is required']
    },
    end_date: {
        type: Date,
        required: [true, 'End Date is required']
    },
    status: {
        type: String,
    },
    date_requested: {
        type: Date,
    },
    date_approved: {
        type: Date,
    },
    date_rejected: {
        type: Date,
    },
}, {timestamps:true})

const LeaveRequests = mongoose.model('LeaveRequests', Schema)

module.exports = LeaveRequests
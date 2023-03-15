const { errorHandler, fetchData } = require('./services/services')
const { getFormattedDate } = require('./services/date')
const mongoose = require('mongoose')
const LeaveRequests = require('../Model/leaveRequests')

module.exports = {
    // get all employees
    getEmployees: async (req, res) => {
    },

    

    // post leave request
    postLeaveRequest: async (req, res) => {
        const { doc_id, emp_id, name, leave_type, leave_reason, start_date, end_date } = req.body
        const leave = {
            doc_id,
            emp_id,
            name,
            leave_type,
            leave_reason,
            start_date,
            end_date,
            status: 'pending',
            date_requested: new Date()
        }
        const result = await LeaveRequests.create(leave)
        res.status(200).send({result: result})
        // const find = await LeaveRequests.findOne({emp_id: emp_id}).populate('emp_id')
        // console.log(find)
        // res.status(200).send({result: find})
    }
}
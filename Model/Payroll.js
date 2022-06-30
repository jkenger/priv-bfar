const mongoose = require('mongoose')

const payrollSchema = mongoose.Schema({
    emp_code: {
        type: String
    },
    name: {
        type:String
    },
    designation: {
        type:String
    },
    no_of_days:{
        type: Number
    },
    no_of_hours: {
        type: Number
    },
    net_pay:{
        type: Number
    },
    status: {
        type: String,
        default: 'OP'
    }
})

const Payroll = mongoose.model('payrolls', payrollSchema)

module.exports = Payroll
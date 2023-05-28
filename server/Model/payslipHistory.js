const mongoose = require('mongoose')
const PayrollGroup = require('./PayrollGroup')

const payrollSlipSchema = mongoose.Schema({
    payroll_group:{
        fund_cluster:{
            type: String,
            required: true
        },
        project_name: {
            type: String,
            required: true
        },
        program_name:{
            type: String
        }
    },
    employees:{
        emp_code:{
            type: String,
            required: true
        },
        name:{
            type: String,
            required: true
        }
    },
    date_from:{
        type: String,
        required: true,
    },
    date_to:{
        type: String,
        required: true,
    },
    gross_amount_earned:{
        type: Number,
        required: true
    },
    net_amount_due:{
        type: Number,
        required: true
    },  
},
{timestamps: true}
)
payrollSlipSchema.index({createdOn: 1}, {expireAfterSeconds: 2592000});
const PayslipHistory = mongoose.model('paysliphistories', payrollSlipSchema)

module.exports = PayslipHistory

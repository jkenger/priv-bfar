const mongoose = require('mongoose')
const PayrollGroup = require('./PayrollGroup')

const payrollHistorySchema = mongoose.Schema({
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
        type: Array,
        required: true
    },
    date_from:{
        type: String,
        required: true,
    },
    date_to:{
        type: String,
        required: true,
    }
},
{timestamps: true}
)
payrollHistorySchema.index({createdOn: 1}, {expireAfterSeconds: 2592000});
const PayrollHistory = mongoose.model('payrollhistories', payrollHistorySchema)

module.exports = PayrollHistory

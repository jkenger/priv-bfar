const mongoose = require('mongoose')
const PayrollGroup = require('./PayrollGroup')

const payrollHistorySchema = mongoose.Schema({
    payroll_group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: PayrollGroup.collection.name,
        required: true
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

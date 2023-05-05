const mongoose = require('mongoose')

const payrollHistorySchema = mongoose.Schema({
    emp_code: {type: String},
    month:{type: String},
    name: {type: String},
    gross_amount_earned: {type: Number},
    net_amount_due: {type:Number},
},
{timestamps: true}
)
payrollHistorySchema.index({createdOn: 1}, {expireAfterSeconds: 2592000});
const PayrollHistory = mongoose.model('payrollhistories', payrollHistorySchema)

module.exports = PayrollHistory

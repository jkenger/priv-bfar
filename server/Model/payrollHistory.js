const mongoose = require('mongoose')
const PayrollGroup = require('./PayrollGroup')

const payrollHistorySchema = mongoose.Schema({
    payroll_group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: PayrollGroup.collection.name,
        required: true
    },
    serial_no:{
        type: Number,
    },
    name:{
        type: String,
    },
    designation:{
        type: String,
    },
    prc:{
        type: String,
    },
    monthly_salary:{
        type: Number,
    },
    no_of_days:{
        type: Number,
    },
    gross_amount_due:{
        type: Number,
    },
    tax:{
        tax_1:{
            type: Number,
        },
        tax_2:{
            type: Number,
        },
        tax_3:{
            type: Number,
        }
    },
    contributions:{
        sss:{
            type: Number,
        },
        pagibig:{
            type: Number,
        },
        philhealth:{
            type: Number,
        },
    },
    net_amount_due:{
        type: Number,
    },
},
{timestamps: true}
)
payrollHistorySchema.index({createdOn: 1}, {expireAfterSeconds: 2592000});
const PayrollHistory = mongoose.model('payrollhistories', payrollHistorySchema)

module.exports = PayrollHistory

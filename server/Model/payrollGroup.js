const mongoose = require('mongoose');

const payrollTypeSchema = new mongoose.Schema({
    fund_cluster:  {
        type: String,
        required: true
    },
    project_name:  {
        type: String,
        required: true
    },
    //not required
    program_name:  {
        type: String,
        required: false
    },
},{
    timestamps: true
});

const PayrollType = mongoose.model('payrollgroups', payrollTypeSchema);

module.exports = PayrollType;

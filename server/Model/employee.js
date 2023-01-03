const mongoose = require('mongoose')
const validator = require('validator')

const EmpSchema = mongoose.Schema({
    image_url: {
        type: String
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    emp_code:{
        type:String,
        unique:true,
        required: [true, "ID No. is required"]
    },
    rfid: {
        type: String,
        unique:true
    },
    age: {
        type: Number,
        required: [true, "Age is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Enter a valid email."]
    },
    contact: {
        type: String,
        required: [true, "Contact number is required"],
        validate: [validator.isMobilePhone, 'Enter a valid phone number. Contact must start with 0 (ex. 09123456879)'],
        minLength: [10, 'Contact number must not be less than 10 chars']
    },
    position:{
        type: String,
        required: [true, "Designation role is required"],
    },
    salary: {
        type: Number,
        required: [true, "Salary is required"]
    },
    isDeleted: {
        type: Boolean,
    },
    employeeType: {
        type: String
    },
    employeeProject: {
        type: String
    }
})

EmpSchema.pre('updateOne', function(next) {
    this.options.runValidators = true;
    next();
  });
EmpSchema.statics.getProjectedEmployees = async function(){
    const result = await this.find({}, {
        emp_code: 1, 
        name: 1, 
        position: 1, 
        employeeProject: 1, 
        employeeType: 1
    })
    return result
}
EmpSchema.statics.getTotalData = async function(){
    pipeline = [
        {$match: {}},
        {$project: {
            emp_code: 1, 
            name: 1, 
            position: 1, 
            employeeProject: 1, 
            employeeType: 1
        }},
        {$group: {
            _id: '$emp_code',
            totalEmployees: {$sum: 1},
            employeeType: {$mergeObjects:{
                contractual: {$cond:{
                    if: {$eq: ['$employeeType', 'Contractual']},
                    then: 1,
                    else: 0
                }},
                permanent: {$cond: {
                    if: {$eq: ['$employeeType', 'Permanent']},
                    then: 1,
                    else: 0
                }}
            }}
        }},
        {$group:{
            _id: null,
            totalEmployees: {$sum: 1},
            contractual: {$sum: '$employeeType.contractual'},
            permanent: {$sum: '$employeeType.permanent'}
        }}
    ]
    const result = await this.aggregate(pipeline)
    return result
}

const Employee = mongoose.model('employees', EmpSchema)

module.exports = Employee
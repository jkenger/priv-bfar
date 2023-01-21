const mongoose = require('mongoose')
const validator = require('validator')

const employeeSchema = mongoose.Schema({
    personal_information:{
        fname:{
            type: String,
            required: [true, "First name is required"]
        },
        mname:{
            type: String,
            required: [true, "Middle name is required"]
        },
        lname:{
            type: String,
            required: [true, "Last name is required"]
        },
        name:{
            type: String,
        },
        gender:{
            type: String,
            required: [true, "Gender is required"]
        },
        civstatus:{
            type: String,
            required: [true, "Civil status is required"]
        },
        height:{
            type: Number,
            required: [true, "Height is required"]
        },
        weight:{
            type: Number,
            required: [true, "Weight is required"]
        },
        email_personal:{
            type: String,
            unique:true,
            lowercase: true,
            validate: [validator.isEmail, "Enter a valid email."],
            required: [true, "Email is required"],
        },
        contact_personal:{
            type: String,
            unique:true,
            required: [true, "Contact number is required"],
            validate: [validator.isMobilePhone, 'Enter a valid phone number. Contact must start with 0 (ex. 09123456879)'],
            minLength: [10, 'Contact number must not be less than 10 chars']
        },
        age:{
            type: Number,
            required: [true, "Age is required"]
        },
        natl_id:{
            type: String,
            unique:true,
        },
        date_of_birth:{
            type: Date,
            required: [true, "Date of birth is required"]
        },
        place_of_birth:{
            type: String,
            required: [true, "Place of birth is required"]
        },
        avatar:{
            type: String,
        }
    },
    employee_details:{
        designation:{
            company:{
                type: String,
                required: [true, "Company is required"]
            },
            company_location:{
                type: String,
                required: [true, "Company location is required"]
            },
            designation:{
                type: String,
                required: [true, "Designation is required"]
            },
            id:{
                type: String,
                unique:true,
                required: [true, "ID is required"]
            },
            rfid:{
                type: String,
                required: [true, "RFID is required"]
            },
            email_company:{
                type: String,
                lowercase: true,
                validate: [validator.isEmail, "Enter a valid email."],
                required: [true, "Email is required"],
            },
            leave_group:{
                type: String,
            }
        },
        employment_information:{
            employment_type:{
                type: String,
                required: [true, "Employment type is required"]
            },
            employment_status:{
                type: String,
                required: [true, "Employment status is required"]
            },
            date_hired:{
                type: Date,
            }
        },
        salary_details:{
            monthly_salary:{
                type: Number,
                required: [true, "Monthly salary is required"]
            }
        }
    }
})

employeeSchema.pre('save', async function(){
    console.log('pre save')
    console.log(this.personal_information.fname + ' ' + this.personal_information.mname + ' ' + this.personal_information.lname)
    this.personal_information.name = this.personal_information.fname + ' ' + this.personal_information.mname + ' ' + this.personal_information.lname
    console.log(this.personal_information.name)

})


employeeSchema.pre('updateOne', function(next) {
    this.options.runValidators = true;
    next();
});
employeeSchema.statics.getProjectedEmployees = async function(){
    let doc = []
    const result = await this.find({}).select({
        id: '$employee_details.designation.id',
        name: '$personal_information.name',
        designation: '$employee_details.designation.designation',
        employment_type: '$employee_details.employment_information.employment_type',
        employee_project: ''
    })
    console.log(result)
    return result

  

}
// EmpSchema.statics.getTotalData = async function(){
//     pipeline = [
//         {$match: {}},
//         {$project: {
//             emp_code: 1, 
//             name: 1, 
//             position: 1, 
//             employeeProject: 1, 
//             employeeType: 1
//         }},
//         {$group: {
//             _id: '$emp_code',
//             totalEmployees: {$sum: 1},
//             employeeType: {$mergeObjects:{
//                 contractual: {$cond:{
//                     if: {$eq: ['$employeeType', 'Contractual']},
//                     then: 1,
//                     else: 0
//                 }},
//                 permanent: {$cond: {
//                     if: {$eq: ['$employeeType', 'Permanent']},
//                     then: 1,
//                     else: 0
//                 }}
//             }}
//         }},
//         {$group:{
//             _id: null,
//             totalEmployees: {$sum: 1},
//             contractual: {$sum: '$employeeType.contractual'},
//             permanent: {$sum: '$employeeType.permanent'}
//         }}
//     ]
//     const result = await this.aggregate(pipeline)
//     return result
// }

const Employee = mongoose.model('bfaremployees', employeeSchema)

module.exports = Employee
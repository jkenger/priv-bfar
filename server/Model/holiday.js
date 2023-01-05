const mongoose = require('mongoose')
const validator = require('validator')

const Schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    description:{
        type: String
    },
    preDate: {
        type: String,
        required: [true, 'Date is required']
    },
    date: {
        type: String,
        required: [true, 'Date is required']
    }
}, {timestamps:true})

Schema.statics.getHolidayDates = async function(fromDate, toDate){
    const from = fromDate
    const to = toDate
    let holidayDates = []
    const holidays = await this.find().sort({date: 1})
    holidays.forEach(holiday=>{
        let date = new Date(holiday.date)
        // if holiday date is within two queried date, add as valid holiday dates.
        if(from < date && to > date){
            holidayDates.push({
                preDate: new Date(holiday.preDate),
                date: new Date(holiday.date)
            })
        }
    })
    return holidayDates
}

const Holiday = mongoose.model('holidays', Schema)
module.exports = Holiday
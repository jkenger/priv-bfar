const Holiday = require('../../Model/holiday')

const getHolidays = async()=>{
    return await Holiday.find().sort({date: 1})
}

const getHolidayDates = async (fromDate, toDate)=>{
    const from = fromDate
    const to = toDate
    let holidayDates = []
    const holidays = await getHolidays()
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

module.exports = {getHolidays, getHolidayDates}
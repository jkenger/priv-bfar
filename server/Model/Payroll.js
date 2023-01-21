const mongoose = require('mongoose')
const Deductions = require('./deductions')
const Holiday = require('./../Model/holiday')
const countWeekdays = require('./../Controller/services/calendarDays')
const employees = require('./employeee')

const payrollSchema = mongoose.Schema({
    emp_code: {
        type: String
    },
    name: {
        type:String
    },
    designation: {
        type:String
    },
    no_of_days:{
        type: Number
    },
    no_of_hours: {
        type: Number
    },
    net_pay:{
        type: Number
    },
    status: {
        type: String,
        default: 'OP'
    }
})

payrollSchema.statics.getPayrollData = async function(fromDate, toDate){
    const holidayDates = await Holiday.getHolidayDates(fromDate, toDate);

    const deductions = await Deductions.find().sort({createdAt: 1})
    const calendarDays = await countWeekdays(fromDate, toDate)
    const tax = 0.02

    const pipeline = [
        {$lookup: {
            from: 'attendances',
            localField: 'employee_details.designation.id',
            foreignField: 'emp_code',
            as: 'attendances',
            let: { time_in: '$time_in', time_out: '$time_out'},
            pipeline: [{ $match: { $or: [{$or: [{am_time_out: { $ne: null }}, {$or: [{message: 'T.O'}, {message: 'O.B'}]}]}, { pm_time_out: { $ne: null } }], date: { $gte: fromDate, $lte: toDate}},  }] // NOTE: fromdate and todate should be formatted for accurate results
            
        }},
        {$addFields:{
            attendances_dup: '$attendances'
        }},
        // IF ONE ATTENDANCE TIME OUT IS EMPTY, COUNT AS HALF or .5 
        {$unwind: '$attendances'},
        {$project: {
                _id: '$emp_code',
                emp_code: '$employee_details.designation.id',
                name: '$personal_information.name',
                salary: '$employee_details.salary_details.monthly_salary',
                designation: '$employee_details.designation.designation',
                attendances_dup: 1,
                fromDate: fromDate,
                toDate: toDate,
                // no_of_undertime: { $dateDiff: { startDate: "$attendances.am_office_in", endDate: "$attendances.am_time_in", unit: "minute" }}
                holiday_dates: {$cond:{
                    if: {$eq:[holidayDates.length, 0]},
                    then: 0,
                    else: holidayDates
                }},
                date: '$attendances.date'

        }},
        {$unwind:'$holiday_dates'},
        {$addFields:{
            holidays:{$cond:{
                if: {$eq:['$holiday_dates.preDate', '$date']},
                then: 1,
                else: 0
            }}
        }},
        {$group:{
            _id: '$emp_code',
            name: {$first: '$name'},
            emp_code: {$first: '$emp_code'},
            salary: {$first: '$salary'},
            designation: {$first: '$designation'},
            attendances_dup: {$first: '$attendances_dup'},
            holidays: {$sum: '$holidays'},
        }},
        {$unwind: '$attendances_dup'},
        {$project: {
            _id: '$_id',
            emp_code: 1,
            name: 1,
            salary: 1,
            designation: 1,
            holidays: 1,
            isUndertime: '$attendances_dup.isUndertime',
            isLate: '$attendances_dup.isLate',
            whalf_days: { $cond: { if: { $eq: ['$attendances_dup.isHalf', true] }, then: { $sum: .5 }, else: { $sum: 1 } } },// 
            am_office: '$attendances_dup.am_office_in',
            pm_office: '$attendances_dup.pm_office_in',
            am_office_out: '$attendances_dup.am_office_out',
            pm_office_out: '$attendances_dup.pm_office_out',
            am: '$attendances_dup.am_time_in',
            pm: '$attendances_dup.pm_time_in',
            am_out: '$attendances_dup.am_time_out',
            pm_out: '$attendances_dup.pm_time_out',
            // no_of_undertime: { $dateDiff: { startDate: "$attendances.am_office_in", endDate: "$attendances.am_time_in", unit: "minute" }}
            date: '$attendances_dup.date'

        }},
        {$addFields: {
            no_of_late: {$cond: {
            if: { $eq: ['$isLate', false] },
            then: 0,
            else: {
                $sum: [{$cond:{
                    if: { $lt: [{ $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" } }, 0] },
                    then: 0,
                    else: { $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" } }
                }},
                {$cond: {
                    if: { $lt: [{ $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" } }, 0] },
                    then: 0,
                    else: { $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" } }
                }}]}
            }},
            no_of_undertime: {$cond: {
                if: { $eq: ['$isUndertime', false] },
                then: 0,
                else: {
                    $sum: [{$cond:{
                        if: { $lt: [{ $dateDiff: { startDate: "$am_office_out", endDate: "$am_out", unit: "minute" } }, 0] },
                        then: 0,
                        else: { $dateDiff: { startDate: "$am_office_out", endDate: "$am_out", unit: "minute" } }
                    }},
                    {$cond: {
                        if: { $lt: [{ $dateDiff: { startDate: "$pm_office_out", endDate: "$pm_out", unit: "minute" } }, 0] },
                        then: 0,
                        else: { $dateDiff: { startDate: "$pm_office_out", endDate: "$pm_out", unit: "minute" } }
                    }}]}
                }}
        }},
        {$group:{
            _id:'$emp_code',
            emp_code: {$first: '$emp_code'},
            name: {$first: '$name'},
            salary: {$first: '$salary'},
            designation: {$first: '$designation'},
            holidays: {$first: '$holidays'},
            isLate: {$first: '$isLate'},
            whalf_days: {$sum: '$whalf_days'},
            total_days: {$sum: '$whalf_days'},
            date: {$first: '$date'}, 
            no_of_late: {$sum: '$no_of_late'},
            no_of_undertime: {$sum: '$no_of_undertime'},
        }},
        {$addFields:{
            holidays_deduction:{$cond:{
                if: {$lte:[{$cond:{
                        if: {$eq:['$holidays', 0]},
                        then: holidayDates.length,
                        else: {$subtract: [holidayDates.length, '$holidays']}
                    }}, 0]},
                then: 0,
                else: {$cond:{
                    if: {$eq:['$holidays', 0]},
                    then: holidayDates.length,
                    else: {$subtract: [holidayDates.length, '$holidays']}
                }}
            }}
        }},

        // this pipeline [GROUP] can be used for debugging.
        {$group: {
            _id: '$_id',
            emp_code: { $first: '$emp_code' },
            name: { $first: '$name' },
            designation: { $first: '$designation' },
            salary: { $first: '$salary' },
            date: {$first: '$date'},
            total_days: {$first: '$total_days'},
            whalf_days: { $first: '$whalf_days'},
            no_of_undertime: { $first: '$no_of_undertime' },
            no_of_late: {$first: '$no_of_late'},
            holiday: { $first: '$holidays'},
            holiday_deduction: {$first: '$holidays_deduction'},
            // holiday_deduction: {$first: 0}, //test
            // whalf_days: {$first: 11}, // test
            // holiday: { $first: 0}, //test
            // no_of_undertime: {$first: 32} // test
        }},
        {$addFields:{
            semimo_rate: { $divide: ['$salary', 2] },
            whalf_days: {$cond:{
                if: {$gte: ['$holiday_deduction', 1]}, then: {$cond:{
                    if:{$lte: [{$subtract: ['$whalf_days', '$holiday_deduction']}, 0]},
                    then: 0,
                    else: {$subtract: ['$whalf_days', '$holiday_deduction']}
                }}, //deduct on number of holidays
                else: '$whalf_days'
            }},
        }},
        {$addFields:{
            whalf_days: {
                $switch: {
                    branches: [
                        // no holiday, no additions
                        {case: { $eq: ['$holiday', 0] }, then: {$cond: {
                            if: {$gte: ['$whalf_days', calendarDays]},
                            then: calendarDays,
                            else: '$whalf_days'
                        }}},                
                        {case: { $gte: ['$holiday', 1] }, then: {
                            $cond: {
                                if: {$gte: [{ $sum: ['$whalf_days', '$holiday'] }, calendarDays] },
                                then: calendarDays,
                                else: { $sum: ['$whalf_days', '$holiday'] }
                            }
                        }},
                    ]
                }
            },
            holiday_additional:{$round: [{$multiply: ['$holiday',{$divide: ['$semimo_rate', calendarDays]}]}    , 2]},
            holiday_rate_deduction: {$round: [{$multiply: ['$holiday_deduction', {$divide: ['$semimo_rate', calendarDays]}]},2]},
            no_of_absents: {$cond: {
                if: { $lt: [{ $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }, 0] },
                then: 0,
                else: { $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }
            }},
                // IF HAS ABSENTEE, RETRIEVE ABSENTEE DEDUCTION
            hasab_deduction: { 
            $let: {
                vars: {
                    daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                    no_of_absents: {$cond: {
                        if: { $lt: [{ $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }, 0] },
                        then: 0,
                        else: { $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }
                    }
                }},
                in: { $round: [{ $multiply: ['$$no_of_absents', '$$daily_rate'] }, 2] }
                }
            },

            // IF HAS UNDERTIME, RETRIEVE UNDERTIME DEDUCTION
            // ut_deduction = (((dailyrate / 8hr) / 60 secs) * 32) * no_of_undertime
            late_deduction: {
                $let: {
                    vars: {
                        semimo_rate: { $round: [{ $divide: ['$salary', 2] }, 2] },
                        daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                    },
                    in: { $round: [{ $multiply: [{ $round: [{ $divide: [{ $divide: ['$$daily_rate', 8] }, 60] }, 2] }, '$no_of_late'] }, 2] }
                }
            },

            ut_deduction: {
                $let: {
                    vars: {
                        semimo_rate: { $round: [{ $divide: ['$salary', 2] }, 2] },
                        daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                    },
                    in: { $round: [{ $multiply: [{ $round: [{ $divide: [{ $divide: ['$$daily_rate', 8] }, 60] }, 2] }, '$no_of_undertime'] }, 2] }
                }
            },
        }},
        {$group: {
            _id: '$_id',
            emp_code: { $first: '$emp_code' },
            name: { $first: '$name' },
            designation: { $first: '$designation' },
            salary: { $first: '$salary' },
            whalf_days: { $first: '$whalf_days' },
            total_days: {$first: '$total_days'},
            no_of_undertime: { $first: '$no_of_undertime' },
            no_of_late: { $first: '$no_of_late' },
            no_of_absents: {$first: '$no_of_absents'},
            date: {$first: '$date'},
            holiday: { $first: '$holiday' },
            holiday_additional: {$first: '$holiday_additional'},
            holiday_deduction: {$first: '$holiday_deduction'},
            holiday_rate_deduction: {$first: '$holiday_rate_deduction'},
            gross_salary: {$first: '$semimo_rate'},
            semimo_salary: {$first: '$semimo_rate'},
            hasab_deduction: {$first: '$hasab_deduction'},
            ut_deduction: {$first: '$ut_deduction'},
            late_deduction: {$first: '$late_deduction'},
        }},

        {$addFields: {
            // gross salary deductions
            salaries_earned: { $round: [{ $subtract: ['$gross_salary', '$hasab_deduction']}, 2] },
            gross_salary: { $round: [{ $subtract: ['$gross_salary', { $sum: ['$hasab_deduction', '$ut_deduction', '$late_deduction'] }] }, 2] },
            
            // initiate net salary deductions
            // (semimo salary - 10417) *.02 // 2% Tax
            tax_deduction: {$round:[{$cond: {
                if: {$lte:[{$multiply: [{$subtract: ['$semimo_salary', 10417]}, tax]}, 0]},
                then: 0,
                else: {$multiply: [{$subtract: ['$semimo_salary', 10417]}, tax]}
                },
            },2]},
            other_deductions: {$cond: {
                if: {$lte: [deductions.length, 0]},
                then: 0,
                else: deductions
            }},
        }},
        {$unwind: '$other_deductions'},
        {$group:{
            _id: '$_id',
            emp_code: {$first: '$emp_code'},
            name:{$first:'$name'},
            designation: { $first: '$designation' },
            salary: { $first: '$salary' },
            whalf_days: { $first: '$whalf_days' },
            total_days: {$first: '$total_days'},
            no_of_undertime: { $first: '$no_of_undertime'},
            no_of_late: {$first: '$no_of_late'},
            no_of_absents: {$first: '$no_of_absents'},
            date: {$first: '$date'},
            holiday: { $first: '$holiday' },
            holiday_additional: {$first: '$holiday_additional'},
            holiday_deduction: {$first: '$holiday_deduction'},
            holiday_rate_deduction: {$first: '$holiday_rate_deduction'},
            gross_salary: {$first: '$gross_salary'},
            semimo_salary: {$first: '$semimo_salary'},
            hasab_deduction: {$first: '$hasab_deduction'},
            ut_deduction: {$first: '$ut_deduction'},
            late_deduction: {$first: '$late_deduction'},
            tax_deduction: {$first: '$tax_deduction'},
            total_other_deductions: {$sum: '$other_deductions.amount'}
        }},
        {$addFields: {
            // gross salary - tax deduction, other deductions
            other_deductions: {$cond: {
                if: {$lte: [deductions.length, 0]},
                then: 0,
                else: deductions
            }},
            net_amount_due: {$round:[{$subtract: [{$subtract: ['$gross_salary', '$tax_deduction']}, '$total_other_deductions']}, 2]}
        }},
        
        {$group:{
            _id: '$_id',
            emp_code: { $first: '$emp_code' },
            name: { $first: '$name' },
            designation: { $first: '$designation' },
            salary: { $first: '$salary' },
            semimo_salary: {$first: '$semimo_salary'},
            attendance:{$mergeObjects:{
                calendar_days: calendarDays,
                total_days: '$total_days',
                whalf_days: '$whalf_days' ,
                no_of_undertime: '$no_of_undertime',
                no_of_late: '$no_of_late',
                no_of_absents: '$no_of_absents',
                holiday:'$holiday',
            }},
            earnings:{$mergeObjects:{
                semimo_salary: '$semimo_salary',
                holiday_additional: '$holiday_additional'
            }},
            deduction:{$mergeObjects:{
                holiday_deduction: '$holiday_deduction',
                holiday_rate_deduction: '$holiday_rate_deduction',
                hasab_deduction: '$hasab_deduction',
                tax_deduction: '$tax_deduction',
                ut_deduction: '$ut_deduction',
                late_deduction: '$late_deduction'
            }},
            other_deductions:{$mergeObjects:{
                deductions: '$other_deductions',
                deductions_total: '$total_other_deductions'
            }},
            total_deductions: {$first:{$add: [
                '$holiday_rate_deduction', 
                '$hasab_deduction', 
                '$tax_deduction',
                '$ut_deduction',
                '$late_deduction',
                '$total_other_deductions'
            ]}},
            total_earnings: {$first: {$add:[
                '$semimo_salary',
                '$holiday_additional'
            ]}},
            salaries:{$mergeObjects:{
                gross_salary: '$gross_salary',
                net_salary:'$net_amount_due'
            }}
        }},
        // // {$unwind: '$attendance'},
        // // {$unwind: '$deuction'},
        // // {$unwind: '$salary'},
    ]
    const result = await employees.aggregate(pipeline)
    return result 
}

payrollSchema.statics.getTotalData = async function(fromDate, toDate){
    const holidayDates = await Holiday.getHolidayDates(fromDate, toDate);

    const deductions = await Deductions.find().sort({createdAt: 1})
    const calendarDays = await countWeekdays(fromDate, toDate)
    console.log(calendarDays)
    const tax = 0.02

    const pipeline = [
        {$lookup: {
            from: 'attendances',
            localField: 'emp_code',
            foreignField: 'emp_code',
            as: 'attendances',
            let: { time_in: '$time_in', time_out: '$time_out'},
            pipeline: [{ $match: { $or: [{$or: [{am_time_out: { $ne: null }}, {$or: [{message: 'T.O'}, {message: 'O.B'}]}]}, { pm_time_out: { $ne: null } }], date: { $gte: fromDate, $lte: toDate}},  }] // NOTE: fromdate and todate should be formatted for accurate results
            
        }},
        {$addFields:{
            attendances_dup: '$attendances'
        }},
        // IF ONE ATTENDANCE TIME OUT IS EMPTY, COUNT AS HALF or .5 
        {$unwind: '$attendances'},
        {$project: {
                _id: '$emp_code',
                emp_code: 1,
                name: 1,
                salary: 1,
                designation: '$position',
                attendances_dup: 1,
                fromDate: fromDate,
                toDate: toDate,
                // no_of_undertime: { $dateDiff: { startDate: "$attendances.am_office_in", endDate: "$attendances.am_time_in", unit: "minute" }}
                holiday_dates: {$cond:{
                    if: {$eq:[holidayDates.length, 0]},
                    then: 0,
                    else: holidayDates
                }},
                date: '$attendances.date'

        }},
        {$unwind:'$holiday_dates'},
        {$addFields:{
            holidays:{$cond:{
                if: {$eq:['$holiday_dates.preDate', '$date']},
                then: 1,
                else: 0
            }}
        }},
        {$group:{
            _id: '$emp_code',
            name: {$first: '$name'},
            emp_code: {$first: '$emp_code'},
            salary: {$first: '$salary'},
            designation: {$first: '$designation'},
            attendances_dup: {$first: '$attendances_dup'},
            holidays: {$sum: '$holidays'},
        }},
        {$unwind: '$attendances_dup'},
        {$project: {
            _id: '$_id',
            emp_code: 1,
            name: 1,
            salary: 1,
            designation: 1,
            holidays: 1,
            isUndertime: '$attendances_dup.isUndertime',
            isLate: '$attendances_dup.isLate',
            whalf_days: { $cond: { if: { $eq: ['$attendances_dup.isHalf', true] }, then: { $sum: .5 }, else: { $sum: 1 } } },// 
            am_office: '$attendances_dup.am_office_in',
            pm_office: '$attendances_dup.pm_office_in',
            am_office_out: '$attendances_dup.am_office_out',
            pm_office_out: '$attendances_dup.pm_office_out',
            am: '$attendances_dup.am_time_in',
            pm: '$attendances_dup.pm_time_in',
            am_out: '$attendances_dup.am_time_out',
            pm_out: '$attendances_dup.pm_time_out',
            // no_of_undertime: { $dateDiff: { startDate: "$attendances.am_office_in", endDate: "$attendances.am_time_in", unit: "minute" }}
            date: '$attendances_dup.date'

        }},
        {$addFields: {
            no_of_late: {$cond: {
            if: { $eq: ['$isLate', false] },
            then: 0,
            else: {
                $sum: [{$cond:{
                    if: { $lt: [{ $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" } }, 0] },
                    then: 0,
                    else: { $dateDiff: { startDate: "$am_office", endDate: "$am", unit: "minute" } }
                }},
                {$cond: {
                    if: { $lt: [{ $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" } }, 0] },
                    then: 0,
                    else: { $dateDiff: { startDate: "$pm_office", endDate: "$pm", unit: "minute" } }
                }}]}
            }},
            no_of_undertime: {$cond: {
                if: { $eq: ['$isUndertime', false] },
                then: 0,
                else: {
                    $sum: [{$cond:{
                        if: { $lt: [{ $dateDiff: { startDate: "$am_office_out", endDate: "$am_out", unit: "minute" } }, 0] },
                        then: 0,
                        else: { $dateDiff: { startDate: "$am_office_out", endDate: "$am_out", unit: "minute" } }
                    }},
                    {$cond: {
                        if: { $lt: [{ $dateDiff: { startDate: "$pm_office_out", endDate: "$pm_out", unit: "minute" } }, 0] },
                        then: 0,
                        else: { $dateDiff: { startDate: "$pm_office_out", endDate: "$pm_out", unit: "minute" } }
                    }}]}
                }}
        }},
        {$group:{
            _id:'$emp_code',
            emp_code: {$first: '$emp_code'},
            name: {$first: '$name'},
            salary: {$first: '$salary'},
            designation: {$first: '$designation'},
            holidays: {$first: '$holidays'},
            isLate: {$first: '$isLate'},
            whalf_days: {$sum: '$whalf_days'},
            total_days: {$sum: '$whalf_days'},
            date: {$first: '$date'}, 
            no_of_late: {$sum: '$no_of_late'},
            no_of_undertime: {$sum: '$no_of_undertime'},
        }},
        {$addFields:{
            holidays_deduction:{$cond:{
                if: {$lte:[{$cond:{
                        if: {$eq:['$holidays', 0]},
                        then: holidayDates.length,
                        else: {$subtract: [holidayDates.length, '$holidays']}
                    }}, 0]},
                then: 0,
                else: {$cond:{
                    if: {$eq:['$holidays', 0]},
                    then: holidayDates.length,
                    else: {$subtract: [holidayDates.length, '$holidays']}
                }}
            }}
        }},

        // this pipeline [GROUP] can be used for debugging.
        {$group: {
            _id: '$_id',
            emp_code: { $first: '$emp_code' },
            name: { $first: '$name' },
            designation: { $first: '$designation' },
            salary: { $first: '$salary' },
            date: {$first: '$date'},
            total_days: {$first: '$total_days'},
            whalf_days: { $first: '$whalf_days'},
            no_of_undertime: { $first: '$no_of_undertime' },
            no_of_late: {$first: '$no_of_late'},
            holiday: { $first: '$holidays'},
            holiday_deduction: {$first: '$holidays_deduction'},
            // holiday_deduction: {$first: 0}, //test
            // whalf_days: {$first: 11}, // test
            // // holiday: { $first: 0}, //test
            // no_of_undertime: {$first: 32} // test
        }},
        {$addFields:{
            semimo_rate: { $divide: ['$salary', 2] },
            whalf_days: {$cond:{
                if: {$gte: ['$holiday_deduction', 1]}, then: {$cond:{
                    if:{$lte: [{$subtract: ['$whalf_days', '$holiday_deduction']}, 0]},
                    then: 0,
                    else: {$subtract: ['$whalf_days', '$holiday_deduction']}
                }}, //deduct on number of holidays
                else: '$whalf_days'
            }},
        }},
        {$addFields:{
            whalf_days: {
                $switch: {
                    branches: [
                        // no holiday, no additions
                        {case: { $eq: ['$holiday', 0] }, then: {$cond: {
                            if: {$gte: ['$whalf_days', calendarDays]},
                            then: calendarDays,
                            else: '$whalf_days'
                        }}},                
                        {case: { $gte: ['$holiday', 1] }, then: {
                            $cond: {
                                if: {$gte: [{ $sum: ['$whalf_days', '$holiday'] }, calendarDays] },
                                then: calendarDays,
                                else: { $sum: ['$whalf_days', '$holiday'] }
                            }
                        }},
                    ]
                }
            },
            holiday_additional:{$round: [{$multiply: ['$holiday',{$divide: ['$semimo_rate', calendarDays]}]}    , 2]},
            holiday_rate_deduction: {$round: [{$multiply: ['$holiday_deduction', {$divide: ['$semimo_rate', calendarDays]}]},2]},
            no_of_absents: {$cond: {
                if: { $lt: [{ $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }, 0] },
                then: 0,
                else: { $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }
            }},
                // IF HAS ABSENTEE, RETRIEVE ABSENTEE DEDUCTION
            hasab_deduction: { 
            $let: {
                vars: {
                    daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                    no_of_absents: {$cond: {
                        if: { $lt: [{ $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }, 0] },
                        then: 0,
                        else: { $subtract: [calendarDays, { $sum: ['$whalf_days', '$holiday'] }] }
                    }
                }},
                in: { $round: [{ $multiply: ['$$no_of_absents', '$$daily_rate'] }, 2] }
                }
            },

            // IF HAS UNDERTIME, RETRIEVE UNDERTIME DEDUCTION
            // ut_deduction = (((dailyrate / 8hr) / 60 secs) * 32) * no_of_undertime
            late_deduction: {
                $let: {
                    vars: {
                        semimo_rate: { $round: [{ $divide: ['$salary', 2] }, 2] },
                        daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                    },
                    in: { $round: [{ $multiply: [{ $round: [{ $divide: [{ $divide: ['$$daily_rate', 8] }, 60] }, 2] }, '$no_of_late'] }, 2] }
                }
            },

            ut_deduction: {
                $let: {
                    vars: {
                        semimo_rate: { $round: [{ $divide: ['$salary', 2] }, 2] },
                        daily_rate: { $round: [{ $divide: [{ $divide: ['$salary', 2] }, calendarDays] }, 2] },
                    },
                    in: { $round: [{ $multiply: [{ $round: [{ $divide: [{ $divide: ['$$daily_rate', 8] }, 60] }, 2] }, '$no_of_undertime'] }, 2] }
                }
            },
        }},
        {$group: {
            _id: '$_id',
            emp_code: { $first: '$emp_code' },
            name: { $first: '$name' },
            designation: { $first: '$designation' },
            salary: { $first: '$salary' },
            whalf_days: { $first: '$whalf_days' },
            total_days: {$first: '$total_days'},
            no_of_undertime: { $first: '$no_of_undertime' },
            no_of_late: { $first: '$no_of_late' },
            no_of_absents: {$first: '$no_of_absents'},
            date: {$first: '$date'},
            holiday: { $first: '$holiday' },
            holiday_additional: {$first: '$holiday_additional'},
            holiday_deduction: {$first: '$holiday_deduction'},
            holiday_rate_deduction: {$first: '$holiday_rate_deduction'},
            gross_salary: {$first: '$semimo_rate'},
            semimo_salary: {$first: '$semimo_rate'},
            hasab_deduction: {$first: '$hasab_deduction'},
            ut_deduction: {$first: '$ut_deduction'},
            late_deduction: {$first: '$late_deduction'},
        }},

        {$addFields: {
            // gross salary deductions
            salaries_earned: { $round: [{ $subtract: ['$gross_salary', '$hasab_deduction']}, 2] },
            gross_salary: { $round: [{ $subtract: ['$gross_salary', { $sum: ['$hasab_deduction', '$ut_deduction', '$late_deduction'] }] }, 2] },
            
            // initiate net salary deductions
            // (semimo salary - 10417) *.02 // 2% Tax
            tax_deduction: {$cond: {
                if: {$lte:[{$multiply: [{$subtract: ['$semimo_salary', 10417]}, tax]}, 0]},
                then: 0,
                else: {$multiply: [{$subtract: ['$semimo_salary', 10417]}, tax]}
                }
            },
            other_deductions: {$cond: {
                if: {$lte: [deductions.length, 0]},
                then: 0,
                else: deductions
            }},
        }},
        {$unwind: '$other_deductions'},
        {$group:{
            _id: '$_id',
            emp_code: {$first: '$emp_code'},
            name:{$first:'$name'},
            designation: { $first: '$designation' },
            salary: { $first: '$salary' },
            whalf_days: { $first: '$whalf_days' },
            total_days: {$first: '$total_days'},
            no_of_undertime: { $first: '$no_of_undertime'},
            no_of_late: {$first: '$no_of_late'},
            no_of_absents: {$first: '$no_of_absents'},
            date: {$first: '$date'},
            holiday: { $first: '$holiday' },
            holiday_additional: {$first: '$holiday_additional'},
            holiday_deduction: {$first: '$holiday_deduction'},
            holiday_rate_deduction: {$first: '$holiday_rate_deduction'},
            gross_salary: {$first: '$gross_salary'},
            semimo_salary: {$first: '$semimo_salary'},
            hasab_deduction: {$first: '$hasab_deduction'},
            ut_deduction: {$first: '$ut_deduction'},
            late_deduction: {$first: '$late_deduction'},
            tax_deduction: {$first: '$tax_deduction'},
            total_other_deductions: {$sum: '$other_deductions.amount'}
        }},
        {$addFields: {
            // gross salary - tax deduction, other deductions
            other_deductions: {$cond: {
                if: {$lte: [deductions.length, 0]},
                then: 0,
                else: deductions
            }},
            net_amount_due: {$round:[{$subtract: [{$subtract: ['$gross_salary', '$tax_deduction']}, '$total_other_deductions']}, 2]}
        }},
        
        {$group:{
            _id: '$emp_code',
            total_morate:{$first: '$salary'},
            total_semimorate: {$first: '$semimo_salary'},
            total_grosspay: {$first: '$gross_salary'},
            total_netpay: {$first: '$net_amount_due'},
            total_deductions: {$first:{$add: [
                '$holiday_rate_deduction', 
                '$hasab_deduction', 
                '$tax_deduction',
                '$ut_deduction',
                '$late_deduction',
                '$total_other_deductions'
            ]}}
        }},
        {$group:{
            _id: null,
            total_morate:{$sum: '$total_morate'},
            total_semimorate: {$sum: '$total_semimorate'},
            total_grosspay: {$sum: '$total_grosspay'},
            total_netpay: {$sum: '$total_netpay'},
            total_deductions: {$sum: '$total_deductions'},
        }},
        {$group:{
            _id: null,
            total_morate:{$first: {$round:['$total_morate',2]}},
            total_semimorate: {$first: {$round:['$total_semimorate',2]}},
            total_grosspay: {$first: {$round:['$total_grosspay',2]}},
            total_netpay: {$first: {$round:['$total_netpay',2]}},
            total_deductions: {$first: {$round:['$total_deductions',2]}},
        }},
    ]
    const result = await employees.aggregate(pipeline)
    return result 
}

const Payroll = mongoose.model('payrolls', payrollSchema)

module.exports = Payroll
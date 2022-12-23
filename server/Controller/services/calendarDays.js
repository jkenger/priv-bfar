
const countWeekdays = async (startDate, endDate)=>{
    // Initialize a count to track the number of weekdays
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if(dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }

module.exports = countWeekdays
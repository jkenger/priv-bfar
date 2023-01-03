const setTime = (time, hour, min, sec)=>{
    time.setHours(hour)
    time.setMinutes(min)
    time.setSeconds(sec)
    return time
}

module.exports = setTime
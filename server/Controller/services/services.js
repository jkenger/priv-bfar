const fetch = require('node-fetch')
const fetchData = async (url) => {
    console.log(url)
    const result = await fetch(`https://bfarms.onrender.com/${url}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET'
    })
    const data = await result.json()
    return data
}


const errorHandler = (err) => {
    const error = { email: '', password: ''}
    const empFormErr = { 
        name: '',
        emp_code: '', 
        rfid: '', 
        age: '', 
        email: '', 
        contact: '', 
        position:'', 
        salary: '',
    }
    const holidayErr = {
        name: '',
        preDate: '',
        date: ''
    }
    const travelPassErr = {
        id: '',
        name: '',
        fromdate: '',
        todate: ''
    }
    
    //LOGIN
    if (err.message === 'Invalid email') {
        error.email = err.message
        return error
    }
    if (err.message === 'Invalid password') {
        error.password = err.message
        return error
    }

    if (err.code === 11000) { 
        error.email = 'Email already exist.' 
        return error
    }

    // ATTENDANCE ERRORS
    if(err.message === 'Office hour ended'){
        error.email = err.message
        return error
    }
    if(err.message.includes('You have already time')){
        error.email = err.message
        return error
    }
    if(err.message.includes('This ID have not')){
        error.email = err.message
        return error
    }
    if(err.message.includes('shift will end at')){
        error.email = err.message
        return error
    }
    if(err.message.includes('shift ended')){
        error.email = err.message
        return error
    }
    if(err.message === 'Cannot log in. Please try again'){
        error.email = err.message
        return error
    }
    if(err.message === 'Log in time will enable at 8:00:00 AM everyday'){
        error.email = err.message
        return error
    }
    if(err.message === 'Cannot logout, try again later'){
        error.email = err.message
        return error
    }

    if(err.message === 'Office hour will end at 5 PM, try again later'){
        error.email = err.message
        return error
    }
    if(err.message.includes('not recognized by the system!')){
        error.email = err.message
        return error
    }
    if(err.message === 'Given date must be equal or ahead of the current date'){
        holidayErr.preDate = err.message
        return holidayErr
    }
    if(err.message === 'Date must be ahead of prerequisite date'){
        holidayErr.date = err.message
        return holidayErr
    }

    if(err.message === 'Dates are required'){
        holidayErr.date = err.message
        return holidayErr
    }

    if(err.message === 'Input must not be empty'){
        holidayErr.preDate = err.message
        holidayErr.date = err.message
        holidayErr.name = err.message
        return holidayErr
    }
    if(err.message.includes('Invalid id')){
        travelPassErr.id = err.message
        return travelPassErr
    }
    if(err.message.includes('Invalid name')){
        travelPassErr.name = err.message
        return travelPassErr
    }
    if(err.message.includes('Cast to date failed')){
        travelPassErr.fromdate = 'Invalid date'
        travelPassErr.todate = 'Invalid date'
        return travelPassErr
    }

    if(err.message.includes('Please enter valid employee code!')){
        error.email = err.message
        return error
    }
    
    if (err.message.includes('users validation failed')) {
        Object.values(err.errors).forEach(properties => {
            error[properties.path] = properties.message
        })
    }
    if (err.message.includes('attendances validation failed')) {
        Object.values(err.errors).forEach(properties => {
            error[properties.path] = properties.message
        })
    }
    if(err.message.includes('employees validation failed')){
        Object.values(err.errors).forEach(properties => {
            empFormErr[properties.path] = properties.message
        })
    }
    if(err.message.includes('holidays validation failed')){
        Object.values(err.errors).forEach(properties => {
            empFormErr[properties.path] = properties.message
        })
    }
    if(err.message.includes('Validation failed')){
        Object.values(err.errors).forEach(properties => {
            empFormErr[properties.path] = properties.message
        })
    }
    
    return error,empFormErr
}

module.exports = {
    fetchData,
    errorHandler
}
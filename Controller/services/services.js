const fetch = require('node-fetch')
const fetchData = async (url) => {
    const result = await fetch(`http://localhost:3000/${url}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET'
    })
    const data = await result.json()
    return data
}


const errorHandler = (err) => {
    const error = { email: '', password: '' }

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

    if(err.message === 'You already logged in'){
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
    return error
}

module.exports = {
    fetchData,
    errorHandler
}
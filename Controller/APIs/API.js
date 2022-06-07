const employees = require('./../../Model/EmployeesSchema')
// APIs

// GET TOTAL NUMBER OF EMPLOYEE
exports.employees_count_get = async (req, res) => {
    const empC = await employees.find().count()
    res.status(200).send({ empC })
}

// GET ALL THE EMPLOYEE
exports.employees_get = async (req, res) => {
    const emp = await employees.find()
    res.status(200).send({ emp })
}

// ATTENDANCE

const { errorHandler, fetchData } = require('./services/services')
// RENDERER
exports.home = async (req, res) => {
    try {
        const data = await fetchData('admin/employees_count_get')
        res.status(200).render('Home', { data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}
exports.employees = async (req, res) => {
    try {
        const data = await fetchData('admin/employees_get')
        res.status(200).render('Employees', { data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}
exports.records = async (req, res) => {
    try {
        const data = await fetchData('admin/records_get')
        res.status(200).render('TimeRecords', { data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}
exports.payroll = async (req, res) => {
    try {
        const fromDate = new Date().toISOString()
        const toDate = new Date().toISOString()
        const data = await fetchData(`admin/payroll_get?from=${fromDate}&to=${toDate}`)
        res.status(200).render('Payroll', {data, url: req.url })
    } catch (err) {
        console.log(err)
    }
}
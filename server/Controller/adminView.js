const { errorHandler, fetchData } = require('./services/services')

const { format } = require('date-fns')
const moment = require('moment')

module.exports = {
    // RENDERER
    home: async (req, res) => {
        try {
            const datas = await fetchData('admin/api/employees_count')
            res.status(200).render('Home', { datas })
        } catch (err) { res.status(500).send(err) }
    },

    employees: async (req, res) => {
        try {
            const datas = await fetchData('admin/api/employees')
            res.status(200).render('Employees', { datas })
        } catch (err) { res.status(500).send(err) }
    },

    addEmployee: async (req, res)=>{
        try{
            res.status(200).render('addEmployee')
        }catch(err) { res.status(500).send(err)}
    },
    viewEmployee: async (req, res)=>{
        try{
            res.status(200).render('addEmployee')
        }catch(err) { res.status(500).send(err)}
    },
    editEmployee: async (req, res)=>{
        try{
            res.status(200).render('addEmployee')
        }catch(err) { res.status(500).send(err)}
    },

    records: async (req, res) => {
        try {
            const data = await fetchData('admin/api/records')
            res.status(200).render('TimeRecords', { data, moment: moment })
        } catch (err) { res.status(500).send(err) }
    },

    payroll: async (req, res) => {
        try {
            // Get the dates then retrieve all the data based from the given dates
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()

            if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()

            const data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}`)
            res.status(200).render('Payroll', { data, url: req.url })

        } catch (err) { res.status(500).send(err) }
    }
}
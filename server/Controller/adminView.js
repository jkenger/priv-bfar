const { errorHandler, fetchData } = require('./services/services')

const { format } = require('date-fns')
const moment = require('moment')

module.exports = {
    // RENDERER
    homeView: async (req, res) => {
        try {
            const datas = await fetchData('admin/api/employees_count')
            res.status(200).render('home', { datas })
        } catch (err) {
             res.status(500).send(err) 
            }
    },

    readEmployeesView: async (req, res) => {
        try {
            const datas = await fetchData('admin/api/employees')
            res.status(200).render('employees', { datas })
        } catch (err) {
            res.status(500).send(err) 
            }
    },

    addEmployeeView: async (req, res)=>{
        try{
            res.status(200).render('addEmployee')
        }catch(err) {
            res.status(500).send(err)
            }
    },
    viewEmployeeView: async (req, res)=>{
        try{
            const id = req.params.id
            if(!id) throw Error('ID not found from the client')
            
            const data = await fetchData(`admin/api/employees/${id}`)
            console.log(data)
            res.status(200).render('viewEmployee', { data })
        }catch(err) {
             res.status(500).send(err)
            }
    },
    editEmployeeView: async (req, res)=>{
        try{
            res.status(200).render('editEmployee')
        }catch(err) {
            res.status(500).send(err)
            }
    },

    // deductions
    deductionView: async(req, res) =>{
      try{
        const data = await fetchData('admin/api/deductions')
        res.status(200).render('deduction', {data, moment: moment})
      } catch(err){
        res.status(500).send(err)
      } 
    },

    recordView: async (req, res) => {
        try {
            const data = await fetchData('admin/api/records')
            res.status(200).render('timeRecords', { data, moment: moment })
        } catch (err) {
            res.status(500).send(err) 
            }
    },

    payrollView: async (req, res) => {
        try {
            // Get the dates then retrieve all the data based from the given dates
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()

            if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()

            const data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}`)
            res.status(200).render('payroll', { data, url: req.url })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    holidayView: async (req, res) => {
        try{
            const data = await fetchData('admin/api/events/holiday')
            res.status(200).render('holiday', {
                data, 
                url: req.url, 
                moment: moment
            })
        }catch(err){
            res.status(500).send(err)
        }
    },
    addHolidayView: async (req, res) => {
        try{
            res.status(200).render('addHoliday')
        }catch(err){
            res.status(500).send(err)
        }
    },
    travelPassView: async (req, res) => {
        try{
            const data = await fetchData('admin/api/events/travelpass')
            res.status(200).render('travelPass', {
                data, 
                url: req.url, 
                moment: moment
            })
            console.log(data)
        }catch(err){
            res.status(500).send(err)
        }
    }
}
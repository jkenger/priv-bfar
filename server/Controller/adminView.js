const { errorHandler, fetchData } = require('./services/services')

const { format } = require('date-fns')
const moment = require('moment')

module.exports = {
    // RENDERER
    dashboardView: async (req, res) => {
        try {
            const datas = await fetchData('admin/api/employees_count')
            res.status(200).render('dashboard', { 
                datas,
                url: req.url
            })
        } catch (err) {
             res.status(500).send(err) 
            }
    },

    readEmployeesView: async (req, res) => {
        try {
            const data = await fetchData('admin/api/employees')
            console.log(data)
            res.status(200).render('employees', { 
                data,
                url: req.url
            })
        } catch (err) {
            res.status(500).send(err) 
            }
    },

    addEmployeeView: async (req, res)=>{
        try{
            res.status(200).render('addEmployee',{
                url: req.url,
                moment: moment
            })
        }catch(err) {
            res.status(500).send(err)
            }
    },
    viewEmployeeView: async (req, res)=>{
        try{
            const id = req.params.id
            if(!id) throw Error('ID not found from the client')
            const data = await fetchData(`admin/api/employees/${id}`)
            res.status(200).render('viewEmployee', { 
                data,
                url: req.url,
                moment: moment
            })
        }catch(err) {
             res.status(500).send(err)
            }
    },
    editEmployeeView: async (req, res)=>{
        try{
            const id = req.params.id
            console.log(id)
            if(!id) throw Error('ID not found from the client')
            const data = await fetchData(`admin/api/employees/${id}`)
            console.log(data)
            res.status(200).render('editEmployee', {
                data,
                url: req.url,
                moment: moment
            })
        }catch(err) {
            res.status(500).send(err)
            }
    },

    // deductions
    deductionView: async(req, res) =>{
      try{
        const data = await fetchData('admin/api/deductions')
        res.status(200).render('deductions', {
            data, 
            url: req.url,
            moment: moment
        })
      } catch(err){
        res.status(500).send(err)
      } 
    },

    attendanceView: async (req, res) => {
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            
            if(!req.query.from || !req.query.to) fromDate = new Date('01-01-1977').toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/records?from=${fromDate}&to=${toDate}`)
            console.log(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('attendance', { 
                data,
                url: req.url,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
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
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log(fromDate, toDate)
            res.status(200).render('payroll', { 
                data, 
                url: req.url, 
                query: {from: fromDate, to: toDate} 
            })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    holidayView: async (req, res) => {
        try{
            const data = await fetchData('admin/api/events/holidays')
            res.status(200).render('holidays', {
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
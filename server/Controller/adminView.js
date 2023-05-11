const { errorHandler, fetchData } = require('./services/services')
const PayrollHistory = require('../Model/payrollHistory')

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
            const payrollTypes = await fetchData('admin/api/payrolltypes')
            res.status(200).render('employees', { 
                data,
                payrollTypes,
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
    attendanceDTRView: async(req, res)=>{
        try {
            const id = req.params.id
            const auth = req.cookies['authorization']
            console.log('view id', id)
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            
            if(!req.query.from || !req.query.to) fromDate = new Date('01-01-1977').toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/records/${id}?&from=${fromDate}&to=${toDate}&auth=${auth}`)
            console.log(data.result)
            
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            if(!data.result.length){
                return res.status(404).render('404')
            }
            res.status(200).render('dailyTimeRecord', { 
                data,
                url: req.url,
                moment: moment,
                query: {from: fromDate, to: toDate}
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
            const pgroup = req.query.p_group
            if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}&p_group=${pgroup}`)
            const group = await fetchData(`admin/api/payrolltypes`)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('VIEW/ EMPLOYEE DATA', data)
            console.log('VIEW/ PAYROLL GROUP', group)

            res.status(200).render('payroll', { 
                data,
                group,
                url: req.url,
                moment: moment,
                query: {from: fromDate, to: toDate, p_group: pgroup}
            })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    payrollReportView: async (req,res)=>{
        try {
            // Get the dates then retrieve all the data based from the given dates
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
                
            if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}`)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('fromn view', data)
            res.status(200).render('payrollReport', { 
                data, 
                url: req.url,
                moment: moment,
                query: {from: fromDate, to: toDate}
            })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    payrollReceiptView: async (req, res)=>{
        try {
            // Get the dates then retrieve all the data based from the given dates
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
                
            if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}`)
            const savedPayroll = await PayrollHistory.create(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('fromn view', data)
            res.status(200).render('payrollReceipt', { 
                data, 
                url: req.url,
                moment: moment,
                query: {from: fromDate, to: toDate}
            })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    payrollTypesView: async (req, res) => {
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
                
            if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolltypes`)
            const employees = await fetchData(`admin/api/employees`)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('fromn view', data)
            res.status(200).render('addPayrollType', { 
                data, 
                url: req.url,
                moment: moment,
                query: {from: fromDate, to: toDate}
            })
            console.log(data)
        } catch (err) {
            res.status(500).send(err) 
        }
    },
    payslipView: async(req, res)=>{
         // Get the dates then retrieve all the data based from the given dates
         const id = req.params.id
         const auth = req.cookies['authorization']
         console.log('view id', id)
         let fromDate = new Date().toISOString()
         let toDate = new Date().toISOString()
             
         if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
         else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
         const data = await fetchData(`admin/api/payrolls/${id}?&from=${fromDate}&to=${toDate}&auth=${auth}`)
         if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
         if(!data.result.length){
            return res.status(404).render('404')
        }
         console.log('fromn view', data.result[0])
            res.status(200).render('payslip', {
                data, 
                url: req.url, 
                moment: moment,
                query: {from: fromDate, to: toDate}
        })
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
    },
    leaveTypesView: async (req, res) => {
        try{
            const data = await fetchData('admin/api/leavetypes')
            res.status(200).render('leaveTypes', {
                data, 
                url: req.url, 
                moment: moment
            })
            console.log(data)
        }catch(err){
            res.status(500).send(err)
        }
    },
    allLeaveView: async (req, res) =>    {
        try{
            const data = await fetchData('admin/api/leave')
            res.status(200).render('allLeave', {
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
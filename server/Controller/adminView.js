const { errorHandler, fetchData } = require('./services/services')
const PayrollHistory = require('../Model/payrollHistory')

const { format } = require('date-fns')
const moment = require('moment')
const PayrollType = require('../Model/payrollGroup')

module.exports = {
    // RENDERER
    dashboardView: async (req, res) => {
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData('admin/api/dashboard')
            console.log(data)
            res.status(200).render('dashboard', { 
                data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        } catch (err) {
            res.status(500).send(err) 
        }
    },

    readEmployeesView: async (req, res) => {
        try {
            const data = await fetchData('admin/api/employees')
            const group = await fetchData('admin/api/payrolltypes')
            res.status(200).render('employees', { 
                data,
                group,
                url: req.baseUrl + req.path
            })
        } catch (err) {
            res.status(500).send(err) 
            }
    },

    addEmployeeView: async (req, res)=>{
        try{
            res.status(200).render('addEmployee',{
                url: req.baseUrl + req.path,
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
                
                url: req.baseUrl + req.path,
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
            const group = await fetchData('admin/api/payrolltypes')
            console.log(data)
            res.status(200).render('editEmployee', {
                data,
                group,
                url: req.baseUrl + req.path,
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
            url: req.baseUrl + req.path,
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
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/all?from=${fromDate}&to=${toDate}`)
            
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('attendance', { 
                data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        } catch (err) {
            res.status(500).send(err) 
        }
    },
    attendancePerEmployeeView: async (req, res) => {
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            let id = req.query.id
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/per-employee?from=${fromDate}&to=${toDate}`)
            console.log('PER EMPLOYEE')
            
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log(fromDate, toDate)
            res.status(200).render('attendancePerEmployee', { 
                data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        } catch (err) {
            res.status(500).send(err) 
        }
    },
    attendanceHistoryView: async (req, res) => {
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/all?from=${fromDate}&to=${toDate}`)
            console.log(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('attendanceHistory', { 
                data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        }catch(err){
        }
    },
    attendancePrintDTRView: async (req, res) => {
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/history?from=${fromDate}&to=${toDate}`)
            console.log(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('attendanceDTR', { 
                data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        }catch(err){
        }
    },
    attendanceHistoryDTRView: async (req, res) => {
        try {
            // Get the dates then retrieve all the data based from the given dates
            const id = req.query.id
            const data = await fetchData(`admin/api/attendance/history?id=${id}`)
            console.log(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('fromn view', data.result[0])
            res.status(200).render('dailyTimeRecord', { 
                data, 
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: data.result[0].date_from, to: data.result[0].date_to}
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
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/${id}?&from=${fromDate}&to=${toDate}&auth=${auth}`)
            console.log('dtr date', fromDate, toDate)
            if(!data.result.length){
                return res.status(404).render('404')
            }
            res.status(200).render('dailyTimeRecordS', { 
                data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate}
            })
        } catch (err) {
            res.status(500).send(err) 
        }
    },
    attendanceSummaryView: async(req, res)=>{
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/all?from=${fromDate}&to=${toDate}`)
            console.log(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('attendanceSummary', { 
                data,
                url: req.baseUrl + req.path,
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
            let pgroup = req.query.p_group
            
            if(pgroup){
                pgroup = pgroup
            }
            if(!pgroup){
                pgroup = ''
            }
            
            console.log('VIEW/ FROM', fromDate)
            console.log('VIEW/ TO', toDate)
            console.log('VIEW/ pgroup', pgroup)
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'YYYY-MM-DD').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            
            
            let data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}&p_group=${pgroup}`)
            data = (data) ? data : []
            let group = await fetchData(`admin/api/payrolltypes`)
            group = (group) ? group : []
            let selectedGroup = await fetchData(`admin/api/payrolltypes/${pgroup}`)
            selectedGroup = (selectedGroup) ? selectedGroup : []
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}

            res.status(200).render('payroll', { 
                data,
                group,
                selectedGroup,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate, p_group: pgroup}
            })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    payrollHistoryView: async (req, res) => {
        try {
            // Get the dates then retrieve all the data based from the given dates
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            const pgroup = req.query.p_group
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolls/history?from=${fromDate}&to=${toDate}&p_group=${pgroup}`)
            const group = await fetchData(`admin/api/payrolltypes`)
            // const selectedGroup = await fetchData(`admin/api/payrolltypes/${pgroup}`)
            // console.log(group)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('VIEW/ EMPLOYEE DATA', data)
            console.log('VIEW/ PAYROLL GROUP', group)
            // console.log('VIEW/ SELECTED PAYROLL GROUP', selectedGroup)
            res.status(200).render('payrollHistory', { 
                data,
                group,
                // selectedGroup,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate, p_group: pgroup}
            })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    payslipsView: async (req, res) => {
        try {
            // Get the dates then retrieve all the data based from the given dates
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            let pgroup = req.query.p_group
            if(pgroup){
                pgroup = pgroup
            }
            if(!pgroup){
                pgroup = ''
            }
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'YYYY-MM-DD').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()

            const data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}&p_group=${pgroup}`)
            const group = await fetchData(`admin/api/payrolltypes`)
            const selectedGroup = await fetchData(`admin/api/payrolltypes/${pgroup}`)
           
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('VIEW/ EMPLOYEE DATA', data)
            // console.log('VIEW/ PAYROLL GROUP', group)
            // console.log('VIEW/ SELECTED PAYROLL GROUP', selectedGroup)

            res.status(200).render('payslip', { 
                data,
                group,
                selectedGroup,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate, p_group: pgroup}
            })

        } catch (err) { 
            res.status(500).send(err) 
        }
    },
    payrollHistoryReceiptView: async (req, res)=>{
        try {
            // Get the dates then retrieve all the data based from the given dates
            const id = req.query.id
            const data = await fetchData(`admin/api/payrolls/history?id=${id}`)
            console.log(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('fromn view', data.result[0])
            res.status(200).render('payrollHistoryReceipt', { 
                data, 
                url: req.baseUrl + req.path,
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
            const pgroup_id = req.query.p_group
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolls?from=${fromDate}&to=${toDate}&p_group=${pgroup_id}`)
            console.log(data)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('fromn view', data)
            res.status(200).render('payrollReceipt', { 
                data, 
                url: req.baseUrl + req.path,
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
                
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolltypes`)
            const employees = await fetchData(`admin/api/employees`)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('fromn view', data)
            res.status(200).render('payrollGroups', { 
                data, 
                url: req.baseUrl + req.path,
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
             
         if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
         else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
         const data = await fetchData(`admin/api/payrolls/${id}?&from=${fromDate}&to=${toDate}&auth=${auth}`)
        console.log('dtr,', fromDate, toDate)
         if(!data.result.length){
            return res.status(404).render('404')
        }
         console.log('fromn view', data.result[0])
            res.status(200).render('payslipReceipt', {
                data, 
                url: req.baseUrl + req.path, 
                moment: moment,
                query: {from: fromDate, to: toDate}
        })
    },
    holidayView: async (req, res) => {
        try{
            const data = await fetchData('admin/api/events/holidays')
            res.status(200).render('holidays', {
                data, 
                url: req.baseUrl + req.path, 
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
                url: req.baseUrl + req.path, 
                moment: moment,
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
                url: req.baseUrl + req.path, 
                moment: moment,
            })
            console.log(data)
        }catch(err){
            res.status(500).send(err)
        }
    },
    allLeaveView: async (req, res) =>    {
        try{
            const id = req.query.id
            const auth = req.cookies['authorization']


            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
                
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            
            const data = await fetchData(`admin/api/leave/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)
            console.log('empdata', data)
            res.status(200).render('allLeave', {
                data, 
                url: req.baseUrl + req.path, 
                moment: moment,
                query: {from: fromDate, to: toDate}
            })
            console.log('leaves', data)
        }catch(err){
            res.status(500).send(err)
        }
    }
}
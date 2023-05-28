const { errorHandler, fetchData } = require('./services/services')
const moment = require('moment')

module.exports = {

    homeView:async (req, res) => {
        try {
            // const datas = await fetchData('admin/api/employees_count')
            res.status(200).render('employeeHome',{
                url: req.baseUrl + req.path
            })
        } catch (err) {
            res.status(500).send(err) 
        }
    },

    employeeLeaveView: async (req, res) => {
        try{
            const id = req.params.id
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            const auth = req.cookies['authorization']

            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()

            const data = await fetchData(`admin/api/leave/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)
           console.log(data)
            res.status(200).render('employeeAllLeave',{
                data: data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        }catch(err){
            res.status(500).send(err)
        }
    },

    attendanceView: async (req, res) => {
        try{
            const id = req.params.id
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            const auth = req.cookies['authorization']
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)
            if(data.message){
                return res.status(404).render('404')
            }
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('employeeAttendance',{
                data: data, 
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        }catch(err){
            res.status(500).send(err)
        }
    },
    attendanceSummaryView: async(req, res)=>{
        try {
            const id = req.params.id
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            const auth = req.cookies['authorization']
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)            
            if(data.message){
                return res.status(404).render('404')
            }
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('employeeAttendanceSummary', { 
                data,
                url: req.baseUrl + req.path,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        } catch (err) {
            res.status(500).send(err) 
        }
    },
    attendanceDTRView: async (req, res) => {
        try {
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            let id = req.params.id
            const auth = req.cookies['authorization']
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'MM-DD-YYYY').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/attendance/per-employee/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)
            console.log('PER EMPLOYEE', data)
            if(data.message){
                return res.status(404).render('404')
            }
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log(fromDate, toDate)
            res.status(200).render('employeeAttendanceDtr', { 
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
            let pgroup = req.query.p_group
            const id = req.params.id
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            const auth = req.cookies['authorization']
            if(pgroup){
                pgroup = pgroup
            }
            if(!pgroup){
                pgroup = ''
            }
            
            if(!req.query.from || !req.query.to) fromDate = new Date(moment(new Date(), 'YYYY-MM-DD').subtract(15, 'days')).toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()

            const data = await fetchData(`admin/api/payrolls/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)
            const group = await fetchData(`admin/api/payrolltypes`)
            const selectedGroup = await fetchData(`admin/api/payrolltypes/${pgroup}`)
           
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            console.log('VIEW/ EMPLOYEE DATA', data)
            // console.log('VIEW/ PAYROLL GROUP', group)
            // console.log('VIEW/ SELECTED PAYROLL GROUP', selectedGroup)

            res.status(200).render('employeePayroll', { 
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
    payslipView: async (req,res)=>{
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
         if(data.message){
            return res.status(404).render('404')
        }
         res.status(200).render('payslip', {
                data, 
                url: req.baseUrl + req.path, 
                moment: moment,
                query: {from: fromDate, to: toDate}
        })
    }
    // register : (req, res) => {
    //     if (req.cookies['token']) {
    //         res.status(200).redirect('/register')
    //     } else {
    
    //         res.status(200).render('signup')
    //     }
    // },
    // logout : (req, res) => {
    //     res.cookie('token', '')
    //     res.cookie('isEmployee', '')
    //     res.redirect('/employee/login')
    // }
    
}
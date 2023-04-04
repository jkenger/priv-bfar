const { errorHandler, fetchData } = require('./services/services')
const moment = require('moment')

module.exports = {

    homeView:async (req, res) => {
        try {
            // const datas = await fetchData('admin/api/employees_count')
            res.status(200).render('employeeHome',{
                url: req.url
            })
        } catch (err) {
            res.status(500).send(err) 
        }
    },

    employeeLeaveView: async (req, res) => {
        try{
            const data = await fetchData('admin/api/leavetypes')
            res.status(200).render('employeeLeave',{
                data: data,
                url: req.url,
                moment: moment
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
            if(!req.query.from || !req.query.to) fromDate = new Date('01-01-1977').toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/records/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)
            if(data.message){
                return res.status(404).render('404')
            }
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            res.status(200).render('employeeAttendance',{
                data: data, 
                url: req.url,
                moment: moment,
                query: {from: fromDate, to: toDate  }
            })
        }catch(err){
            res.status(500).send(err)
        }
    },
    payrollView: async (req, res) => {
        try{
            const id = req.params.id
            let fromDate = new Date().toISOString()
            let toDate = new Date().toISOString()
            const auth = req.cookies['authorization']
            if(!req.query.from || !req.query.to) fromDate = new Date().toISOString(), toDate = new Date().toISOString()
            else fromDate = new Date(req.query.from).toISOString(), toDate = new Date(req.query.to + 'T23:59:59.999Z').toISOString()
            const data = await fetchData(`admin/api/payrolls/${id}?from=${fromDate}&to=${toDate}&auth=${auth}`)
            if(!req.query.from || !req.query.to) { fromDate = ''; toDate = ''} else {fromDate = req.query.from; toDate = req.query.to}
            if(data.message){
                return res.status(404).render('404')
            }
            console.log('fromn view', data)
            res.status(200).render('employeePayroll', { 
                data, 
                url: req.url, 
                query: {from: fromDate, to: toDate} 
            })
        }catch(err){
            res.status(500).send(err)
        }
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
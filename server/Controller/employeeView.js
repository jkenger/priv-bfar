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
            res.status(200).render('employeeLeave',{
                url: req.url
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
module.exports = {

    login : (req, res) => {
        if (req.cookies['token']) {
            res.status(200).redirect('/login')
        } else {
            res.status(200).render('Login')
        }
    },
    register : (req, res) => {
        if (req.cookies['token']) {
            res.status(200).redirect('/register')
        } else {
    
            res.status(200).render('Signup')
        }
    },
    logout : (req, res) => {
        res.cookie('token', '')
        res.cookie('isAdmin', '')
        res.redirect('/admin/login')
    }
    
}
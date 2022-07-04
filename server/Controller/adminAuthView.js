exports.login = (req, res) => {
    if (req.cookies['token']) {
        res.status(200).redirect('/login')
    } else {
        res.status(200).render('Login')
    }
}

exports.register = (req, res) => {
    if (req.cookies['token']) {
        res.status(200).redirect('/register')
    } else {

        res.status(200).render('Signup')
    }
}

exports.logout = (req, res) => {
    res.cookie('token', '')
    res.cookie('isAdmin', '')
    res.redirect('/admin/login')
}

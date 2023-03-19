const submitBtnEl = document.querySelector('.button-submit')
const form = document.querySelector('form')
const emailErr = document.querySelector('p.email-error.error')
const passErr = document.querySelector('p.password-error.error')
const employee = document.querySelector('#employee')
const admin = document.querySelector('#admin')
// const containerAside = document.querySelector('.container-aside')
// if(containerAside.children.length < 12){
//     containerAside.style.overflow = "hidden";
// }

form.addEventListener('submit', async(e)=>{
    e.preventDefault();
    const email = form.email.value
    const password = form.password.value
    const action = (employee) ? 'employee' : (admin) ? 'admin' : ''
    try{
        const res = await fetch(`/${action}/login`, {
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password, action}),    
            method: 'POST'
        })
        const data = await res.json()
        console.log(data)
        if(data.err){
            if(data.err.email)emailErr.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ` + data.err.email
            if(data.err.password)passErr.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ` + data.err.password
        }
    
        if(data.user){
            if(action === 'employee')
                location.assign('/employee')
            else
                location.assign('/admin')
        }
        
    }catch(err){
        console.log(err)
    }
        
})
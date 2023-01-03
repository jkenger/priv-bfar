const submitBtnEl = document.querySelector('.button-submit')
const form = document.querySelector('form')
const emailErr = document.querySelector('p.email-error.error')
const passErr = document.querySelector('p.password-error.error')

// const containerAside = document.querySelector('.container-aside')
// if(containerAside.children.length < 12){
//     containerAside.style.overflow = "hidden";
// }

form.addEventListener('submit', async(e)=>{
    e.preventDefault();
    new Notification("New Notification!")
    const email = form.email.value
    const password = form.password.value
    console.log(email)
    console.log(password)
    try{
        const res = await fetch(`/admin/login`, {
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            method: 'POST'
        })
        const data = await res.json()
        console.log(data)
        if(data.err){
            if(data.err.email)emailErr.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ` + data.err.email
            if(data.err.password)passErr.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ` + data.err.password
        }
    
        if(data.user){
            location.assign('/admin')
        }
        
    }catch(err){
        console.log(err)
    }
        
})
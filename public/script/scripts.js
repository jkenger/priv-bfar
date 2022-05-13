const containerAside = document.querySelector('.container-aside')

if(containerAside.children.length < 12){
    containerAside.style.overflow = "hidden";
}

function submitFunc(url)
{
    const form = document.querySelector('form')
    const emailErr = document.querySelector('label.email.error')
    const passErr = document.querySelector('label.password.error')
    
    form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        
        const email = form.email.value
        const password = form.password.value
        
        try{
            const res = await fetch(`/${url}`, {
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
                method: 'POST'
            })
            const data = await res.json()
            console.log(data)
            if(data.err){
                emailErr.textContent = data.err.email
                passErr.textContent = data.err.password
            }

            if(data.user){
                location.assign('/')
            }
            
        }catch(err){
            console.log(err)
        }
    
    })
}
    

    
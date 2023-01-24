const form = document.querySelector('form');

const d = document.querySelector('.date')
const t = document.querySelector('.time')

const altCon = document.querySelector('.alt')
const altLbl = document.querySelector('.alt-label')

const imgEl = document.querySelector('.img')
const lblMessage = document.querySelector('label.labelMessage')
const idInput = document.querySelector('.inputElId')
const btnEl = document.querySelector('.subBtn')
const nameLabelEl = document.querySelector('.labelName')
const idLabelEl = document.querySelector('.labelId')
const desLabelEl = document.querySelector('.labelDesignation')

const timeEl = document.querySelector('.timeButton').children
const timeType = document.querySelector('.timeType')

// refresh when current time reaches specified time
setInterval(() => {
    t.textContent = new Date().toLocaleTimeString()
},1000);

// timetype default
window.onload = function(e){ 
    timeType.value = timeEl[0].dataset.id 
}

// timetype swtich
for(let i = 0; i < timeEl.length; i++){
    
    timeEl[i].addEventListener('click', (e)=>{  
        for(let i = 0; i < timeEl.length; i++){
            timeEl[i].classList.remove('selected');
            timeType.value = ''
        };
        // add the 'selected' class to the clicked div
        e.target.classList.add('selected');
        timeType.value = e.target.dataset.id
        console.log(timeType.value)
        })
}

// attach the listener to the current dcument
onScan.attachTo(document, {
    onScan: function (sCode, iQty) {  // after successful scan
        console.log(sCode, ' ', iQty)

        idInput.value = sCode // replace the id textbox value to scanned id
        btnEl.click()
    }
});

idInput.ondblclick = () => {
    idInput.value = ''
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log(form.empid.value)
    console.log(timeType.value)
    const emp_code = form.empid.value
    const time_type = timeType.value
    const date = new Date()
    console.log(emp_code)
    try {
        const res = await fetch('/attendance', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emp_code,
                time_type
            }),
            method: 'POST'
        })
        const data = await res.json()
        if (data.err) {
            lblMessage.textContent = data.err.email + " Failed!"
        }
        if (data.log_in && time_type === 'timein') {
            // Welcome <Strong>Ken Gervacio!</Strong> <br> Time in at <span class="font-success"> 10:26:30 AM</span>. Success! 
            lblMessage.innerHTML = `Hello <Strong>${data.employee[0].personal_information.name}!</Strong> <br> Time in at <span class="font-success"> ${date.toLocaleTimeString()}</span>. Success!`
            nameLabelEl.textContent = data.employee[0].personal_information.name
            idLabelEl.textContent = data.employee[0].employee_details.designation.id
            imgEl.src = '/img/pfp2.jpg'
            // setTimeout(()=>{
            //     location.href = '/';
            // }, 2000)
        }
        if (data.log_in && time_type === 'timeout') {
            lblMessage.innerHTML = `Hello <Strong>${data.employee[0].personal_information.name}!</Strong> Time out at <span class="font-success"> ${date.toLocaleTimeString()}</span>. Success!`
            nameLabelEl.textContent = data.employee[0].personal_information.name
            idLabelEl.textContent = data.employee[0].employee_details.designation.id
            imgEl.src = '/img/pfp2.jpg'
            // setTimeout(()=>{
            //     location.href = '/';
            // }, 2000)
        }
    } catch (err) {
        console.log(err)
    }
    
})


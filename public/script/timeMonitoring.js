const form = document.querySelector('form');

const d = document.querySelector('.date')
const t = document.querySelector('.time')

const altCon = document.querySelector('.alt')
const altLbl = document.querySelector('.alt-label')

const lblError = document.querySelector('label.employee.error')
const btnSubmit = document.querySelector('.button-submit')
const idInput = document.querySelector('.emp_id')

const timeTypeSelection = document.querySelector('#time_type')



const date = new Date()
const getDate = new Date().toISOString().split('T')[0]
const pht = date.getTime() - new Date().getTimezoneOffset() * 60 * 1000 // FOR TIME COMPARISON


const sevenAmIso = getDate + 'T08:00:00.000Z';
const sevenAm = new Date(sevenAmIso)

const twelvePmIso = getDate + 'T12:00:00.000Z';
const twelvePm = new Date(twelvePmIso)

const twelveFPmIso = getDate + 'T12:45:00.000Z';
const twelveFPm = new Date(twelveFPmIso)

const fivePmIso = getDate + 'T17:00:00.000Z';
const fivePm = new Date(fivePmIso)

console.log('phtIso', pht, 'twelveIso:', sevenAm)
console.log('phtIso', pht > fivePmIso)

// refresh when current time reaches specified time
setInterval(() => {
    t.textContent = new Date().toLocaleTimeString()
},1000);

function refreshAt(hours, minutes, seconds) {
    var now = new Date();
    var then = new Date();

    if(now.getHours() > hours ||
       (now.getHours() == hours && now.getMinutes() > minutes) ||
        now.getHours() == hours && now.getMinutes() == minutes && now.getSeconds() >= seconds) {
        then.setDate(now.getDate() + 1);
    }
    then.setHours(hours);
    then.setMinutes(minutes);
    then.setSeconds(seconds);

    var timeout = (then.getTime() - now.getTime());
    setTimeout(function() { window.location.reload(true); }, timeout);
}

refreshAt(7,0,0);
refreshAt(12,0,0);
refreshAt(12,45,0);
refreshAt(17,0,0);

if(pht > sevenAm && pht < twelvePm){
    timeTypeSelection.value = 'timein'
}else if(pht > twelvePm && pht < twelveFPm){
    timeTypeSelection.value = 'timeout'
    
}else if(pht > twelveFPm && pht < fivePm){
    timeTypeSelection.value = 'timein'
}else if (pht > fivePm){
    timeTypeSelection.value = 'timeout'
}else{
    timeTypeSelection.value = 'timein'
}

// attach the listener to the current dcument
onScan.attachTo(document, {
    onScan: function (sCode, iQty) {  // after successful scan
        console.log(sCode, ' ', iQty)

        idInput.value = sCode // replace the id textbox value to scanned id
        btnSubmit.click()
    }
});

idInput.ondblclick = () => {
    idInput.value = ''
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const emp_code = form.empid.value
    const time_type = form.time_type.value
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
        console.log("DATA", data);
        if (data.err) {
            altCon.classList.add('con-error')
            altLbl.textContent = data.err.email
        }
        if (data.log_in) {
            altCon.classList.add('con-success')
            altLbl.textContent = "SUCCSSFULLY LOGGED IN AT " + date.toLocaleTimeString()
        }
        if (data.log_out) {
            altCon.classList.add('con-success')
            altLbl.textContent = "SUCCSSFULLY LOGGED OUT AT " + date.toLocaleTimeString()
        }
    } catch (err) {
        console.log(err)
    }
    
})


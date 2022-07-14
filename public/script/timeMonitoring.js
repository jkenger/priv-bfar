const form = document.querySelector('form');

const d = document.querySelector('.date')
const t = document.querySelector('.time')

const altCon = document.querySelector('.alt')
const altLbl = document.querySelector('.alt-label')

const lblError = document.querySelector('label.employee.error')
const btnSubmit = document.querySelector('.button-submit')

const idInput = document.querySelector('.emp_id')
const inputType = document.querySelector('#input_type')


const date = new Date()

// attach the listener to the current document
onScan.attachTo(document, {
    onScan: function (sCode, iQty) {  // after successful scan
        console.log(sCode, ' ', iQty)

        idInput.value = sCode // replace the id textbox value to scanned id
        inputType.textContent = 'rfid'
        btnSubmit.click()
    }
});

idInput.ondblclick = () => {
    idInput.value = ''
}

form.addEventListener('submit', async (e) => {
    console.log(inputType.textContent)
    e.preventDefault()
    const emp_code = form.empid.value
    const time_type = form.time_type.value
    const input_type = inputType.textContent
    try {
        const res = await fetch('/attendance', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emp_code,
                time_type,
                input_type
            }),
            method: 'POST'
        })
        const data = await res.json()
        console.log("DATA", data);
        if (data.err) {
            altCon.classList.add('con-error')
            altLbl.textContent = data.err.email
            inputType.textContent = ''
            console.log(inputType.textContent)

        }
        if (data.log_in) {
            altCon.classList.add('con-success')
            altLbl.textContent = "SUCCSSFULLY LOGGED IN AT " + date.toLocaleTimeString()
            inputType.textContent = ''
            console.log(inputType.textContent)
        }
        if (data.log_out) {
            altCon.classList.add('con-success')
            altLbl.textContent = "SUCCSSFULLY LOGGED OUT AT " + date.toLocaleTimeString()
            inputType.textContent = ''
            console.log(inputType.textContent)
        }
    } catch (err) {
        console.log(err)
    }
    
})
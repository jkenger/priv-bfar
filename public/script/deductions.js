$(document).ready(function () {
    
    $('#mainTable').DataTable({
        "columnDefs": [
         {"className": "dt-center", "targets": "_all"}
        ]
    });
});
const nameErr = document.querySelector('p.name-error')
const numErr = document.querySelector('p.num-error')
const form = document.querySelector('form#asideForm')
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const doc = {
        
        name : form.name.value,
        amount : form.amount.value,
    }
    console.log('client 1:', doc)
    const res = await fetch('/admin/api/deductions',{
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(doc),
        method: 'POST'
    })
    
    const data = await res.json()
    
    if(data) console.log('response:', data)
    if(data.err) {
        console.log(data.err)
        // fnameErr.textContent = data.err.name
        // preDateErr.textContent = data.err.preDate
        // dateErr.textContent = data.err.date
    }
    })
$(document).ready(function () {
    
    $('#mainTable').DataTable({
        "columnDefs": [
         //date-fields
         {
            "orderable": true,
            "targets": [2, 3],
            "type": 'date'
         },
         {"className": "dt-center", "targets": "_all"}
        ]
        });
    });

    const form = document.querySelector('form#asideForm')
    form.addEventListener('submit', async (e)=>{
        e.preventDefault()
        try{
            const fnameErr = document.querySelector('p.fname-error')
            const preDateErr = document.querySelector('p.from-error')
            const dateErr = document.querySelector('p.to-error')

            const name = form.name.value
            const description = form.description.value
            const preDate = form.preDate.value
            const date = form.date.value

            const res = await fetch('/admin/api/events/holidays', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    preDate,
                    date
                }),
                method: 'POST'
            })
            const data = await res.json()
            console.log('asdas', data)
            if(data.err) {
                fnameErr.textContent = data.err.name
                preDateErr.textContent = data.err.preDate
                dateErr.textContent = data.err.date
            }

            if(data){
                
            }
        }catch(e){
            console.log('fe[holidays]:', e)
        }
    })
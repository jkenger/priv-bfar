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
            const fnameErr = document.querySelector('p.leavetype-error')
            const preDateErr = document.querySelector('p.description-error')

            const leave_type = form.leave_type.value
            const description = form.description.value

            const res = await fetch('/admin/api/leavetypes', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leave_type,
                    description
                }),
                method: 'POST'
            })
            const data = await res.json()
            console.log('asdas', data)
            if(data.err) {
                fnameErr.textContent = data.err.name
                preDateErr.textContent = data.err.preDate
            }

            if(data){
                console.log(data)
            }
        }catch(e){
            console.log('fe[holidays]:', e)
        }
    })
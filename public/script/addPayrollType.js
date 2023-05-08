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
            const fnameErr = document.querySelector('p.fund_cluster-error')
            const preDateErr = document.querySelector('p.project_name-error')
            const dateErr = document.querySelector('p.program_name-error')

            const fund_cluster = form.fund_cluster.value
            const project_name = form.project_name.value
            const program_name = form.program_name.value

            const res = await fetch('/admin/api/payrolltype', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fund_cluster,
                    project_name,
                    program_name,
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
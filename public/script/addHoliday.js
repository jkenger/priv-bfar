let form = document.querySelector('.submit')
                const fnameErr = document.querySelector('.fname-error')
                const idErr = document.querySelector('.id-error')
                const preDateErr = document.querySelector('.predate-error')
                const dateErr = document.querySelector('.date-error')

                const idInput = document.querySelector('#idNo')
                const holidayNameInput = document.querySelector('#holidayName')

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const doc = {
                        name : form.name.value,
                        predate : form.predate.value,
                        date : form.date.value,
                    }
                    console.log('client 1:', doc)
                    const res = await fetch('/admin/api/events/holiday',{
                        headers:{'Content-Type': 'application/json'},
                        body: JSON.stringify(doc),
                        method: 'POST'
                    })

                    const data = await res.json()
                
                    if(data) console.log('response:', data)
                    if(data.err) {
                        fnameErr.textContent = data.err.name
                        preDateErr.textContent = data.err.preDate
                        dateErr.textContent = data.err.date
                    }
                })


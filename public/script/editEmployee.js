let form = document.querySelector('.empFormEl')
const fnameErr = document.querySelector('.fname-error')
const idErr = document.querySelector('.id-error')
const rfidErr = document.querySelector('.rfid-error')
const ageErr = document.querySelector('.age-error')
const emailErr = document.querySelector('.email-error')
const contactErr = document.querySelector('.contact-error')
const positionErr = document.querySelector('.position-error')
const salaryErr = document.querySelector('.salary-error')
form.addEventListener('submit', async (e) => {
    console.log('ASDASFAS')
    e.preventDefault();
    const doc = {
        personal_information: {
            fname: form.fname.value,
            mname: form.mname.value,
            lname: form.lname.value,
            gender: form.gender.value,
            civstatus: form.civstatus.value,
            name: '',
            height: form.height.value,
            weight: form.weight.value,
            email_personal: form.email_personal.value,
            contact_personal: form.contact_personal.value,
            home_address: form.home_address.value,
            age: form.age.value,
            natl_id: form.natl_id.value,
            date_of_birth: form.date_of_birth.value,
            place_of_birth: form.place_of_birth.value,
        },
        employee_details: {
            designation: {
                company: form.company.value,
                company_location: form.company_location.value,
                designation: form.designation.value,
                id: form.empcode.value,
                rfid: form.rfid.value,
                email_company: form.email_company.value,
                leave_group: form.leavegroup.value
            },
            employment_information: {
                employment_type: form.employment_type.value,
                employment_status: form.employment_status.value,
                date_hired: form.date_hired.value
            },
            salary_details: {
                monthly_salary: form.monthly_salary.value
            }
        }
    }

    console.log(doc)
    
    const res = await fetch(`/admin/api/employees/${form._id.value}`,{
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(doc),
        method: 'PATCH'
    })
    const data = await res.json()
    console.log(data)
    if(!data.result){
           console.log({err: 'Failed to create employee'})
    }
    if(data.result){
        const file = document.querySelector('input[type=file]').files[0];
        if(file){
            let imgFormData = new FormData()
            imgFormData.append('image', file)
            
            //upload image
            const response = await fetch('/admin/api/upload-image', {
                method: 'POST',
                body:imgFormData
            });
            const imgData = await response.json();

            console.log(imgData)
            doc.avatar.url = imgData.secure_url
            doc.avatar.public_id = imgData.public_id
            //update employee
            const res = await fetch(`/admin/api/employees/${dbdata.result._id}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'PATCH',
                body: JSON.stringify(doc),
            })
            const updatedData = await res.json()
            console.log(updatedData)
        }
    }
    // console.log(data)
    // if(data.err) {
    //     fnameErr.textContent = data.err.name
    //     idErr.textContent = data.err.emp_code
    //     rfidErr.textContent = data.err.rfid
    //     ageErr.textContent = data.err.age
    //     emailErr.textContent = data.err.email
    //     contactErr.textContent = data.err.contact
    //     positionErr.textContent = data.err.position
    //     salaryErr.textContent = data.err.salary
    // }
    
    // console.log(data)
})
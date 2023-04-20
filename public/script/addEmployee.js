   const autoFill = () =>{
        //auto fill all the inputs of the form with random data
        const fname = document.querySelector('#fname');
        const mname = document.querySelector('#mname');
        const lname = document.querySelector('#lname');
        const height = document.querySelector('#height');
        const weight = document.querySelector('#weight');
        const email_personal = document.querySelector('#email_personal');
        const contact_personal = document.querySelector('#contact_personal');
        const age = document.querySelector('#age');
        const natl_id = document.querySelector('#natl_id');
        const date_of_birth = document.querySelector('#date_of_birth');
        const home_address = document.querySelector('#home_address');
        const place_of_birth = document.querySelector('#place_of_birth');
        const avatar = document.querySelector('#avatar');
        const company = document.querySelector('#company');
        const company_location = document.querySelector('#company_location');
        const company_address = document.querySelector('#company_address');
        const designation = document.querySelector('#designation');
        const empcode = document.querySelector('#empcode');
        const rfid = document.querySelector('#rfid');
        const email_company = document.querySelector('#email_company');
        const leavegroup = document.querySelector('#leavegroup');
        const employment_type = document.querySelector('#employment_type');
        const employment_status = document.querySelector('#employment_status');
        const date_hired = document.querySelector('#date_hired');
        const monthly_salary = document.querySelector('#monthly_salary');

        fname.value = 'John' + Math.floor(Math.random() * 1000);;
        mname.value = 'Doe';
        lname.value = 'Smith';
        height.value = Math.floor(Math.random() * 100);
        weight.value = Math.floor(Math.random() * 100);
        email_personal.value = `johndoesmith${Math.floor(Math.random() * 100)}@gmail.com`
        contact_personal.value = `09${Math.floor(Math.random() * 1000000000)}`;
        age.value = Math.floor(Math.random() * 100);
        natl_id.value = Math.floor(Math.random() * 1000000000);
        date_of_birth.value = '1990-01-01';
        home_address.value = '1234 Main St. Brgy. 123, City, Country';
        place_of_birth.value = 'City, Country';
        company.value = 'Company';
        company_location.value = 'City, Country';
        company_address.value = '1234 Main St. Brgy. 123, City, Country';
        designation.value = 'Designation';
        empcode.value = Math.floor(Math.random() * 1000000000);
        rfid.value = Math.floor(Math.random() * 1000000000);
        email_company.value = `bfar${Math.floor(Math.random() * 100)}@gmail.com`
        leavegroup.value = 'Leave Group';
        date_hired.value = '2021-01-01';
        monthly_salary.value = Math.floor(Math.random() * 1000000);

        console.log('autofill')
   }
   
   //datatable
   $(document).ready(function () {
    $('#mainTable').DataTable();
    });

    const form = document.querySelector('.empFormEl');
    
    form.addEventListener('submit', async(e) => {
        e.preventDefault();
        let doc = {}
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        doc = {
            avatar:{
                public_id: '',
                url: '',
            },
            personal_information:{
                fname: data.fname,
                mname: data.mname,
                lname: data.lname,
                name: '',
                gender: data.gender,
                civstatus: data.civstatus,
                height: data.height,
                weight: data.weight,
                email_personal: data.email_personal,
                contact_personal: data.contact_personal,
                age: data.age,
                natl_id: data.natl_id,
                date_of_birth: data.date_of_birth,
                place_of_birth: data.place_of_birth,
                
            },
            employee_details:{
                designation:{
                    company: data.company,
                    company_location: data.company_location,
                    designation: data.designation,
                    id: data.empcode,
                    rfid: data.rfid,
                    email_company: data.email_company,
                    leavegroup: data.leavegroup,
                },
                employment_information:{
                    employment_type: data.employment_type,
                    employment_status: data.employment_status,
                    date_hired: data.date_hired,
                },
                salary_details:{
                    monthly_salary: data.monthly_salary,
                }
            }
        }
        //create employee
        const res = await fetch('/admin/api/employees', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc),
            method: 'POST'
        })
        const dbdata = await res.json()
        console.log(dbdata)
        
        if(!dbdata.result){
            Console.log({err: 'Failed to create employee'})
        }
        if (dbdata.result) {
               
            const file = document.querySelector('input[type=file]').files[0];
            let imgFormData = new FormData()
            imgFormData.append('image', file)
            
            //upload image
            const response = await fetch('/admin/api/upload-image', {
                method: 'POST',
                body:imgFormData
            });
            const imgData = await response.json();
            //update employee
            const res = await fetch(`/admin/api/employees/${dbdata.result._id}`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'PATCH',
                body: JSON.stringify({
                    'avatar.public_id': imgData.public_id,
                    'avatar.url': imgData.secure_url,
                }),
            })
            const updatedData = await res.json()
            console.log(updatedData)
        }
    });

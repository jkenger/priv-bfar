
const modalTitle = document.querySelector('#modalTitle')
const bodyLabelM = document.querySelector('#bodyMessage')
const modalForm = document.querySelector('form#modalForm')
const mainButton = document.querySelector('#mainButton')


const modal = (type, id)=>{
    const editLink = document.querySelector('#aEdit')
    const deleteLink = document.querySelectorAll('#aDelete')   
    const addButton = document.querySelector('#btnAdd')
    const _id = id
    let url = ''
    if(type==='empAddNew'){
        modalTitle.textContent = 'Add Employee'
    }
    
    if(type==='edit'){
        modalTitle.textContent = `Edit ${_id}`
    }
    
    if(type==='delete'){
        const path = ((window.location.pathname).split('/')).at(-1)
        const api = (path === 'deductions' || path === 'employees') ?
        'http://localhost:3000/admin/api/' + path:'http://localhost:3000/admin/api/events/' + path
        const target = 'http://localhost:3000/admin/' + path
        const url = api
        console.log(url)
        
        // set data
        //title
        modalTitle.textContent = `Delete ${_id}`

        //label body
        bodyLabelM.textContent = 'Once you delete the data you selected, it cannot be undone.'
        bodyLabelM.style.color = "#FF3401"

        //footer buttons
        mainButton.textContent = 'Delete'
        mainButton.color = '#FF3401'
    
        // event listeners
        modalForm.addEventListener('submit', (e)=>{
            e.preventDefault()
            deleteData(_id, api, target)
        })
    }
}

const deleteData = async(id, url, target)=>{
    const _url = url + '/' + id
    const _target = target
    console.log(_url)
    const doc = await fetch(_url, {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE'
    })
    const data = await doc.json()
    window.location.href = _target
}

const modalTitle = document.querySelector('#modalTitle')
const modalForm = document.querySelector('form#modalForm')
const mainButton = document.querySelector('#mainButton')
const modalBodyDiv = document.querySelector('.modal-body')

modalBodyDiv.innerHTML = ''

const editModal = (id, html)=>{
    modalBodyDiv.innerHTML = html
    modalTitle.textContent = 'Edit Employee'
}

const deleteModal = (id)=>{
    // let url = ''
    // if(type==='empAddNew'){
    //     modalTitle.textContent = 'Add Employee'
    // }
    
    // if(type==='edit'){
        //     modalTitle.textContent = `Edit ${_id}`
        
        // }
        
    const label = document.createElement('label')
    const _id = id
    const path = ((window.location.pathname).split('/')).at(-1)
    const api = (path === 'deductions' || path === 'employees') ?
    'http://localhost:3000/admin/api/' + path:'http://localhost:3000/admin/api/events/' + path
    const target = 'http://localhost:3000/admin/' + path
    const url = api
    console.log(url)
    
    // set data
    //title
    modalTitle.textContent = `Delete ${_id}`
    const text = 'Once you delete the data you selected, it cannot be undone.'
    
    //label body
    label.textContent = text
    label.style.color = '#FF3401'
    //body
    label.classList.add('deleteLbl')
    modalBodyDiv.innerHTML = ''
    modalBodyDiv.appendChild(label)

    //footer buttons
    mainButton.textContent = 'Delete'
    mainButton.color = '#FF3401'

    // event listeners
    modalForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        deleteData(_id, api, target)
    })
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
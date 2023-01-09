
const modalTitle = document.querySelector('#modalTitle')
const modalForm = document.querySelector('form#modalForm')
const mainButton = document.querySelector('#mainButton')
const modalBodyDiv = document.querySelector('.modal-body')

modalBodyDiv.innerHTML = ''

const path = ((window.location.pathname).split('/')).at(-1)
const api = (path === 'deductions' || path === 'employees') ?
'http://localhost:3000/admin/api/' + path:'http://localhost:3000/admin/api/events/' + path
const target = 'http://localhost:3000/admin/' + path

const editModal = (id, name, html)=>{
    modalBodyDiv.innerHTML = html
    modalTitle.textContent = `Edit ${name}`
    mainButton.textContent = 'Save Changes'
    
    modalForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const name = modalForm.name.value
        const description = modalForm.description.value
        const preDate = modalForm.predate.value
        const date = modalForm.date.value
        editData(id, {name, description, preDate, date}, api, target)
    })
}

const editData = async (id, {name, description, preDate, date}, url, target) =>{
    console.log(name, description, preDate, date)
    const _url = url + '/' + id
    const _target = target
    console.log( _url)
    console.log( _target)
    const doc = await fetch(_url, {
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({
            name,
            description,
            preDate,
            date
        }),
        method: 'PATCH'
    })
    const data = await doc.json()
    console.log(data)
}

const deleteModal = (id)=>{
    const label = document.createElement('label')
    const _id = id
    
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
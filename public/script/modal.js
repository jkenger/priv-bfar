
const modalTitle = document.querySelector('#modalTitle')
const mainButton = document.querySelector('#mainButton')
const modalBodyDiv = document.querySelector('.modal-body')

const modalForm = document.querySelector('form#modalForm')

modalBodyDiv.innerHTML = ''

const path = ((window.location.pathname).split('/')).at(-1)
const api = 
(path === 'deductions' || path === 'employees')?
'http://localhost:3000/admin/api/' + path:
'http://localhost:3000/admin/api/events/' + path

const directLink = 'http://localhost:3000/admin/' + path

const editModal = (id, name, inputs, html)=>{
    
    // assign modalForm identification so the browser won't be confused 
    // when a submit is triggered

    //clear and assign a type
    modalForm.dataset.formType = ''
    modalForm.dataset.formType = 'editForm'

    modalBodyDiv.innerHTML = html
    modalTitle.textContent = `Edit ${name}`
    mainButton.textContent = 'Save Changes'
    
    //split the inputs needed to be edited
    const arrKeys = inputs.split(' ')

    //if modal type is edit, execute
    
    console.log('edit')
    modalForm.addEventListener('submit', (e)=>{
        if(modalForm.dataset.formType === 'editForm'){
            e.preventDefault()
            let inputObj = {}
            // get key vvalues of each inputs and assign it to a variable given values
            arrKeys.forEach((arr, index)=>{
                inputObj[arrKeys[index]] = modalForm[arr].value
            })
            editData(id, inputObj, api, directLink)
        }
    })
   
    
}

const editData = async (id, obj, url, directLink) =>{
    const body = obj
    console.log(body)
    const _url = url + '/' + id
    const _target = directLink
    console.log( _url)
    console.log( _target)
    const doc = await fetch(_url, {
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify(body),
        method: 'PATCH'
    })
    const data = await doc.json()
    console.log(data)
}

const deleteModal = (id)=>{
    // assign modalForm identification so the browser won't be confused 
    // when a submit is triggered

    //clear and assign a type
    modalForm.dataset.formType = ''
    modalForm.dataset.formType = 'deleteForm'

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
    //if modal type is delete, execute
    
    console.log('delete')
    modalForm.addEventListener('submit', (e)=>{
        if(modalForm.dataset.formType === 'deleteForm'){
            e.preventDefault()
            deleteData(_id, api, directLink)
        }
    })
    
}

const deleteData = async(id, url, directLink)=>{
    const _url = url + '/' + id
    const _target = directLink
    console.log(_url)
    const doc = await fetch(_url, {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE'
    })
    const data = await doc.json()
    window.location.href = _target
}
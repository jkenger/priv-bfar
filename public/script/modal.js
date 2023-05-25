
const modalTitle = document.querySelector('#modalTitle')
const mainButton = document.querySelector('#mainButton')
const modalBodyDiv = document.querySelector('.modal-body')
const modalForm = document.querySelector('form#modalForm')

modalBodyDiv.innerHTML = ''

let path = ((window.location.pathname).split('/')).at(-1)


// submit modal
const submitModal = (id, name, inputs, html, customPath)=>{
  
    if(customPath){
        path = customPath
    }
    
    const api = 
    (path === 'holidays' || path === 'travelpass')?
    '/admin/api/events/' + path:
    '/admin/api/' + path

    const directLink = (path === 'groups') ? '/admin/payroll/' + path : '/admin/' + path
    console.log(customPath,'c')
    console.log(path,'p')
    modalForm.dataset.formType = ''
    modalForm.dataset.formType = 'submitForm'

    modalBodyDiv.innerHTML = html
    modalTitle.textContent = `Add Account`
    mainButton.textContent = 'Create'
    //split the inputs needed to be submitted
    const arrKeys = inputs.split(' ')
    //if modal type is edit, execute
    
    console.log('submit')
    modalForm.addEventListener('submit', (e)=>{
        if(modalForm.dataset.formType === 'submitForm'){
            e.preventDefault()
            let inputObj = {}
            // get key vvalues of each inputs and assign it to a variable given values
            arrKeys.forEach((arr, index)=>{
                inputObj[arrKeys[index]] = modalForm[arr].value
            })
            console.log(inputObj)
            console.log('submit api,', api)
            postData(inputObj, api, directLink)
        }
    })

}

const postData = async (obj, url, directLink) => {
    const body = obj
    const _url = url
    const _target = directLink

    console.log(body)
    const doc = await fetch(_url, {
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify(body),
        method: 'POST'
    })
    const data = await doc.json()
    window.location.href = _target
}


const editModal = (id, name, inputs, html)=>{
    const api = 
    (path === 'holidays' || path === 'travelpass')?
    '/admin/api/events/' + path:
    '/admin/api/' + path
   
    const directLink = (path === 'groups') ? '/admin/payroll/' + path : '/admin/' + path
  
    // assign modalForm identification so the browser won't be confused 
    // when a submit is triggered

    //clear and assign a type
    modalForm.dataset.formType = ''
    modalForm.dataset.formType = 'editForm'

    modalBodyDiv.innerHTML = html
    modalTitle.textContent = `Edit ${name}`
    mainButton.textContent = 'Save Changes'
    
    //split the inputs needed to be submitted
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
    const _url = url + '/' + id
    const _target = directLink
    console.log(_url)
    const doc = await fetch(_url, {
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify(body),
        method: 'PATCH'
    })
    const data = await doc.json()
    window.location.href = _target
}

const deleteModal = (id)=>{
    // assign modalForm identification so the browser won't be confused 
    // when a submit is triggered

    const api = 
    (path === 'holidays' || path === 'travelpass')?
    '/admin/api/events/' + path:
    '/admin/api/' + path


    const directLink = (path === 'groups') ? '/admin/payroll/' + path : '/admin/' + path
    
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


//customs
const addPayrollTypeModal = (id, name, inputs, html)=>{
    let array = []
    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')

    for (var i = 0; i < checkboxes.length; i++) {
        array.push(checkboxes[i].value)
    }
    const api = 
    (path === 'holidays' || path === 'travelpass')?
    '/admin/api/events/' + path:
    '/admin/api/' + path

    const directLink = (path === 'groups') ? '/admin/payroll/' + path : '/admin/' + path

    modalForm.dataset.formType = ''
    modalForm.dataset.formType = 'submitForm'

    modalBodyDiv.innerHTML = html
    modalTitle.textContent = `Add Account`
    mainButton.textContent = 'Create'
    //split the inputs needed to be submitted
    const arrKeys = inputs.split(' ')
    //if modal type is edit, execute
    
    console.log('submit')
    modalForm.addEventListener('submit', (e)=>{
        if(modalForm.dataset.formType === 'submitForm'){
            e.preventDefault()
            let inputObj = {}
            // get key vvalues of each inputs and assign it to a variable given values
            arrKeys.forEach((arr, index)=>{
                inputObj[arrKeys[index]] = modalForm[arr].value
            })
            console.log({inputObj, array})
            editCustomData({inputObj, array}, api, directLink)
        }
    })
}
const editCustomData = async (obj, url, directLink) =>{
    const payrollGroupId = obj.inputObj.payroll_types
    const employeeId = obj.array
    const _url = '/admin/api/addtopayrolltype'
    const _target = directLink
    console.log(_url)
    const doc = await fetch(_url, {
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({employeeId, payrollGroupId}),
        method: 'PATCH'
    })
    const data = await doc.json()
    window.location.href = _target
}
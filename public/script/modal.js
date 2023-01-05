
const modalTitle = document.querySelector('#modalTitle')

const modal = (type)=>{
    if(type==='empAddNew'){
        modalTitle.textContent = 'Add Employee'
    }
    
    if(type==='edit'){
        modalTitle.textContent = 'Edit {NAME}'
    }
    
    if(type==='delete'){
        modalTitle.textContent = 'Delete {NAME}'
    }
}
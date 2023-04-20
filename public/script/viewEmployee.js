// display image when a user upload an image
function PreviewImage() {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(document.getElementById("uploadImage").files[0]);

    oFReader.onload = function (oFREvent) {
        document.getElementById("viewImage").src = oFREvent.target.result;
    };
};

const form = document.querySelector('form#formUploadImage');
const id = document.querySelector('#_id').textContent
console.log(id)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.querySelector('input[type=file]').files[0];
    let imgFormData = new FormData()
    imgFormData.append('image', file)

    //upload image
    const response = await fetch('/admin/api/upload-image', {
        method: 'POST',
        body:imgFormData
    });
    const imgData = await response.json();

    console.log(imgData)
    //update employee
    const res = await fetch(`/admin/api/employees/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
        body: JSON.stringify({
            'avatar.url': imgData.secure_url,
            'avatar.public_id': imgData.public_id
        }),
    })
    const updatedData = await res.json()
    alert("Image Uploaded Successfully!")
    window.location.href = '/admin/employees'

})

const from = document.querySelector('input[type="date"]#from') 
const to = document.querySelector('input[type="date"]#to') 

from.addEventListener("change", function () {
    console.log(from.value)
    //add 15 more days  
    var newToDate = moment(from.value).add('days', 14).format('YYYY-MM-DD') ;

    console.log('change')
    to.value = newToDate
});

document.addEventListener("DOMContentLoaded", function(event) {
    /* 
      - Code to execute when only the HTML document is loaded.
      - This doesn't wait for stylesheets, 
        images, and subframes to finish loading. 
    */
    var startOfMonth = moment().startOf('Month').format('YYYY-MM-DD')
    var currentDay = moment().format('YYYY-MM-DD')
    if(!from.value && !to.value){
        from.value = currentDay
        to.value = currentDay
    }
});
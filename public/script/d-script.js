$(document).ready(function () {
    
    $('#mainTable').DataTable({
        "columnDefs": [
         //date-fields
         {
            "orderable": true,
            "targets": 2,
            "type": 'date'
         },
         {
            "className": "dt-center", 
            "targets": "_all",
            
        },
         
        ],
        "searching": false,
            "paging": false,
            "info": false,
            "order": [[ 0, "desc" ]]
        });
    });

$("#dataTableParent").load(location.href + " #dataTableParent");
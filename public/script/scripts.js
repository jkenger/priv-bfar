$(document).ready(function () {
    
    $('#mainTable').DataTable({
        "columnDefs": [
         //date-fields
         {
            "orderable": true,
            "targets": 2,
            "type": 'date'
         },
         {"className": "dt-center", "targets": "_all"}
        ]
        });
    });

$("#dataTableParent").load(location.href + " #dataTableParent");
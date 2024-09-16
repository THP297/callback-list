function getId() {
    var c = "";
    // Select only the input checkboxes inside <td> elements that are checked
    $("td input[type=checkbox]:checked").each(function() {
        // Check if the value is "on"
        if (this.value === "on") {
            console.log(this.id);
            // Concatenate the id of the checkbox instead of its value
            c += this.id + ",";
        }
    });

    console.log(c);
    return c;
}



function popupPhanCong(){
    var cus_id = getId();
    console.log(cus_id);
    console.log('cus_id',cus_id)
    var url = "ticketPhanCong?embed=true&manhinh=callback&keyTicket="+encodeURIComponent(cus_id);
    // click2Popup(url);
    if(cus_id)
        top.xadmin.add_tab('Phân công', url)
    else 
        alert("Chọn các cuộc callback trước khi thực hiện phân công")
}

function createPhanCongButton(){
    var clearFilter = $(".filter-container #clearFilters");
    // Using after() to append the button after clearFilter
    clearFilter.after(`<button class="btn" onclick="popupPhanCong()"><i class="fas fa-tasks"></i> Phân công</button>`);
}


createPhanCongButton();
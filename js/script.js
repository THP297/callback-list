

$(document).ready(function() {
    // Example: Implement a click event on table rows
    $('tr').on('click', function() {
        $(this).toggleClass('highlight');
    });

    $('#applyFilters').click(function() {
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();
        const lastCallFrom = $('#lastCallFrom').val();
        const lastCallTo = $('#lastCallTo').val();

        const filteredData = tableData.filter(item => {
            return (!fromDate || new Date(item.thoiGianGoiLanDau) >= new Date(fromDate)) &&
                   (!toDate || new Date(item.thoiGianGoiLanCuoi) <= new Date(toDate)) &&
                   (!lastCallFrom || new Date(item.thoiDiemGoiXuLy) >= new Date(lastCallFrom)) &&
                   (!lastCallTo || new Date(item.thoiDiemGoiXuLy) <= new Date(lastCallTo));
        });

        renderFilteredData(filteredData);
    });

    $('#clearFilters').click(function() {
        $('#fromDate, #toDate, #lastCallFrom, #lastCallTo').val('');
        renderPage(currentPage); // Render the current page without filters
    });

    // Initialize the datepicker
    $('.datepicker').datepicker({
        format: "mm/dd/yyyy",
        todayHighlight: true,
        autoclose: true
    });


});

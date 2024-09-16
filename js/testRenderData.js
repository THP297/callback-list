$(document).ready(function() {
    let tableData = [];
    let filteredData = [];
    let currentPage = 0;
    const rowsPerPage = 10;
    let filters = {};  // Object to store filter criteria for each column

    function addDataToTable(data) {
        tableData.unshift(data);  // Add new data to the beginning of the array
        applyFilters();  // Apply the current filters
        updateTable();  // Update the table with filtered data
    }

    function applyFilters() {
        // Filter the data based on the current filter criteria
        filteredData = tableData.filter(row => {
            return Object.keys(filters).every(column => {
                const filterValue = filters[column].toLowerCase();
                const cellValue = row[column].toString().toLowerCase();
                return cellValue.includes(filterValue);
            });
        });
    }

    function updateTable() {
        if (filteredData.length > rowsPerPage) {
            renderPagination();
        }
        renderPage(currentPage);
    }

    function renderPagination() {
        const pageCount = Math.ceil(filteredData.length / rowsPerPage);
        const pagination = $('#pagination');
        pagination.empty();

        for (let i = 0; i < pageCount; i++) {
            const pageItem = $(`<span class="page-item ${i === currentPage ? 'active' : ''}">${i + 1}</span>`);
            pageItem.on('click', function() {
                currentPage = i;
                renderPage(currentPage);
            });
            pagination.append(pageItem);
        }
    }

    function renderPage(pageNumber) {
        const start = pageNumber * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = filteredData.slice(start, end);

        const tbody = $('#tableBody');
        tbody.empty();
        pageData.forEach(item => {
            const row = `
                <tr>
                    <td>${item.tenKH}</td>
                    <td>${item.phanHangKH}</td>
                    <td>${item.soGoiDen}</td>
                    <td>${item.soLanGoiNho}</td>
                    <td>${item.thoiGianGoiLanDau}</td>
                    <td>${item.thoiGianGoiLanCuoi}</td>
                    <td>${item.thoiDiemGoiXuLy}</td>
                    <td>${item.nhanVienXuLy}</td>
                    <td>${item.cuocGoiLanCuoi}</td>
                    <td>${item.tinhTrang}</td>
                    <td>${item.nhanhDichVu}</td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // Filter change handler
    function handleFilterChange(column, value) {
        filters[column] = value;  // Update the filter value for the column
        applyFilters();  // Apply the filters
        currentPage = 0;  // Reset to the first page
        updateTable();  // Update the table with the filtered data
    }

    // Simulate data reception every second
    setInterval(() => {
        const randomDate1 = getRandomDate(2023, 2024);
        const randomDate2 = getRandomDate(2023, 2024);
        const newData = {
            tenKH: "Random Name " + Math.floor(Math.random() * 100),
            phanHangKH: "E " + Math.floor(Math.random() * 1000000),
            soGoiDen: Math.floor(Math.random() * 10),
            soLanGoiNho: Math.floor(Math.random() * 5),
            thoiGianGoiLanDau: formatDate(randomDate1),
            thoiGianGoiLanCuoi: formatDate(randomDate1), // Assuming the same for simplicity
            thoiDiemGoiXuLy: formatDate(randomDate2),
            nhanVienXuLy: "Admin (admin)",
            cuocGoiLanCuoi: "Trả lời",
            tinhTrang: "Đã phân công",
            nhanhDichVu: "Q O (80000)"
        };
        addDataToTable(newData);
    }, 1000);

    // Helper function to generate a random date
    function getRandomDate(startYear, endYear) {
        const start = new Date(startYear, 0, 1); // January 1st of start year
        const end = new Date(endYear, 11, 31); // December 31st of end year
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US');
    }

    // Example: Hook up filter input events to handleFilterChange
    // You can customize this to hook into your actual filter UI
    $('.filter-input').on('keyup', function() {
        const column = $(this).data('column');  // Get the column to filter
        const value = $(this).val();  // Get the filter value
        handleFilterChange(column, value);
    });
});

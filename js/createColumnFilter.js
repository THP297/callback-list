    let activeFilters = {};  // Store active filter values by column index
    let activeSort = null;   // Store the active sort column and order (e.g., {index: 0, order: 'asc'})
    let currentPage = 0;     // Store the current page index
    const rowsPerPage = 5;  // Number of rows per page
    let allRows = [];        // Store all rows for pagination purposes

    // Initialize Bootstrap Datepicker with the desired format (dd/mm/yyyy) and orientation at the bottom
    $('.datepicker').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true,
    });

    // Date range filters
    let dateFilters = {
        fromDate: null,
        toDate: null,
        lastCallFrom: null,
        lastCallTo: null
    };

    // Function to apply date range filters
    function applyDateFilters() {
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();
        const lastCallFrom = $('#lastCallFrom').val();
        const lastCallTo = $('#lastCallTo').val();

        dateFilters.fromDate = fromDate ? parseDate(fromDate) : null;
        dateFilters.toDate = toDate ? parseDate(toDate) : null;
        dateFilters.lastCallFrom = lastCallFrom ? parseDate(lastCallFrom) : null;
        dateFilters.lastCallTo = lastCallTo ? parseDate(lastCallTo) : null;

        // Reapply filters and sorting
        applyFiltersAndSort();
    }

    // Function to clear date range filters
    function clearDateFilters() {
        $('#fromDate').val('');
        $('#toDate').val('');
        $('#lastCallFrom').val('');
        $('#lastCallTo').val('');

        dateFilters = {
            fromDate: null,
            toDate: null,
            lastCallFrom: null,
            lastCallTo: null
        };

        // Reapply filters and sorting
        applyFiltersAndSort();
    }

    // Attach date filter functions to buttons
    $('#applyFilters').on('click', function() {
        applyDateFilters();
    });

    $('#clearFilters').on('click', function() {
        clearDateFilters();
    });

    // Function to parse date from dd/mm/yyyy format
    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);  // JavaScript months are 0-based
    }

    // Function to clear all column filters and sorting
    function clearColumnFilters() {
        activeFilters = {};  // Clear all active filters
        activeSort = null;   // Clear active sorting
        clearDateFilters();  // Clear date filters as well

        // Remove all filter inputs from the DOM
        $('.column-filter-container').remove();

        // Reapply filters and sorting (which will effectively reset the table)
        applyFiltersAndSort();
    }

    // Attach the clearColumnFilters function to the button click event
    $('#clearColumnFilters').on('click', function() {
        clearColumnFilters();
    });

    // Attach click event to the <input> inside the <th>
    $('th').has('input').find('input').on('click', function(event) {
        const $thInput = $(this); // The clicked <input>
        const $th = $thInput.closest('th'); // Get the closest <th> that contains this input
        const columnIndex = $th.index(); // Get the column index

        // Get the current checked status of the <th> input AFTER it's toggled
        const isChecked = $thInput.prop('checked'); // This now reflects the correct checked state after click

        // Apply the same checked status to all <td> elements in this column that contain inputs
        $('#tableBody tr').each(function() {
            const $td = $(this).find('td').eq(columnIndex); // Get the <td> for the current row and column
            const $input = $td.find('input'); // Find the input in the <td>

            if ($input.length > 0) {
                // Set the checked state of each <td> input based on the current state of <th> input
                $input.prop('checked', isChecked);
            }
        });

        // Prevent the event from bubbling up to the <th> click event
        event.stopPropagation();
    });

    // Attach click event to all <th> elements for adding filters
    $('th').not(':has(input)').on('click', function(event) {
        const $th = $(this);
        // Close any other open filters before opening a new one
        $('.column-filter-container').not($(this).find('.column-filter-container')).remove();

        // If a filter container already exists for this column, do nothing
        if ($th.find('.column-filter-container').length > 0) {
            return;
        }

        // Step 1: Create the filter container div
        const $filterContainer = $('<div class="column-filter-container"></div>');

        // Step 2: Create the filter row for text input
        const $textRow = $('<div class="filter-row"></div>');
        const $textInput = $('<input type="text" class="column-filter" placeholder="Tìm kiếm..." />');
        const $searchBtn = $('<button class="filter-btn"><i class="fas fa-search"></i></button>'); // Font Awesome search icon
        $textRow.append($textInput, $searchBtn);
        $filterContainer.append($textRow);

        // Add text search functionality on button click
        $searchBtn.on('click', function() {
            const index = $th.index(); // Get column index
            const filterValue = $textInput.val().toLowerCase(); // Get the input value
            if (filterValue) {
                activeFilters[index] = filterValue;  // Store the active filter value
            } else {
                delete activeFilters[index]; // Remove the filter if input is cleared
            }

            // Apply filters and sorting after search
            applyFiltersAndSort();
        });

        // Step 3: Check if the column data is numeric
        const rows = $('#tableBody tr').get();
        const isNumericColumn = rows.every(row => !isNaN($(row).find('td').eq($th.index()).text()));

        // If the column is numeric, add a sorting dropdown
        if (isNumericColumn) {
            const $sortRow = $('<div class="filter-row"></div>');
            const $dropdown = $(`
                <select class="filter-dropdown">
                    <option value="asc">Tăng dần</option>
                    <option value="desc">Giảm dần</option>
                </select>
            `);
            const $filterBtn = $('<button class="filter-btn"><i class="fas fa-filter"></i></button>'); // Font Awesome filter icon
            $sortRow.append($dropdown, $filterBtn);
            $filterContainer.append($sortRow);

            // Add sorting functionality on button click
            $filterBtn.on('click', function() {
                const sortOrder = $dropdown.val(); // Get the selected sort order
                if (sortOrder) {
                    activeSort = {index: $th.index(), order: sortOrder};  // Store the active sort column and order
                } else {
                    activeSort = null; // Remove sorting if no order is selected
                }

                // Sort and reapply filters
                applyFiltersAndSort();
            });
        }

        // Append the filter container to the <th> and set its position
        $th.css('position', 'relative'); // Make sure the parent has relative positioning
        $th.append($filterContainer);

        // Focus on the text input field after creation
        $textInput.focus();

        // Prevent event from bubbling up to the document click handler
        event.stopPropagation();
    });

    // Function to apply filters and sorting to the table data
    function applyFiltersAndSort() {
        let rows = allRows;

        // Step 1: Apply filters
        rows = rows.filter(row => {
            let shouldShow = true;

            // Apply all active filters across all columns
            for (let index in activeFilters) {
                const filterValue = activeFilters[index];
                const cellValue = $(row).find('td').eq(index).text().toLowerCase();

                if (!cellValue.includes(filterValue)) {
                    shouldShow = false;
                    break;
                }
            }

            // Apply date range filters
            const thoiGianGoiLanDau = parseDate($(row).find('td').eq(4).text());
            const thoiGianGoiLanCuoi = parseDate($(row).find('td').eq(5).text());

            if (dateFilters.fromDate && thoiGianGoiLanDau < dateFilters.fromDate) {
                shouldShow = false;
            }
            if (dateFilters.toDate && thoiGianGoiLanDau > dateFilters.toDate) {
                shouldShow = false;
            }
            if (dateFilters.lastCallFrom && thoiGianGoiLanCuoi < dateFilters.lastCallFrom) {
                shouldShow = false;
            }
            if (dateFilters.lastCallTo && thoiGianGoiLanCuoi > dateFilters.lastCallTo) {
                shouldShow = false;
            }

            return shouldShow;
        });

        // Step 2: Apply sorting if any
        if (activeSort) {
            const {index, order} = activeSort;
            rows.sort(function(a, b) {
                const cellA = $(a).find('td').eq(index).text();
                const cellB = $(b).find('td').eq(index).text();

                // Determine if the column is numeric
                const isNumeric = !isNaN(cellA) && !isNaN(cellB);

                if (isNumeric) {
                    // Numeric comparison
                    const numA = parseFloat(cellA);
                    const numB = parseFloat(cellB);

                    if (order === 'desc') {
                        return numB - numA; // Descending order
                    } else {
                        return numA - numB; // Ascending order
                    }
                } else {
                    // String comparison
                    if (order === 'desc') {
                        return cellB.localeCompare(cellA); // Descending order for strings
                    } else {
                        return cellA.localeCompare(cellB); // Ascending order for strings
                    }
                }
            });
        }

        else {
            // Default sorting by data-row-number (ascending)
            rows.sort(function(a, b) {
                const rowNumberA = parseInt($(a).attr('data-row-number'), 10);
                const rowNumberB = parseInt($(b).attr('data-row-number'), 10);
    
                return rowNumberA - rowNumberB; // Ascending order by data-row-number
            });
        }

        // Store the filtered and sorted rows for pagination
        renderPagination(rows);
        renderPage(rows);
    }

    // Function to render the current page of data
    function renderPage(rows) {
        const start = currentPage * rowsPerPage;
        const end = start + rowsPerPage;
        const pageRows = rows.slice(start, end);

        const tbody = $('#tableBody');
        tbody.empty();
        pageRows.forEach(row => {
            tbody.append(row);
        });
    }

    // Function to render pagination controls
    function renderPagination(rows) {
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        const pagination = $('#pagination');
        
        // Create pagination only if it doesn't exist
        if (pagination.children().length === 0) {
            for (let i = 0; i < totalPages; i++) {
                const pageButton = $('<span class="page-item"></span>').text(i + 1).attr('data-page', i);
                pagination.append(pageButton);
            }
            
            // Event delegation: Attach one event listener to #pagination
            pagination.on('click', '.page-item', function() {
                const selectedPage = $(this).data('page');
                if (selectedPage !== currentPage) {
                    currentPage = selectedPage;
                    renderPage(rows); // Re-render the current page of data
                    updateActivePage(selectedPage);
                }
            });
        }

        // Update the active page button
        updateActivePage(currentPage);
    }

    // Function to update active page button
    function updateActivePage(selectedPage) {
        $('#pagination .page-item').removeClass('active');
        $(`#pagination .page-item[data-page="${selectedPage}"]`).addClass('active');
    }

    // Simulate adding new data every second
        // const randomDate1 = getRandomDate(2023, 2024);
        // const randomDate2 = getRandomDate(2023, 2024);
        
        // const newData = [
        //     {
        //         id:"123",
        //         tenKH: "Random Name " + Math.floor(Math.random() * 100),
        //         phanHangKH: "E " + Math.floor(Math.random() * 1000000),
        //         soGoiDen: Math.floor(Math.random() * 10),
        //         soLanGoiNho: Math.floor(Math.random() * 5),
        //         thoiGianGoiLanDau: formatDate(randomDate1),
        //         thoiGianGoiLanCuoi: formatDate(randomDate1), // Assuming the same for simplicity
        //         thoiDiemGoiXuLy: formatDate(randomDate2),
        //         nhanVienXuLy: "Admin (admin)",
        //         cuocGoiLanCuoi: "Trả lời",
        //         tinhTrang: "Đã phân công",
        //         chitiet: {id:"1123", nhanvienxuly:"user2"},
        //         nhanhDichVu: "Q O (80000)"
        //     }
        // ];
    
        // addDataToTable(newData);
    

    // Helper function to generate a random date
    function getRandomDate(startYear, endYear) {
        const start = new Date(startYear, 0, 1); // January 1st of start year
        const end = new Date(endYear, 11, 31); // December 31st of end year
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    // Function to format the date as dd/mm/yyyy
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');  // Get day and pad with leading zero if necessary
        const month = String(date.getMonth() + 1).padStart(2, '0');  // Get month (zero-based, so add 1) and pad with leading zero if necessary
        const year = date.getFullYear();  // Get full year
        return `${day}/${month}/${year}`;  // Return in dd/mm/yyyy format
    }

    // Add new data (array) to the table and reapply filters and sorting
    function addDataToTable(dataArray) {
        // Step 1: Store the checked status of the current inputs
        const checkedItems = {};
        $('input[type="checkbox"]:checked').each(function() {
            const id = $(this).attr('id');
            if (id) {
                checkedItems[id] = true; // Store the checked status by input id
            }
        });
    
        // Step 2: Clear the existing rows
        allRows = [];
    
        // Step 3: Loop through the data array and build the new rows
        dataArray.forEach(data => {
            // Create a new row element for each data item
            const row = `
            <tr data-row-number="${data.row_number}">
                <td><input type="checkbox" id="${data.id}"></td>
                <td>${data.tenKH}</td>
                <td>${data.phanHangKH}</td>
                <td>
                    <span class="c2c" name="tooltip-c2c" style="display:inline-block">
                        <i class="fas fa-phone"></i> 
                        <a onclick="top.clicktocallv2('${data.soGoiDen}', '${data.stt}', '3')">${data.soGoiDen}</a>
                    </span>
                </td>
                <td>${data.soLanGoiNho}</td>
                <td>${data.thoiGianGoiLanDau}</td>
                <td>${data.thoiGianGoiLanCuoi}</td>
                <td>${data.thoiDiemGoiXuLy}</td>
                <td>${data.nhanVienXuLy}</td>
                <td>${data.cuocGoiLanCuoi}</td>
                <td>${data.tinhTrang}</td>
                <td>
                    <div style="cursor:pointer;" 
                        onclick="parent.click2Popup('callback_edit_detail?embed=true&id=${data.id}&NhanVienXuLy_temp=${data.nhanVienXuLy}')">
                        <span name="tooltip-callBack" class="fas fa-pencil-alt view" aria-hidden="true"> Chi tiết </span>
                    </div>
                </td>
                <td>${data.nhanhDichVu}</td>
            </tr>
            `;
    
            // Add the new row to the allRows array
            allRows.unshift($(row));
        });
    
        // Step 4: Reapply the checked status to the inputs after the table is updated
        allRows.forEach($row => {
            const $checkbox = $row.find('input[type="checkbox"]');
            const id = $checkbox.attr('id');
            if (checkedItems[id]) {
                $checkbox.prop('checked', true); // Reapply checked status
            }
        });
    
        // Reapply filters and sorting after adding all rows
        applyFiltersAndSort();
    }
    
    // Close filters when clicking outside the filter container and the <th>
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.column-filter-container').length && !$(event.target).closest('th').length) {
            $('.column-filter-container').remove(); // Remove all filter containers
        }
    });

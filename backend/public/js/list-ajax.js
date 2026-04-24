$(document).ready(function () {
    const searchForm = $('#searchForm');
    const searchInput = $('#searchInput');
    let timeout = null;

    function updateList(url) {
        // Add loading state
        $('#listTableBody, #listCardContainer, #paginationContainer').css('opacity', '0.5');

        // Add ajax flag to URL
        const ajaxUrl = new URL(url, window.location.origin);
        ajaxUrl.searchParams.set('ajax', 'true');

        $.ajax({
            url: ajaxUrl.toString(),
            method: 'GET',
            success: function (data) {
                // Expecting data to have { tableHtml, cardHtml, paginationHtml }
                if (data.tableHtml !== undefined) {
                    $('#listTableBody').html(data.tableHtml);
                }
                if (data.cardHtml !== undefined) {
                    $('#listCardContainer').html(data.cardHtml);
                }
                if (data.paginationHtml !== undefined) {
                    $('#paginationContainer').html(data.paginationHtml);
                }

                // Restore opacity
                $('#listTableBody, #listCardContainer, #paginationContainer').css('opacity', '1');

                // Update URL without reload
                window.history.pushState({}, '', url);
            },
            error: function (err) {
                console.error('AJAX error:', err);
                $('#listTableBody, #listCardContainer, #paginationContainer').css('opacity', '1');
                if (typeof showToast === 'function') {
                    showToast('Error updating list', 'error');
                }
            }
        });
    }

    // Event Listeners
    if (searchInput.length) {
        searchInput.on('input', function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // When searching, reset to page 1
                let formData = searchForm.serializeArray();
                formData = formData.filter(item => item.name !== 'page');
                formData.push({ name: 'page', value: '1' });
                
                const url = searchForm.attr('action') + '?' + $.param(formData);
                updateList(url);
            }, 500);
        });
    }

    searchForm.find('select').on('change', function () {
        // When filtering, reset to page 1
        let formData = searchForm.serializeArray();
        formData = formData.filter(item => item.name !== 'page');
        formData.push({ name: 'page', value: '1' });

        const url = searchForm.attr('action') + '?' + $.param(formData);
        updateList(url);
    });

    // Handle Pagination Clicks (delegated)
    $(document).on('click', '#paginationContainer a', function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        updateList(url);
    });

    // Handle Form Reset/Clear
    $(document).on('click', '.clear-btn', function (e) {
        if ($(this).is('a')) {
            e.preventDefault();
            const baseUrl = $(this).attr('href');
            searchForm[0].reset();
            // Clear explicit values because reset() only reverts to initial HTML values
            searchForm.find('input[type="text"]').val('');
            searchForm.find('select').val('');
            updateList(baseUrl);
        }
    });
});

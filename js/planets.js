// API: 
// https://api.visibleplanets.dev/v3?latitude=12&longitude=-981

// Card Template:
    // <div class="entry" id="">
    // 	<figure>
    //         <img src="" alt="" />
    // 	<figcaption></figcaption>
    // 	</figure>
    // </div>

$(document).ready(function() {
    var bootstrapButton = $.fn.button.noConflict(); 
	$.fn.bootstrapBtn = bootstrapButton;

    // Store celestial bodies data globally
    var celestialBodies = [];

    // Initialize the dialog box
    $('#dialog').dialog({
        autoOpen: false,
        modal: true,
        width: 400
    });

    // Fetch planets data via HTTP request broken
    $.ajax({
        url: './data/planets.json',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            celestialBodies = response.data;
            createCardElements(celestialBodies);
            attachEventHandlers();
        },
        error: function(xhr, status, error) {
            console.error('Error fetching planets data:', error);
            $('#celestial-bodies-container').html('<p>Error loading celestial bodies data.</p>');
        }
    });

    // Function to create card elements from data
    function createCardElements(bodies) {
        var container = $('#celestial-bodies-container');
        container.empty();

        bodies.forEach(function(body, index) {
            // Convert planet name to lowercase for image filename
            var imageName = body.name.toLowerCase();
            var imageUrl = './images/' + imageName + '.png';

            // Create card element using template
            var cardHTML = '<div class="entry" id="entry-' + index + '">' +
                            '<figure>' +
                            '<img src="' + imageUrl + '" alt="' + body.name + '" />' +
                            '<figcaption>' + body.name + '</figcaption>' +
                            '</figure>' +
                            '</div>';

            container.append(cardHTML);
        });
    }

    // Function to attach event handlers to cards
    function attachEventHandlers() {
        $(document).on('click', '.entry', function() {
            // Get the ID from the entry element
            var entryId = $(this).attr('id');
            var index = entryId.split('-')[1];
            var body = celestialBodies[index];

            if (body) {
                // Update dialog content with celestial body data
                updateDialogContent(body);

                // Display the dialog
                $('#dialog').dialog('open');
            }
        });
    }

    // Function to update dialog content
    function updateDialogContent(body) {
        $('.name').text(body.name);
        $('.constellation').text(body.constellation);
        $('.altitude').text(body.altitude.toFixed(2) + '°');
        $('.azimuth').text(body.azimuth.toFixed(2) + '°');
    }
    
});
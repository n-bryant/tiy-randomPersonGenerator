var personGenerator = (function($) {
    Handlebars.registerHelper('get-full-name', function(nameObj) {
        return nameObj.first + ' ' + nameObj.last;
    });

    var settings = {
        stackRequests: false,
        nationality: 'us',
        gender: null
    };

    var loading = {
        isLoading: false,
        show: function() {
            var source = $('#loading').html();
            var template = Handlebars.compile(source);
            var html = template();
            $(html).prependTo('.people-container').fadeIn();
        },

        hide: function() {
            $('.loader').last().remove();
        }
    };

    function updateSettings(customSettings) {
        if (typeof customSettings === 'object') {
            settings = customSettings;
        } else {
            console.log('Settings provided were in an incorrect format');
        }
    }

    var handleDelete = {
        toggleButton: function() {
            $('.delete-button').fadeToggle();
        },

        records: function() {
            $('.person-container.active').fadeOut('fast', function() {
                $(this).remove();
                updateCount();
            });
            this.toggleButton();
        }
    };

    function updateCount() {
        var count = $('.person-container').length;
        var text = count === 1 ? count + ' Person Created' : count + ' People Created';
        $('.people-count').text(text);
    }

    function getPerson() {
        if (!loading.isLoading || settings.stackRequests) {
            loading.isLoading = true;
            loading.show();
            if (Array.isArray(settings.nationality)) {
                settings.nationality.join();
            }
            $.ajax({
                url: 'https://randomuser.me/api/?nat=' + settings.nationality + '&gender=' + settings.gender,
                dataType: 'json',
                success: function(data) {
                    var photo = new Image();
                    photo.src = data.results[0].picture.large;
                    photo.onload = function() {
                        loading.hide();
                        generateTemplate(buildPersonContext(data.results[0]));
                        updateCount();
                        loading.isLoading = false;
                    };
                }
            });
        }
    }

    function generateTemplate(personContext) {
        var source = $('#person').html();
        var template = Handlebars.compile(source);
        var context = personContext;
        var html = template(context);
        $(html).prependTo('.people-container').fadeIn();
    }

    function buildPersonContext(data) {
        return {
            name: {
                first: data.name.first,
                last: data.name.last
            },
            image: data.picture.large,
            details: {
                city: data.location.city,
                state: data.location.state,
                email: data.email,
                cell: data.cell
            }
        };
    }

    $('.container').on('click', '.delete-button', function() {
        handleDelete.records();
    });

    $('.people-container').on('click', '.person-container', function() {
        var currentCount = $('.person-container.active').length;
        $(this).toggleClass('active');

        if (currentCount === 0 || (currentCount === 1 && $('.person-container.active').length === 0)) {
            handleDelete.toggleButton();
        }
    });

    return {
        create: getPerson,
        settings: updateSettings
    };

})(jQuery);

personGenerator.settings({
    stackRequests: true,
    nationality: ['fr', 'gb', 'dk']
});

$('.person-button').on('click', function() {
    personGenerator.create();
});

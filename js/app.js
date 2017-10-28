;(function($) {
    "use strict";

    const resultsLimit = 12;
    const $employeesContainer = $('#employees');
    const employees = [];
    const $overlay = $('#overlay');
    const $popup = $('#popup');
    const $controls = $popup.find('.controls');
    const $photo = $popup.find('.photo');
    const $name = $popup.find('.name');
    const $username = $popup.find('.username');
    const $email = $popup.find('.email');
    const $city = $popup.find('.city');
    const $phone = $popup.find('.phone');
    const $address = $popup.find('.address');
    const $birthday = $popup.find('.birthday');
    const $searchInput = $('#search');

    $(window).on('load', function() {

        /**
         * Make first letter capital.
         * @param string
         * @returns {string}
         */
        function capitalizeFirstLetter(string) {
            return string.replace(/\b./g,
                function(l) {
                    return l.toUpperCase();
                });
        }

        /**
         * Generate full name.
         * @param personName
         * @returns {string}
         */
        function generateName(personName) {
            return capitalizeFirstLetter(personName.first) + ' ' + capitalizeFirstLetter(personName.last);
        }

        /**
         * Show employees info.
         * @param personInfo
         */
        function showPerson(personInfo) {
            $employeesContainer.empty();
            $.each(personInfo, function (personKey, personInfo) {
                // generate html
                let personHTML = '<a href="#' + personKey + '" class="person transition"><div class="row">';

                // image
                personHTML += '<div class="col col-3">';
                personHTML += '<img src="' + personInfo.thumbnail + '" class="circle">';
                personHTML += '</div>';

                // content
                personHTML += '<div class="col col-9"><div class="content">';
                personHTML += '<h2 class="transition">' + personInfo.name + '</h2>';
                personHTML += '<p class="email">' + personInfo.email + '</p>';
                personHTML += '<p class="city">' + personInfo.city + '</p>';
                personHTML += '</div></div>';

                // close tags
                personHTML += '</div></a>';

                //add person
                $employeesContainer.append(personHTML);
            });
        }

        /**
         * Generate full text address.
         * @param location
         * @returns {string}
         */
        function generateAddress(location) {
            let address = location.street;
            if(typeof(location.state) !== "undefined") {
                address += ', ' + location.state;
            }
            if(typeof(location.postcode) !== "undefined") {
                address += ' ' + location.postcode;
            }
            return capitalizeFirstLetter(address);
        }

        /**
         * Convert date to USA format.
         * @param dateString
         */
        function changeDateFormat (dateString) {
            let date = new Date(dateString);
            return date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
        }

        /**
         * Show popup.
         * @param personId
         */
        function showPopup(personId) {
            // add info to popup
            let personInfo = employees[personId];
            $photo.attr('src', personInfo.photo);
            $name.text(personInfo.name);
            $username.text(personInfo.username);
            $email.text(personInfo.email);
            $city.text(personInfo.city + ', ' + personInfo.country);
            $phone.text(personInfo.phone);
            $address.text(personInfo.address);
            $birthday.text(personInfo.birthdate);
            $popup.attr('data-id', personId);

            // show popup
            $overlay.fadeIn('fast');
            $popup.fadeIn('fast');
        }

        /**
         * Make request.
         */
        $.ajax({
            url: 'https://randomuser.me/api/?results=' + resultsLimit + '&nat=US',
            dataType: 'json',
            success: function(data) {
                // create array with users info
                $.each(data.results, function(key, value) {
                    employees[key] = {};
                    employees[key].name = generateName(value.name);
                    employees[key].city = capitalizeFirstLetter(value.location.city);
                    employees[key].country = value.nat;
                    employees[key].thumbnail = value.picture.medium;
                    employees[key].photo = value.picture.large;
                    employees[key].email = value.email;
                    employees[key].username = value.login.username;
                    employees[key].phone = value.phone;
                    employees[key].address = generateAddress(value.location);
                    employees[key].birthdate = changeDateFormat(value.dob);
                    employees[key].enabled = true;
                });

                // show employees
                showPerson(employees);
            }
        });

        /**
         * Popups.
         */
        $employeesContainer.on('click', '.person', function () {
           let id = $(this).attr('href').replace("#", '');
           showPopup(id);
        });
        $('body').on('click', '.overlay, .close',  function () {
            $overlay.fadeOut('fast');
            $popup.fadeOut('fast');
        });
        $controls.on('click', '.prev, .next',  function (e) {
            let newElement;
            // get current Element
            let currentId = $popup.attr('data-id');
            let currentElement = $employeesContainer.find('a[href="#' + currentId + '"]');

            // get prev or next element
            if($(this).hasClass('next')) {
                newElement = currentElement.nextAll('a:visible');

                // if we don't have next lest show first
                if(newElement.length === 0) {
                    newElement = $employeesContainer.find('a:visible:first');
                }
            } else {
                newElement = currentElement.prevAll('a:visible');

                // if we don't have prev lest show last
                if(newElement.length === 0) {
                    newElement = $employeesContainer.find('a:visible:last');
                }
            }

            // get new id
            let newId = newElement.attr('href').replace("#", '');

            //show target popup
            showPopup(newId);
        });

        /**
         * Search.
         */
        $searchInput.on('keyup change', function () {
            // get value and all persons
            let searchString = $(this).val().toLowerCase();
            const $persons = $('.person');

            if(searchString.length > 0) {
                // disable all
                $persons.hide();

                $persons.each(function () {
                    let item = $(this);
                    // search only name and username
                    let itemContent = item.find('h2').text() + item.attr('data-username');

                    if (itemContent.toLowerCase().indexOf(searchString) !== -1) {
                        // show and enable found items
                        item.show();
                    }
                });
            } else {
                // show and enable all
                $persons.show();

            }

        });

    });
})(jQuery);

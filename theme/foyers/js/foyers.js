 angular.module('rubedoFields').filter('firstword', function() {
        return function(input, splitIndex) {
            // do some bounds checking here to ensure it has that index

												if (!splitIndex) {
																						 return input.split(" ")[0];
												}
												else return input.split(' ').slice(1).join(' ');
        }
    });  
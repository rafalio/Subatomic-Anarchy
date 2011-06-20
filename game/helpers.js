exports.arrayFilter = function(filters, array) {
  var ret = {};
  filters.forEach(function(e){
    if(array[e] != undefined)
      ret[e] = array[e];
  });
  return ret;
}

exports.normal = function() {
	var x = 0, y = 0, rds, c;

	// Get two random numbers from -1 to 1.
	// If the radius is zero or greater than 1, throw them out and pick two new ones
	// Rejection sampling throws away about 20% of the pairs.
	do {
	x = Math.random()*2-1;
	y = Math.random()*2-1;
	rds = x*x + y*y;
	}
	while (rds == 0 || rds > 1)

	// This magic is the Box-Muller Transform
	c = Math.sqrt(-2*Math.log(rds)/rds);

	// It always creates a pair of numbers. I'll return them in an array. 
	// This function is quite efficient so don't be afraid to throw one away if you don't need both.
	return [x*c, y*c];
}

exports.round2 = function(dec, num){
  return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
}
/**
*	EVENT FUNCTIONS
*/
// onBlur: Validate input
$("input[type='text']").blur(function(e){
	if ( !validateInputs($(this).val()) ) {
		$('#error').stop().html("<p>Sorry! We only allow numbers with <em>either</em> one '.' or one '/'</p>").slideDown().delay(3000).slideUp();
		$(this).val(0);
	}
});

// onSubmit: Re-validate + FindRoots
$('#solve').on('click',function(e){
	$('#solution').hide();

	var coeff = [	$('#a').val(),
					$('#b').val(),
					$('#c').val()
				];

	// Validate the inputs and establish the Globals
	if (validateInputs(coeff)) {

		// Check if we're using my sqrt func or the default JS one
		var customSqrt = $('#customSqrt').is(':checked');

		// Check if we are applying polish
		var doPolish = $('#newtON').is(':checked');

		// Find the roots
		var result = findRoots(coeff, customSqrt, doPolish);

	} else {

		$('#error').stop().html("<p>Somehow your inputs are invalid.  Please check them again.</p>").slideDown().delay(3000).slideUp();
	}
});


/**
*	OPRATIONAL FUNCTIONS
*/
// Validate the user's input onBlur and onSubmit
function validateInputs( inputs ){
	// is "inputs" an array?
	var isArray = inputs.constructor.toString().indexOf("Array") != -1;
	// If not an array, return the validity of this value alone
	if ( !isArray) {
		return /^(\-?){1}\d+((\.|\/){1}\d+)?$/.test(inputs);
	}

	// If array, return if all values are valid
	var isNum;
	for (var i=0; i < inputs.length; i++) {
		isNum = /^(\-?){1}\d+((\.|\/){1}\d+)?$/.test(inputs[i]);
		if ( !isNum )
			return false;
	}
	// All good!
	return true;
}


/*
* Root Finding Function
* Params: 	inputs 		 = 3 inputs in array,
*			sqrtStatus 	 = should we use custom sqrt func
*			polishStatus = should we polish the roots with Newton-Raphson's Method
* Returns an array of roots (of length 0, 1, or 2)
*/
function findRoots( inputs, sqrtStatus, polishStatus ) {
	$('#s3,#s2,#s1').hide();

	var size = inputs.length;
	// This should never happen for our usage
	if (size != 3) {
		$('#error').stop().html("<p>Somehow you didn't enter 3 values.  Nice try I guess.</p>").slideDown().delay(3000).slideUp();
		return [];
	}

	// Get an array of floats from an array of Strings
	inputs = StringArrayToFloatArray( inputs );

	// Array to return
	var roots = [];
	// Renaming for clarity
	var a = inputs[0];
	var b = inputs[1];
	var c = inputs[2];


	if (a == 0.0){

		if (b == 0.0){
			if (c == 0.0) {
				// All three inputs are 0, x can be anything
				$('#error').stop().html("<p>'x' can be anything if all the inputs are 0.</p>").slideDown().delay(3000).slideUp();
				return [];
			} else {
				// Division by 0 error
				$('#error').stop().html("<p>Since a=0 and b=0, this is a division by 0 error.</p>").slideDown().delay(3000).slideUp();
				return [];
			}
		}

		$('#solution').fadeIn();

		// One root; found by -c/b
		roots.push( -c/b );
		$('#s3').html("<p>Since 'a' = 0, we know we only have 1 <u>real</u> root.</p>" +
					  "<p>root = -c/b = " + -c + "/" + b + " = " + roots[0] + ".</p>").fadeIn();

		return roots;
	}

	$('#solution').fadeIn();

	// STEP 1: Calculate the Discriminant
	var D = (b * b) - (4 * a * c);
		// Display how it was calculated
		$('#D').html("D = " + b + "*" + b + " - 4*" + a + "*" + c + "<br /> = " +b*b + " - " + 4*a*c + " <br /><strong>= " + D+"</strong>");
		$('#s1').fadeIn();

	// STEP 2: Calculate the divider
	var divider = 2.0 * a;
		$('#div').html("divider = 2*" + a + " <strong>= " + divider +"</strong>");
		$('#s2').fadeIn();

	// STEP 3: Evaluate what kind of solution we should get
	if (D == 0.0) {
		// One REAL root
		var r1 = -b/divider;
		roots.push( r1 );
		$('#s3').html("<p>Since D = 0, we know we only have 1 <u>real</u> root.  It can be found by calculating -b/divider<br />= " + -b + "/" + divider + "<br />= "+ r1 +".</p>").fadeIn();

	} else if (D > 0.0) {
		// Two REAL roots

		// Use the sqrt selected from the form, custom or default
		var sqrtD = (sqrtStatus ? squareRoot(D) : Math.sqrt(D));
		var r1 = (-b+sqrtD) / divider;
		var r2 = (-b-sqrtD) / divider;

		roots.push( r1 );
		roots.push( r2 );
		$('#s3').html("<p>Since D > 0, we know we have 2 <u>real</u> roots.</p>" +
					  "<p>They can be found by calculating (-b &plusmn; &radic;(b<sup>2</sup>-4ac))/2a</p> " +
					  "<code>= ("+ -b + " &plusmn; &radic;(" + b*b + " - " + 4*a*c + ")) / " + divider + "<br/>" +
					  "<code>= ("+ -b + " &plusmn; &radic;(" + D + ")) / " + divider + "<br/>" +
					  "<code>= ("+ -b + " &plusmn; " + sqrtD + ") / " + divider + "</code><br/>" +
					  "<code>= ("+ -b + " &plusmn; " + sqrtD + ") / " + divider + "</code><br/>" +
					  "<p>Root1: <span class='special'>" + roots[0] + "</span></p>" +
					  "<p>Root2:  <span class='special'>" + roots[1] + "</span></p>").fadeIn();

	} else { // D < 0.0
		// Two COMPLEX roots
		roots.push('i');
		$('#s3').html("<p>Since D < 0, we know we have 2 <u>complex</u> roots; you can't regularly find the square root of a negative number.</p>" +
					  "<p>Sorry, I can't <em>imagine</em> yet.  This is as far as I can go.</p>").fadeIn();
		$('#proofText').html('');
		$('#proof').hide();
		return roots;
	}

	// Shall we polish?
	if (polishStatus) {
		roots[0] = rootPolisher(roots[0], a, b, c);

		if (roots.length > 1)
			roots[1] = rootPolisher(roots[1], a, b, c);
	}

	// Do proof
	$('#proofText').html('');
	for (var i=0; i<roots.length; i++) {
		var tmp = i+1;
		$('#proofText').append('<h3>For root #' + tmp + '</h3>');
		var soln = a*roots[i]*roots[i] + b*roots[i] + c
		$('#proofText').append("<p>0 = ax<sup>2</sup> + bx + c</p>" +
							 "<code>0 = " + a + "*("+roots[i]+"<sup>2</sup>) + " +b + "*(" + roots[i] + ") + " + c + "<br />" +
							 "0 = " + a*roots[i]*roots[i] + " + " + b*roots[i] + " + " + c +"<br />" +
							 "<span class='special'>0 = " + soln + "</special></code>");
	}
	$('#proof').fadeIn();

	return roots;

}



/**
*	HELPER FUNCTIONS
*/
// Accepts an array of strings
// Convert each array entry from a string to a float
function StringArrayToFloatArray( data ) {
	var dataArr = [];

	for (var i = 0; i < data.length; i++) {
		dataArr = data[i].split("/");

		dataArr[0] = parseFloat(dataArr[0]);
		// If contains a '/', do the division and save the float into pos 0
		if (dataArr.length == 2) {
			dataArr[1] = parseFloat(dataArr[1]);
			dataArr[0] = dataArr[0] / dataArr[1];
		}

		// Set the correct final float value in the input array
		data[i] = dataArr[0];
	}

	return data;
}


// Applies Newton-Raphson's Method to "polish" roots
// https://en.wikipedia.org/wiki/Newton%27s_method
function rootPolisher(root, a, b, c) {
	return root - ( (a*root*root + b*root + c) / (a*root*2 + b) );
}


// Algorithm graciously borrowed from
// http://cjjscript.q8ieng.com/?p=32
// But modified to not crash browsers
function squareRoot( number ) {
	var x = 1,
		y = 1,
		count = 0;

	for (var i=0; i < number; ++i) {
		// This finds the answer
		x = 0.5*(x+(number/x))

		// If the answer is the same as the last time, increment a counter
		if (y == x)
			count++;
		// If the answer is different, restart the counter
		else {
			count=0;
			y = x;
		}
		// If we get the same answer 6 times in a row, break out of the rest of this loop
		if (count == 6)
			break;
	}
	return x;
}



/**
*	EXPERIMENTAL
*/
/*
* Complex "class"
* Not yet implemented
* By: Shadi Isber
function Complex(real, imaginary){
	this.real = real;
	this.imag = imaginary;
}

// toString
Complex.prototype.toString = function(){
	var x=this.real+'';
	var y=this.imag+'';
	return "(" + x + ", " + y + "i)";
};

// Square root of complex numbers function.
Complex.prototype.squareroot = function() {
	var tmp = Math.sqrt( (this.real*this.real)+(this.imag*this.imag) );
	var p = Math.sqrt((tmp - this.real) / 2);
	var q = this.imag / (2*p);
	return [p, q];
}
*/

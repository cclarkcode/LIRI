function doStuff1() {
	console.log('did stuff 1');
}

function doStuff2() {
	console.log('did stuff 2');
}

function doStuff3() {
	console.log('did stuff 3');
}

var actions = {
	'do-Stuff1': doStuff1,
	doStuff2: doStuff2,
	doStuff3: doStuff3
};

actions['do-Stuff1']();
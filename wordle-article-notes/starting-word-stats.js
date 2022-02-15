
//---------------------------------------------------------
//
// dependency setup
//
//---------------------------------------------------------

// Init the tester
const WordleAlgoTester = require("./WordleAlgoTester");
const WordleList = require("./wordle-list");
const WordleSolvingAlgo = require("./WordleSolvingAlgo");

//-------------------------------------------------------------------------------
//
//  test setup
//
//-------------------------------------------------------------------------------

const tester = new WordleAlgoTester( WordleList.full, WordleList.test );
const solver = new WordleSolvingAlgo( WordleList.full, WordleList.test ); 

// Optional tweaks
// solver.strictMode(true);
tester.loggingMode(true);

//-------------------------------------------------------------------------------

// reuse vars
let shortList = WordleList.test;
let rnd_state;

let WORD;
let WORD_UPP;
let WORD_ARR;

//-------------------------------------------------------------------------------

console.log( "# overall number of words in test list: "+WordleList.test.length);
console.log( "----------------------------------------------------------------------" );

//-------------------------------------------------------------------------------
//
// Word stats for "SAINE"
//
//-------------------------------------------------------------------------------

// Lets get some SAINE stats
WORD = "saine";
WORD_UPP = WORD.toUpperCase();
WORD_ARR = WORD.split("");

console.log(`# words with any of the ${WORD_UPP} characters`);
for(let m=1; m<6; ++m) {
	console.log( `- words with atleast ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let matchCount = 0;
		for(let char of WORD_ARR) {
			if( s.includes(char) ) {
				matchCount++;	
			}
		}
		if( matchCount >= m ) {
			return true;
		}
		return false;
	}).length );
}

console.log("# words without A,I,E characters " + WordleList.test.slice().filter((s) => { 
	return !s.includes("a") && !s.includes("i") && !s.includes("e")
}).length );

console.log("# words without A,I,E characters - but has S or N : " + WordleList.test.slice().filter((s) => { 
	return !s.includes("a") && !s.includes("i") && !s.includes("e") && ( s.includes("s") || s.includes("n") )
}).length );


console.log( `# words with atleast 1 exact positional match for ${WORD_UPP}` );
for(let m=1; m<6; ++m) {
	console.log( `- words with any ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let matchCount = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				matchCount++;	
			}
		}
		if( matchCount >= m ) {
			return true;
		}
		return false;
	}).length );
}

console.log( `# words with atleast 1 positional match for ${WORD_UPP} + and ...` );
for(let m=1; m<5; ++m) {
	console.log( `- words with any ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let posMatch = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				posMatch++;	
			}
		}
		if( posMatch <= 0 ) {
			return false;
		}

		// Ok we got atleast 1 full match, lets count the number of "partial/full match"
		let matchCount = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				matchCount++;	
			}
		}

		// Lets return true, if partial matches, are atleast 1 or more
		if( matchCount >= (m+1) ) {
			return true;
		}
		return false;
	}).length );
}

//-------------------------------------------------------------------------------
//
// Word stats for "CRANE"
//
//-------------------------------------------------------------------------------

console.log( "----------------------------------------------------------------------" );

// Lets get some SAINE stats
WORD = "crane";
WORD_UPP = WORD.toUpperCase();
WORD_ARR = WORD.split("");

console.log(`# words with any of the ${WORD_UPP} characters`);
for(let m=1; m<6; ++m) {
	console.log( `- words with atleast ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let matchCount = 0;
		for(let char of WORD_ARR) {
			if( s.includes(char) ) {
				matchCount++;	
			}
		}
		if( matchCount >= m ) {
			return true;
		}
		return false;
	}).length );
}

console.log( `# words with atleast 1 exact positional match for ${WORD_UPP}` );
for(let m=1; m<6; ++m) {
	console.log( `- words with any ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let matchCount = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				matchCount++;	
			}
		}
		if( matchCount >= m ) {
			return true;
		}
		return false;
	}).length );
}

console.log( `# words with atleast 1 positional match for ${WORD_UPP} + and ...` );
for(let m=1; m<5; ++m) {
	console.log( `- words with any ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let posMatch = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				posMatch++;	
			}
		}
		if( posMatch <= 0 ) {
			return false;
		}

		// Ok we got atleast 1 full match, lets count the number of "partial/full match"
		let matchCount = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				matchCount++;	
			}
		}

		// Lets return true, if partial matches, are atleast 1 or more
		if( matchCount >= (m+1) ) {
			return true;
		}
		return false;
	}).length );
}

//-------------------------------------------------------------------------------
//
// Word stats for "ADEPT"
//
//-------------------------------------------------------------------------------

console.log( "----------------------------------------------------------------------" );

// Lets get some SAINE stats
WORD = "adept";
WORD_UPP = WORD.toUpperCase();
WORD_ARR = WORD.split("");

console.log(`# words with any of the ${WORD_UPP} characters`);
for(let m=1; m<6; ++m) {
	console.log( `- words with atleast ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let matchCount = 0;
		for(let char of WORD_ARR) {
			if( s.includes(char) ) {
				matchCount++;	
			}
		}
		if( matchCount >= m ) {
			return true;
		}
		return false;
	}).length );
}

console.log( `# words with atleast 1 exact positional match for ${WORD_UPP}` );
for(let m=1; m<6; ++m) {
	console.log( `- words with any ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let matchCount = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				matchCount++;	
			}
		}
		if( matchCount >= m ) {
			return true;
		}
		return false;
	}).length );
}

console.log( `# words with atleast 1 positional match for ${WORD_UPP} + and ...` );
for(let m=1; m<5; ++m) {
	console.log( `- words with any ${m} ${WORD_UPP} characters: ` + WordleList.test.slice().filter((s) => { 
		let posMatch = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				posMatch++;	
			}
		}
		if( posMatch <= 0 ) {
			return false;
		}

		// Ok we got atleast 1 full match, lets count the number of "partial/full match"
		let matchCount = 0;
		for(let i=0; i<WORD_ARR.length; ++i) {
			if( s[i] == WORD_ARR[i] ) {
				matchCount++;	
			}
		}

		// Lets return true, if partial matches, are atleast 1 or more
		if( matchCount >= (m+1) ) {
			return true;
		}
		return false;
	}).length );
}

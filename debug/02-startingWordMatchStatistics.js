// Load the required stuff
//----------------------------------
const wordList = require("../src/word-list/original-wordle-list");
const getCharsetStatistics = require("../src/solver-framework/getCharsetStatistics");
const path = require("path");

// Lets get the word argument
const scriptFileName = path.basename( process.argv.slice()[1] );
const args = process.argv.slice(2);
const WORD = (args[0] || "saine").toUpperCase();
//----------------------------------

console.log("# ------------------------------------------------------------------------------------");
console.log(`# Getting first WORD statistics for  : ${WORD}`);
console.log(`# You can change the start WORD with : node ${scriptFileName} <startWord>`);
console.log("# ------------------------------------------------------------------------------------");

// Lets get some basic stats
WORD_UPP = WORD.toUpperCase();
WORD_ARR = WORD.toLowerCase().split("");

console.log(`- Full word list length : ${wordList.full.length}`);
console.log(`- Answer word list length : ${wordList.answer.length}`);

console.log( `- with 0 matching ${WORD_UPP} characters: ` + wordList.answer.slice().filter((s) => { 
    let matchCount = 0;
    for(let char of WORD_ARR) {
        if( s.includes(char) ) {
            matchCount++;	
        }
    }
    if( matchCount == 0 ) {
        return true;
    }
    return false;
}).length );


console.log("# ------------------------------------------------------------------------------------");
console.log(`# words with any of the ${WORD_UPP} characters`);
console.log("# ------------------------------------------------------------------------------------");
for(let m=1; m<6; ++m) {
	console.log( `- with atleast ${m} ${WORD_UPP} characters: ` + wordList.answer.slice().filter((s) => { 
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

console.log("# ------------------------------------------------------------------------------------");
console.log( `# words with atleast 1 exact positional match for ${WORD_UPP}` );
console.log("# ------------------------------------------------------------------------------------");
for(let m=1; m<6; ++m) {
	console.log( `- with any ${m} ${WORD_UPP} characters: ` + wordList.answer.slice().filter((s) => { 
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

console.log("# ------------------------------------------------------------------------------------");
console.log(`# words with atleast 1 positional match for ${WORD_UPP} + and another match ...` );
console.log("# ------------------------------------------------------------------------------------");
for(let m=1; m<5; ++m) {
	console.log( `- with any ${m} ${WORD_UPP} characters: ` + wordList.answer.slice().filter((s) => { 
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
console.log("# ------------------------------------------------------------------------------------");

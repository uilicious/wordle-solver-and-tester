// Load the required stuff
//----------------------------------
const wordList = require("../src/word-list/original-wordle-list");
const getCharsetStatistics = require("../src/solver-framework/getCharsetStatistics");

//----------------------------------
console.log("# ---------------------------------------------------");
console.log(`# Full word list length : ${wordList.full.length}`);
console.log(`# Answer word list length : ${wordList.answer.length}`);
console.log("# Processing Answer list charset stats");
console.log("# ---------------------------------------------------");

// Process and log it
const dictionaryStats = getCharsetStatistics( wordList.answer );
console.log( JSON.stringify(dictionaryStats) );

//----------------------------------
console.log("# ---------------------------------------------------");
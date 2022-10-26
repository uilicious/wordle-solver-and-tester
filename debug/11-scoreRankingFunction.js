// Load the required stuff
//----------------------------------
const wordList = require("../src/word-list/original-wordle-list");
const getCharsetStatistics = require("../src/solver-framework/getCharsetStatistics");

// Lets get the word argument
const path = require("path");
const scriptFileName = path.basename( process.argv.slice()[1] );
const args = process.argv.slice(2);
const rankingFunctionName = (args[0] || "simplePositionalScore");
//----------------------------------

console.log("# ------------------------------------------------------------------------------------");
console.log(`# Getting score statistics for : ${rankingFunctionName}`);
console.log(`# You can change the function with : node ${scriptFileName} <rankingFunctionName>`);
console.log("# ------------------------------------------------------------------------------------");


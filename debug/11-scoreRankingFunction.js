// Load the required stuff
//----------------------------------
const wordList = require("../src/word-list/original-wordle-list");
const getCharsetStatistics = require("../src/solver-framework/getCharsetStatistics");

const WordleSolvingAlgo = require("../src/solver-framework/WordleSolvingAlgo");
const WordleAlgoTester = require("../src/solver-framework/WordleAlgoTester");

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

// Get the ranking function
const rankingFunction = require("../src/ranking-function/"+rankingFunctionName);

// Setup the solver, and algo testers
const wordleSolver = new WordleSolvingAlgo(wordList.full, wordList.answer, rankingFunction);
const algoTester = new WordleAlgoTester(wordList.full, wordList.answer);

// Optional tweaks
// wordleSolver.strictMode(true);
algoTester.loggingMode(true);

// Run the ranking function
// -----------------------------

// console.log("# Running the wordle solver - with one word 'islet' ")
// console.log("# Number of gueeses needed : "+algoTester.runWithWord( wordleSolver.functionForWordleAlgoTester(), "islet") );

// console.log("# Running the wordle solver - with sample list of 100 ")
// algoTester.runWithTestWordList( wordleSolver.functionForWordleAlgoTester(), 100);

// -----------------------------

console.log("# Running the wordle solver - against the full list, this will take a long time! ")
algoTester.runWithTestWordList( wordleSolver.functionForWordleAlgoTester(), -1);
console.log("# Finished the wordle solver - test run")

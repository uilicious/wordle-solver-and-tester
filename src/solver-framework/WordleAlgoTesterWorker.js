// Load the required stuff
//----------------------------------

// Worker communication from parent
const { parentPort } = require("worker_threads");

// Word list and solver
const wordList = require("../word-list/original-wordle-list");
const WordleSolvingAlgo = require("../solver-framework/WordleSolvingAlgo");
const WordleAlgoTester = require("../solver-framework/WordleAlgoTester");
const path = require("path");

// Handles worker parent request,
//----------------------------------

// Receive message from the parent
parentPort.once("message", (config) => {
    // Does stuff
    const rankingFunctionName = config.rankingFunctionName || "simplePositionalScore";
    const offset = config.offset || 0;
    const count  = config.count  || 1000;
    
    // Get the ranking function
    const rankingFunction = require("../ranking-function/"+rankingFunctionName);
        
    // Setup the solver, and algo testers
    const wordleSolver = new WordleSolvingAlgo(wordList.full, wordList.answer, rankingFunction);
    const algoTester = new WordleAlgoTester(wordList.full, wordList.answer);

    // Run the solver
    const resp = algoTester.runWithTestWordListAndOffset( wordleSolver.functionForWordleAlgoTester(), offset, count);

    // Send result back to parent
    parentPort.postMessage(resp);
    parentPort.close();
});

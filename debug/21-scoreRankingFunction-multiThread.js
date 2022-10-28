// Load the required stuff
//----------------------------------

const WordleAlgoTesterMultiThreaded = require("../src/solver-framework/WordleAlgoTesterMultiThreaded");

// Lets get the word argument
const path = require("path");
const scriptFileName = path.basename( process.argv.slice()[1] );
const args = process.argv.slice(2);
const rankingFunctionName = (args[0] || "01-simplePositionalScore");

//----------------------------------
// Running inside an async function
//----------------------------------
(async function() {
    
    console.log("# ------------------------------------------------------------------------------------");
    console.log(`# Getting score statistics for : ${rankingFunctionName}`);
    console.log(`# You can change the function with : node ${scriptFileName} <rankingFunctionName>`);
    console.log("# ------------------------------------------------------------------------------------");

    // -----------------------------
    const algoTester = new WordleAlgoTesterMultiThreaded(rankingFunctionName);

    // -----------------------------
    console.log("# Running the wordle solver - against the full list, this will take a long time! ")
    const res = await algoTester.runScoring();
    console.log(res);
    console.log("# Finished the wordle solver - test run")


})();
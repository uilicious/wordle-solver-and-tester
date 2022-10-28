// Load the required stuff
//----------------------------------

// The snippetb uilder
const SnippetBuilder = require("../src/uilicious-snippet/SnippetBuilder");

// Lets get the word argument
const path = require("path");
const scriptFileName = path.basename( process.argv.slice()[1] );
const args = process.argv.slice(2);
const rankingFunctionName = (args[0] || "v4-matchedPositionalScore");

//----------------------------------
// Running inside an async function
//----------------------------------
(async function() {   
    console.log("# ------------------------------------------------------------------------------------");
    console.log(`# Running against today wordle @ snippet.uilicious.com with : ${rankingFunctionName}`);
    console.log(`# You can change the function with : node ${scriptFileName} <rankingFunctionName>`);
    console.log("# ------------------------------------------------------------------------------------");

    console.log("# Uploading the sinppet")
    const snippetID = await SnippetBuilder.buildAndRunSnippetCode( rankingFunctionName );
    console.log(`# Finished uploading, you can view the snippet at : https://snippet.uilicious.com/test/public/${snippetID}`)
    console.log("# ------------------------------------------------------------------------------------");
})();
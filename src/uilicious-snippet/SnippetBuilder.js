const fs = require("fs")
const path = require("path");
const scriptDir = __dirname;
const https = require('https');

/**
 * Given the ranking function name, build the full string representing the snippet code
 * @return the full snippet code
 */
function buildSnipppetCode( rankingFunctionName ) {
    if( rankingFunctionName == null ) {
        throw "Missing ranking function name";
    }

    let snippetPrefix = fs.readFileSync( path.join(scriptDir, "snippet-prefix.test.js"), "utf8");
    let snippetSuffix = fs.readFileSync( path.join(scriptDir, "snippet-suffix.test.js"), "utf8");

    // The ranking function file
    let rankingFunction = fs.readFileSync( path.join(scriptDir, `../ranking-function/${rankingFunctionName}.js`), "utf8");

    // Get the "getCharsetStatistics", without the last 2 line (modules related statements)
    let getCharsetStatistics = fs.readFileSync( path.join(scriptDir, "../solver-framework/getCharsetStatistics.js"), "utf8").split("\n").slice(0, -2).join("\n");

    // Get the solving class, without the first and last 2 line (modules related statements)
    let WordleSolvingAlgo = fs.readFileSync( path.join(scriptDir, "../solver-framework/WordleSolvingAlgo.js"), "utf8").split("\n").slice(2, -2).join("\n");

    // Lets build the full thing
    return ""+ //
        snippetPrefix.replace("// {{{ RANKING_FUNCTION_INJECTION }}}", rankingFunction)+"\n"+ //
        snippetSuffix.replace("// {{{ WORDLE_SOLVER_INJECTION }}}", getCharsetStatistics+"\n"+WordleSolvingAlgo )+"\n"; //       
}


/**
 * With the given snippet code, upload and run it to snippet.uilicious.com
 * @return the snippetID
 */
async function runSnippetCode( snippetCode, scriptTitle = "Snippet Example" ) {

    const req_options = {
        protocol: 'https:',
        hostname: 'api-snippet.uilicious.com',
        port: 443,
        method: 'POST',
        path: '/api/v2/snippet/start',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const req_body = {
        browser: "chrome",
        height: 960,
        width:1280,
        name: scriptTitle,
        script: snippetCode
    }

    const req_promise = new Promise((resolve, reject) => {
        // Perform the request and await response
        const req = https.request(req_options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: body });
            });
            res.on('error', () => {
                console.log('error');
                reject(Error('Snipppet start failed'));
            });
        });

        // This sends the snippet payload
        req.write(JSON.stringify(req_body));
        req.end();
    });

    // Get the response 
    const resObj = await req_promise;
    const resJson = JSON.parse(resObj.body);

    // Return the snippetID
    return resJson.snippetID;
}

/**
 * Given the ranking function name, build the full string representing the snippet code
 * And run and return the snippetID
 * 
 * @return snippetID
 */
async function buildAndRunSnippetCode( rankingFunctionName ) {
    return runSnippetCode( buildSnipppetCode( rankingFunctionName ), "WORDLE solver via Uilicious" );
}

module.exports = {
    buildSnipppetCode, 
    runSnippetCode,
    buildAndRunSnippetCode
}
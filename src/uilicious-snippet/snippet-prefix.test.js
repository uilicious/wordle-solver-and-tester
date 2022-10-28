//=========================================================
//
//  Uilicious WORDLE solver
//
//  Get your daily wordle solution, anytime, anyday =)
//
//  Version: 1.2 (28th Oct 2022) - Revised Solver
//
//  Code walkthrough link: 
//  https://uilicious.com/blog/automate-wordle-via-uilicious/
// 
//  Github project link: 
//  https://github.com/uilicious/wordle-solver-and-tester/blob/main/wordle-snippet.test.js
//
//=========================================================

//
// While uilicious is normally used for testing purposes
// we can have fun with it doing other interesting things
// like solving wordle
//
// so lets do the basics first by loading the website
//

// Lets load the wordle app
// We are using an old mirror to avoid the NYT rewrite (and future rewrites)
// Which is broken with our scripts 
I.goTo("https://dazzlepod.com/wordle/")

// Dismiss the initial tracker prompt (if shown)
// I.click$("reject");

// Click anywhere, on the top left corner
// to skip the welcome tutorial prompt
// - 40 pixel from the left
// - 80 pixel from the top
I.see$("Guess the WORDLE")
I.click('/html/body', 40, 80)
// I.click$("close");

//
// Now we got the page loaded, lets start with functions
// to help us interact with the game UI.
//
TEST.log.info("==== START OF NEW GAME ====");

//--------------------------------------------------------
//
//  Setup word ranking function, used for word selection
//
//--------------------------------------------------------

// Lets fake the module.exports object 
let module = {};
module.exports = module.exports || null;

// The actual ranking function injected here ...
// {{{ RANKING_FUNCTION_INJECTION }}}

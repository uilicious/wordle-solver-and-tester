//
// The following is used to further explain the variables passed into the ranking function
//
// Note: All single characters used in sets/object are lowercase unless specified otherwise
// Note: For the scoring function to work with uilicious snippet builder, it must have zero "require" dependencies
//
// # word
// The current word being scored, with the score as return value. The highest scoring word of the round, will be selected
//
// # charStats
// The current statistical analysis of possible valid wordle answers
// this is limited to the "answer list" and not the full word list. And contains the following values
//
// - overall : Object, containing frequency of apperance of each character
// - unique  : Object, containing frequency of apperance of each character per word (meaning, duplicates in 1 word is ignored)
// - positional : An array of object, which provides the frequency of apperance unique to that word position
//   - [0-4] : Object, containing frequency of character, specific to that position
//
// For example you can find the frequency of the letter "s", at a specific position with
// `charStats.positional[0]["s"]`
//
// Alternatively you can find its unique count via
// `charStats.unique["s"]`
//
// # state
// The current game state, containing the following
//
// - wordList    : Object containing various sub word list
//   - full      : Array<String> containing the full word list, unfiltered 
//   - filtered  : Array<String> containing words which are potential answers (according to current game state)
//   - unique    : Array<String> containing words from the full list, with no duplicate characters
// - history     : Array<String> of all past attempted words
// - badCharSet  : Set<String> containing letters that are known to be "bad" (no match)
// - goodCharSet : Set<String> containing letters that are known to be "good" (yellow or green)
// - pos         : Array<Object> for positional specific information
//   - hintSet   : Set<String> containing letters that are partial match (yellow)
//   - foundChar : String, if set, represents the found matching character (green)
// - round       : Round number of the current attempt
// - roundLeft   : Number of remaining rounds
//

/**
* Does a very naive and simple scoring, based on the provided character statistics
* 
* @param {String} word to score 
* @param {Object} charStats, output from getCharsetStatistics - using the current valid answer list 
* @param {Object} state object (to refine score)
* 
* @return {Number} representing the word score (may have decimal places)
**/
function simplePositionalScore( word, charStats, state = null ) {

    // the final score to return
    let score = 0;
    
    // For each character, populate the overall stats
    for( let i=0; i<word.length; ++i ) {
        // Get the character
        const char = word.charAt(i);
        
        // Lets get the score at a specific position
        if( charStats.positional[i][char] ) {
            score += charStats.positional[i][char]*10000;
        } 

        // Lets get the unique position scoring as a tie breaker
        if( charStats.unique[char] ) {
            score += charStats.unique[char]
        }
        
        // -- Loops to the next char -- //
    }
    
    // Return the final score
    return score;
}
module.exports = simplePositionalScore;


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

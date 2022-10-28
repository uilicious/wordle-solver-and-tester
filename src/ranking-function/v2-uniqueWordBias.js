
/**
* Does a very naive and simple scoring, based on the provided character statistics
* 
* @param {String} word to score 
* @param {Object} charStats, output from getCharsetStatistics - using the current valid answer list 
* @param {Object} state object (to refine score)
* 
* @return {Number} representing the word score (may have decimal places)
**/
function uniqueWordBias( word, charStats, state = null ) {
    // the final score to return
    let score = 0;

    // Character set for the word
    const charSet = new Set();

    // For each character, populate the overall stats
    for( let i=0; i<word.length; ++i ) {
        // Get the character
        const char = word.charAt(i);
        
        // Populate the charset, we check this later to favour words of unique chars
        charSet.add( char );

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

    // Unless its the last 2 rounds, we skip words which are NOT unique
    if( state && state.roundLeft <= 1 ) {
        // does nothing
    } else {
        // only allow unqiue words
        if( charSet.size != word.length ) {
            return -score;
        }
    }
    
    // Return the final score
    return score;
}
module.exports = uniqueWordBias;
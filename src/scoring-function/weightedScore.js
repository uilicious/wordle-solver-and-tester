
/**
* The heart of the wordle solving system.
* 
* This require the current statistical model of "valid solutions", produced using the `charsetStatistics`
* 
* Along with the word to score. Additionally, a state object maybe provided, to help optimize and refine
* the word selection processs. finalStretch is used to indicate a change in strategy - where the best answer should
* be choosen, instead of choosing a word that gives the most "info"
* 
* @param {String} word to score 
* @param {Object} charStats, output from getCharsetStatistics - using the current valid answer list 
* @param {Object} state object (to refine score)
* 
* @return {Number} representing the word score (may have decimal places)
**/
function weightedScore( word, charStats, state = null ) {
    // Character set for the word
    const charSet = new Set();
    
    // the final score to return
    let score = 0;
    
    // Skip attempted words - like WHY ???
    if( state && state.history ) {
        if( state.history.indexOf(word) >= 0 ) {
            return -1000*1000;
        }
    }

    // Wordle Strategy note:
    //
    // - Penalize duplicate characters, as they limit the amount of information we get
    // - Priotize characters with high positional score, this helps increase the chances of "exact green matches" early
    //   reducing the effort required to deduce "partial yello matches"
    // - If there is a tie, in positional score, tie break it with "unique" score and overall score
    //   this tends to be relevent in the last <100 matches
    //
    // - We used to favour positional score, over unique score in "finalStretch" mode only
    //   but after several trial and errors run, we found it was better to just use positonal score all the way
    //   making the "finalStretch" flag kinda useless now (kept in place in case we make changes)
    
    // For each character, populate the overall stats
    for( let i=0; i<word.length; ++i ) {
        // Get the character
        const char = word.charAt(i);
        
        // skip scoring of known character matches
        // or the attempted character hints
        if( state ) {
            // Skip known chars (good/found)
            if( state.pos && state.pos[i].foundChar == char ) {
                score += -50;
                charSet.add( char );
                continue;
            }
            
            // Skip scoring of duplicate char
            if( charSet.has( char ) ) {
                score += -25;
                continue;
            }
            
            // Skip known chars (good/found)
            if( state.goodCharSet && state.goodCharSet.has(char) ) {
                score += -10;
                charSet.add( char );
                continue;
            }
        } else {
            // Skip scoring of duplicate char 
            if( charSet.has( char ) ) {
                score += -25;
                continue;
            }
        }
        
        // Populate the charset, we check that this to favour words of unique chars
        charSet.add( char );
        
        // Dev Note:
        //
        // In general - we always do a check if the "character" exists in the list.
        // This helps handle some NaN situations, where the character has no score
        // this is possible because the valid list will include words, that can be inputted
        // but is not part of the filtered list - see `charsetStatistics`
        
        if( charStats.positional[i][char] ) {
            score += charStats.positional[i][char]*10000;
        } 
        if (charStats.unique[char]) {
            score += charStats.unique[char]
        }
        
        // -- Loops to the next char -- //
    }
    
    // Return the score
    return score;
}

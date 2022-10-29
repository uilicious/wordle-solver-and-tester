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
function matchedPositionalScore( word, charStats, state = null ) {
	// Get the various wordlist
	const wordList = state.wordList;
	
	// the final score to return
	let score = 0;

	// The game runs in 2 stages,
	// - stage 1 : get as much information as possible
	// - stage 2 : guess for winning (either as a reckless gamble, or certainty)
	let isFinalStages = (state.roundLeft <= 0) || (state.wordList.filtered.length < (state.roundLeft));

	// Overall Wordle Strategy note:
	//
	// - Penalize duplicate characters, as they limit the amount of information we get (must all be unique characters)
	// - Priotize characters with high positional score, this helps increase the chances of "exact green matches" early
	//   reducing the effort required to deduce "partial yellow matches"
	// - If there is a tie, in positional score, tie break it with "unique" score and overall score
	//   this tends to be relevent in the last <100 matches
	// - If a match is already found, and its not in the final stages, use it to find other possible matches.
	//

	// Is stage 1
	if( !isFinalStages ) {
		// Character set for the word
		const charSet = new Set();
		
		// Iterate each char
		for( let i=0; i<word.length; ++i ) {
			// Get the character
			const char = word.charAt(i);
			const isDuplicateChar = charSet.has(char);
			// Ensure its added to charset
			charSet.add( char );

			// Penalize having duplicate characters
			// as they limit information gain
			if( isDuplicateChar ) {
				// score += -10*1000*10000;
				continue;
			}

			// Ignore characters in the bad charset (possible when matching full list)
			if( state.badCharSet && state.badCharSet.has(char) ) {
				// score += -10*1000*10000;
				continue;
			}

			// We already know the current position, lets use this collumn
			// to find other positions instead, from other charStats
			if( state.pos && state.pos[i].foundChar ) {
				// Skip if its already the known character
				// (no information gain)
				if( state.pos[i].foundChar == char ) {
					// score += -1000*1000*10000;
					continue;
				}

				// Skip known good character, cause getting
				// more yellows is not useful information
				if( state.goodCharSet && state.goodCharSet.has(char) ) {
					continue
				}

				// Score using other position
				for(let a=0; a<word.length; ++a) {
					// Lets skip other found positions as well
					if( state.pos[a].foundChar ) {
						continue;
					}

					// Lets add up its positional score
					if( charStats.positional[a][char] ) {
						score += charStats.positional[a][char]*1000;
					}
				}
				// Once again we use unique for tie breaker
				if (charStats.unique[char]) {
					score += charStats.unique[char]
				}
				continue;
			}

			// Score positional and unique
			// as per normal
			if( charStats.positional[i][char] ) {
				score += charStats.positional[i][char]*10000;
			} 
			if (charStats.unique[char]) {
				score += charStats.unique[char]
			}
		}

		return score;
	}

	// Is stage 2
	if( isFinalStages ) {
		// Ignore words not on the filtered list of possible answers
		if( wordList.filtered.indexOf( word ) < 0 ) {
			return -1000*1000*10000;
		}

		// For each character, populate the overall stats
		for( let i=0; i<word.length; ++i ) {
			// Get the character
			const char = word.charAt(i);

			// Score positional and unique
			if( charStats.positional[i][char] ) {
				score += charStats.positional[i][char]*10000;
			} 
			if (charStats.unique[char]) {
				score += charStats.unique[char]
			}
		}
		// Return the score
		return score;
	}
}
module.exports = matchedPositionalScore;
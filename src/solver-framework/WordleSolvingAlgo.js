const getCharsetStatistics = require("./getCharsetStatistics");

/***
* This is a, hopefully good, wordle solving system
* 
* That is designed to be usable, against "any" dictionary dataset.
* And should work on the various language varients / clones, with the right dataset.
* 
* And does so without historical cheating.
* 
* While it has been hand optimized to do a near perfect score against the official wordle list.
* YMMV for other wordle languages / systems.
* 
* Dictionary is not included in this class, as it maybe modified for varients.
**/
class WordleSolvingAlgo {
	
	//----------------------------------------------------
	// Setup functions
	//----------------------------------------------------
	
	/**
	* Initilaize the solving system, with the full word list, and/or
	* the reduced word list (of possible answers)
	* 
	* Note that wordList is not needed if using with `WordleAlgoTester`
	* 
	* @param {Array<String>} fullWordList of all possible words
	* @param {Array<String>} filteredWordList of possible answers
	* @param {Function}      rankingFunction to use instead
	*/
	constructor( fullWordList = [], filteredWordList = null, rankingFunction = null ) {
		// prepare the word list
		this.fullWordList = Object.freeze( Array.from(new Set(fullWordList)) );
		this.filteredWordList = (filteredWordList != null)? Object.freeze( Array.from(new Set(filteredWordList)) ) : this.fullWordList;
		this.uniqueWordList = this.filterForUniqueWords( this.fullWordList );
		// ranking function overwrite
		if( rankingFunction != null ) {
			this.rankingFunction = rankingFunction;
		} else {
			this.rankingFunction = null;
		}

		// default values
		this.strictMode(false);
		this.maxRounds(6);
	}
	
	/**
	* Set or configure strict mode, where invalid characters
	* are not allowed to be used in guesses
	* 
	* @param {Boolean} set the strict mode if provided.
	*/
	strictMode(set = null) {
		if(set === true || set === false) {
			this.strict = set;
		}
		return this.strict == true;
	}
	
	/**
	* Set the max number of rounds to assume.
	* 
	* @param {Boolean} set the max number of rounds
	*/
	maxRounds(set = null) {
		if(set != null) {
			this.maxRound = set;
		}
		return this.maxRound || 6;
	}
	
	//----------------------------------------------------
	// Core functions
	//----------------------------------------------------
	
	
	/**
	* Given the minimum state object, suggest the next word to attempt a guess.
	* 
	* ---
	* # "state" object definition
	* 
	* The solver, requires to know the existing wordle state information so this would consist of (at minimum)
	* 
	* .history[]    : an array of past wordle guesses
	* .pos[]        : an array of objects containing the following info
	*    .hintSet   : set of characters that are valid "hints"
	*    .foundChar : characters that are confirmed for the given position
	* 
	* The above is compliant with the WordleAlgoTester state object format
	* Additional values will be added to the state object, using the above given information
	* --- 
	* 
	* @param {Object} state 
	* 
	* @return {String} word guess to perform
	*/
	suggestWord( state ) {
		
		// Normalize the state object
		state = this._normalizeStateObj(state);
		
		// Lets get the respective wordlist
		let fullWordList = this.fullWordList;
		let filteredWordList = this.filterWordList( this.filteredWordList, state );
		let uniqueWordList = this.filterForUniqueWords( this.uniqueWordList, state );
		
		// And make the guess
		return this.suggestWord_fromStateAndWordList( state, {
			full: fullWordList,
			unique: uniqueWordList,
			filtered: filteredWordList
		});
	}
	
	/**
	* Given the state object, normalize various values, using the minimum "required" value.
	* This does not provide as much data as `WordleSolvingAlgo` focusing on the minimum required
	* to make the current system work
	* 
	* @param {Object} state 
	* 
	* @return {Object} state object normalized
	*/
	_normalizeStateObj( state ) {
		// Always starting from round 1
		state.round = state.history.length + 1;
		
		// Rounds left calculation
		state.roundLeft = this.maxRound - state.round;
		
		// and normalize wordLength
		state.wordLength = state.pos.length;
		
		// Find the bad/good charset
		if( state.badCharSet == null ) {
			state.badCharSet = new Set();
		}
		if( state.goodCharSet == null ) {
			state.goodCharSet = new Set();
		}
		
		// Lets build the good charset
		for(let i=0; i<state.wordLength; ++i) {
			if( state.pos[i].foundChar ) {
				state.goodCharSet.add(state.pos[i].foundChar);
			}
			for(let char of state.pos[i].hintSet) {
				state.goodCharSet.add(char);
			}
		}
		
		// Lets iterate history and build badCharSet
		for(let i=0; i<state.history.length; ++i) {
			const word = state.history[i];
			
			for( let w=0; w<word.length; ++w ) {
				// check the individual char
				let char = word.charAt(w);
				
				// If char is not in good set
				if( !state.goodCharSet.has(char) ) {
					// its in the bad set
					state.badCharSet.add(char);
				}
			}
		}
		
		// Return the normalize state object
		return state;
	}
	
	//----------------------------------------------------
	// WordleAlgoTester optimized functions
	//----------------------------------------------------
	
	/**
	* Generate and return a binded function, for use with WordleAlgoTester
	* @return {Function} to use
	*/
	functionForWordleAlgoTester() {
		return this.suggestWord_fromStateAndWordList.bind( this );
	}
	
	/**
	* Suggest and return a word, for use - this is designed to be used directly with `WordleAlgoTester` class
	* Which was used to help score, the usefulness of the current algorithim.
	* 
	* For other wordle solver use case, you may want to use the other functions
	* 
	* @param {Object} state of the current wordle system, this should be generated / provided by `WordleAlgoTester` or this class
	* @param {Object} wordList consisting of filtered (possible answers only), unique (valid words with no repeated chars), and full wordlist (all valid words)
	* 
	* @return {String} word if possible, else null
	*/
	suggestWord_fromStateAndWordList( state, wordList ) {
		// stats list
		let statsList = wordList.filtered;
		if( wordList.filtered == null || wordList.filtered.length <= 0 ) {
			console.warn("[WARNING]: Unexpected empty 'filtered' wordlist, with no possible answers : falling back to full word list");
			statsList = this.filterWordList( wordList.full, state );
		}
		if( wordList.filtered == null || wordList.filtered.length <= 0 ) {
			console.warn("[WARNING]: Unexpected empty 'filtered' wordlist, with no possible answers : despite processing from full list, using it raw");
			statsList = wordList.full;
		}
		
		// Get the charset stats
		const charStats = getCharsetStatistics(statsList);
		
		// sort the scored list, use unique words in first few rounds
		let scoredList = wordList.full;
		
		// This is for strict mode
		if( this.strict ) {
			scoredList = wordList.full.slice().filter((s) => {
				// Limit it down to strictly words, without any bad character
				for(const char of state.badCharSet) {
					if( s.includes(char) ) {
						return false;
					}
				}
				return true;
			}).filter((s) => {
				// Limit it down to strictly words, which must include good characters
				for(const char of state.goodCharSet) {
					if( !s.includes(char) ) {
						return false;
					}
				}
				return true;
			}).filter((s) => {
				// Limit it down to strictly words, which must include matched characters
				if(state.pos) {
					for(let i=0; i<state.pos.length; ++i) {
						if( state.pos[i].foundChar ) {
							if( s.charAt(i) != state.pos[i].foundChar ) {
								return false;
							}
						}
					}
				}
				return true;
			});
		} else {
			// for non strict mode, lets use the FULL list
			//
			// this has much higher success rate, as it can choose
			// words that are not in the strict list, 
			// when trying to drastically reduce guesses
			//
			// sometimes the most optimal answer, 
			// is to repeat a known bad character
			scoredList = wordList.full;
		}

		// Skip attempted words - like WHY ???
		if( state && state.history ) {
			scoredList = scoredList.slice().filter((word) => {
				if( state.history.indexOf(word) >= 0 ) {
					return false;
				}
				return true;
			});
		}
		
		// // you should use filtered list in last round, or when its a gurantee "win"
		// let finalStretch = false;
		// if( wordList.filtered.length > 0 && //
		// 	( wordList.filtered.length < state.roundLeft || state.roundLeft < 1 ) 
		// 	) {
		// 	finalStretch = true;
		// }
		
		// Self refrence
		const self = this;

		// Setup the refState object
		const refState = Object.assign({}, state);
		// refState.finalStretch = finalStretch;
		refState.wordList = wordList;
		
		// Score word sorting
		scoredList = scoredList.slice(0).sort(function(a,b) {
			// Get teh score
			let bScore = self.scoreWord( b, charStats, refState );
			let aScore = self.scoreWord( a, charStats, refState );
			
			// And arrange them accordingly
			if( bScore > aScore ) {
				return 1;
			} else if( bScore == aScore ) {
				// Tie breakers - rare
				// as we already have score breakers in the algori
				if( b > a ) {
					return 1;
				} else if( a > b ) {
					return -1;
				}
				// Equality tie ???
				return 0;
			} else {
				return -1;
			}
		});
		
		// // Logging for output / debugging
		// if( state.roundLeft < 1 &&  scoredList.length > 1 ) {
		// 	console.log("### Final round warning - non detirministic ")
		// 	console.log( scoredList );
		// 	console.log( state );
		// } else if( state.round >= 5 ) {
		// 	// console.log("### Round logging : "+state.round)
		// 	// console.log( state );
		// 	// console.log( scoredList.slice(0,20) );
		// 	// console.log( charStats );
		// }
		// console.log(`# Guess: ${scoredList[0]}`)
		
		// Return the highest scoring word guess
		return scoredList[0];
	}
	
	//----------------------------------------------------
	// Useful functions, used internally
	//----------------------------------------------------
	
	/**
	* Given the wordList, filter only for possible answers, using the state object.
	* And returns the filtered list. This function just returns the wordList, if state == null
	* @param {Array<String>} wordList 
	* @param {Object} state 
	*/
	filterWordList( wordList, state = null ) {
		// Skip if its not setup
		if( state == null || wordList.length <= 0 ) {
			return wordList;
		}
		
		// Get teh word length
		const wordLength = wordList[0].length;
		
		// Filter and return
		return wordList.filter(function(s) {
			// filter out invalid words (aka hard mode)
			if( state.badCharSet ) {
				for(const bad of state.badCharSet) {
					// PS : this does nothing if the set is empty
					if(s.includes(bad)) {
						return false;
					}
				}
			}
			
			// filter out words with wrong hint locations
			if( state.pos ) {
				for(let i=0; i<wordLength; ++i) {
					let sChar = s.charAt(i);
					if(state.pos[i].foundChar && sChar != state.pos[i].foundChar) {
						return false;
					}
					// PS : this does nothing if the set is empty
					for(const bad of state.pos[i].hintSet) {
						if(sChar == bad) {
							return false;
						}
					}
				}
			}
			
			// filter out words WITHOUT the hinted chars
			if( state.goodCharSet ) {
				// PS : this does nothing if the set is empty
				for(const good of state.goodCharSet) {
					if(!s.includes(good)) {
						return false;
					}
				}
			}
			
			// all checks pass, return true
			return true;
		});
	}
	
	/**
	* Given the wordList, filter out for "unique" words, that do not have repeat characters
	* If state is given, filter out characters which has been attempted
	* 
	* @param {Array<String>} wordList 
	* @param {Object} state 
	*/
	filterForUniqueWords( wordList, state = null ) {
		return wordList.filter(function(s) {
			let wordCharSet = new Set();
			
			// If state object is provided, check against bad/goodCharSet
			if( state ) {
				// filter out invalid words (hard mode)
				for(const bad of state.badCharSet) {
					if(s.includes(bad)) {
						return false;
					}
				}
				// filter out for unique char (only unused chars)
				for(const bad of state.goodCharSet) {
					if(s.includes(bad)) {
						return false;
					}
				}
			}
			
			// iterate the characters
			for(const char of s) {
				// Update teh word charset
				wordCharSet.add(char);
			}
			
			// There is duplicate characters
			if( wordCharSet.size != s.length ) {
				return false;
			}
			return true;
		});
	}
	
	//----------------------------------------------------
	// Word scorer - the heart of the system
	//----------------------------------------------------
	
	/**
	* The heart of the wordle solving system.
	* 
	* This require the current statistical model of "valid solutions", produced using the `charsetStatistics`
	* 
	* Along with the word to score. Additionally, a state object maybe provided, to help optimize and refine
	* the word selection processs.
	*
	* @param {Object} charStats, output from charsetStats 
	* @param {String} word to score 
	* @param {Object} state object (to refine score)
	* 
	* @return {Number} representing the word score (may have decimal places)
	**/
	scoreWord( word, charStats, state = null ) {

		//----------------------------------------------------
		// Use the ranking function overwrite
		//----------------------------------------------------
		
		if( this.rankingFunction != null ) {
			return this.rankingFunction(word, charStats, state);
		}

		//----------------------------------------------------
		// The default scoring function is below ....
		//----------------------------------------------------
		
		this.rankingFunction = require("../ranking-function/default");
		return this.rankingFunction(word, charStats, state);
	}
}

// export the class
module.exports = WordleSolvingAlgo;

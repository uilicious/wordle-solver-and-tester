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
	*/
	constructor( fullWordList = [], filteredWordList = null ) {
		// prepare the word list
		this.fullWordList = Object.freeze( Array.from(new Set(fullWordList)) );
		this.filteredWordList = (filteredWordList != null)? Object.freeze( Array.from(new Set(filteredWordList)) ) : this.fullWordList;
		this.uniqueWordList = this.filterForUniqueWords( this.fullWordList );
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
		const charStats = this.charsetStatistics(statsList);
		
		// sort the scored list, use unique words in first few rounds
		let scoredList = wordList.unique;
		
		// Use valid list from round 5 onwards
		// or when the unique list is drained 
		if( scoredList.length == 0 || state.round >= 5 ) {
			// This is for strict mode
			if( this.strict ) {
				scoredList = wordList.valid;
			} else {
				// for non strict mode, lets use the FULL list
				//
				// this has much higher success rate, as it can choose
				// words that are not in the strict list, 
				// when trying to drastically reduce guesses
				scoredList = wordList.full;
			}
		}
		
		// Use filtered list in last 2 round, or when its a gurantee "win"
		let finalStretch = false;
		if( wordList.filtered.length < state.roundLeft || state.roundLeft <= 1 ) {
			scoredList = wordList.filtered;
			finalStretch = true;
		}
		
		// Self refrence
		const self = this;
		
		// Score word sorting
		scoredList = scoredList.slice(0).sort(function(a,b) {
			// Get teh score
			let bScore = self.scoreWord( charStats, b, state, finalStretch );
			let aScore = self.scoreWord( charStats, a, state, finalStretch );
			
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
	* Analyse the given dictionary array, to get character statistics
	* This will return the required statistics model, to be used in guessing a word.
	* 
	* Which is provided in 3 major parts, using an object, which uses the character as a key, followed by its frequency as a number
	* 
	* - overall : Frequency of apperance of each character
	* - unique  : Frequency of apperance of each character per word (meaning, duplicates in 1 word is ignored)
	* - positional : An array of object, which provides the frequency of apperance unique to that word position
	* 
	* Note that because it is possible for the dataset to not have characters in the list / positional location,
	* you should assume any result without a key, means a freqency of 0
	* 
	* @param {Array<String>} dictArray - containg various words, of equal length
	* 
	* @return Object with the respective, overall / unique / positional stats
	**/
	charsetStatistics( dictArray ) {
		// Safety check
		if( dictArray == null || dictArray.length <= 0 ) {
			throw `Unexpected empty dictionary list, unable to perform charsetStatistics / guesses`;
		}
		
		// The overall stats, for each character
		let overallStats = {};
		
		// The overall stats, for each unique charcter 
		// (ignore duplicates in word)
		let overallUniqueStats = {};
		
		// The stats, for each character slot
		let positionalStats = [];
		
		// Lets initialize the positionalStats
		let wordLen = dictArray[0].length;
		for(let i=0; i<wordLen; ++i) {
			positionalStats[i] = {};
		}
		
		// Lets build the overall charset
		const overallCharset = new Set();
		
		// Lets iterate the full dictionary
		for( const word of dictArray ) {
			
			// Character set for the word
			const charSet = new Set();
			
			// For each character, populate the overall stats
			for( let i=0; i<wordLen; ++i ) {
				// Get the character
				const char = word.charAt(i);
				
				// Increment the overall stat
				 this._incrementObjectProperty( overallStats, char );
				
				// Populate the charset, for overall unique stats
				charSet.add( char );
				
				// Increment each positional stat
				 this._incrementObjectProperty( positionalStats[i], char );
			}
			
			// Populate the unique stats
			for( const char of charSet ) {
				// Increment the overall unique stat
				 this._incrementObjectProperty( overallUniqueStats, char );
				
				// Merge in to overall charset
				overallCharset.add(char);
			}
		}
		
		// Lets return the stats obj
		return {
			overall: overallStats,
			unique: overallUniqueStats,
			positional: positionalStats
		}
	}
	
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
	* the word selection processs. finalStretch is used to indicate a change in strategy - where the best answer should
	* be choosen, instead of choosing a word that gives the most "info"
	* 
	* @param {Object} charStats, output from charsetStats 
	* @param {String} word to score 
	* @param {Object} state object (to refine score)
	* 
	* @return {Number} representing the word score (may have decimal places)
	**/
	scoreWord( charStats, word, state = null, finalStretch = false ) {
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
	
	//----------------------------------------------------
	// misc helper functions used in the solving algo
	//----------------------------------------------------
	
	/**
	* Increment an object key, used at various stages of the counting process
	* @param {Object} obj 
	* @param {String} key 
	**/
	_incrementObjectProperty( obj, key ) {
		if( obj[key] > 0 ) {
			obj[key]++;
		} else {
			obj[key] = 1;
		}
	}
}

// export the class
module.exports = WordleSolvingAlgo;

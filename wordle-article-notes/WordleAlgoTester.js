/**
 * This is a Wordle algorithim tester used to facilitate testing, 
 * and scoring various implementation of the wordle tester
 */
class WordleAlgoTester {

	/**
	 * Initialize the tester, with the full word list
	 * 
	 * @param {Array<String>} fullWordList - used for the dictionary
	 * @param {int} maxRound - maximum number of tries
	 */
	constructor( fullWordList, testWordList = null, maxRound = 6 ) {
		this.fullWordList = Object.freeze( Array.from(new Set(fullWordList)) );
		this.testWordList = (testWordList != null)? Object.freeze( Array.from(new Set(testWordList)) ) : this.fullWordList;
		this.maxRound = maxRound;

		// The unique word list (only has unique chars)
		let uniqueWordList = [];

		// Lets generate the fullCharSet
		let fullCharSet = new Set();
		for(const word of fullWordList) {
			let wordCharSet = new Set();
			for(const char of word) {
				fullCharSet.add(char);
				wordCharSet.add(char);
			}
			if( wordCharSet.size == word.length ) {
				uniqueWordList.push(word);
			}
		}
		fullCharSet = new Set( Array.from(fullCharSet).sort() )
		this.fullCharSet = Object.freeze(fullCharSet);
		this.uniqueWordList = uniqueWordList;

		// and save the wordlength
		this.wordLength = fullWordList[0].length;
	}

	/**
	 * Configure if logging mode is enabled
	 * @param {Boolean} set to enable logging mode
	 */
	loggingMode(set = null) {
		if(set === true || set === false) {
			this.log = set;
		}
		return this.log == true;
	}

	/**
	 * Run the wordle solver function, against the given word,
	 * and return its score of 0 (fail) or 1 (1st try) to N (max tries)
	 * 
	 * @param {Function} func which is given the stateObj, and wordList obj
	 * @param {String} word to test against
	 * 
	 * @return {int} result score
	 */
	runWithWord( func, word ) {

		// The filtered word list
		let filteredWordList = this.testWordList.slice(0);
		let validWordList = this.fullWordList.slice(0);
		let uniqueWordList = this.uniqueWordList.slice(0);
		let wordLength = word.length;

		// Lets setup the initial state object
		const state = {
			// bad character set
			badCharSet : new Set(),

			// full char set
			fullCharSet : this.fullCharSet,

			// filtered charset (full - bad)
			validCharSet : new Set(this.fullCharSet),

			// confirmed / hinted charset
			goodCharSet : new Set(),

			// Word length
			wordLength : wordLength,

			// positional state
			pos: [],

			// guessed word history
			history: [],

			// current round
			round: 1,
			maxRound: this.maxRound,
			roundLeft: this.maxRound - 1
		};

		// And the wordlist
		const wordList = {
			filtered: filteredWordList,
			valid: validWordList,
			unique: uniqueWordList,
			full: this.fullWordList
		}

		// Lets populate each char pos, with a state obj
		for(let i=0; i<wordLength; ++i) {
			state.pos[i] = {
				hintSet : new Set(),
				foundChar : null
			};
		}

		// Lets iterate each try, till a match is found
		for(let round=1; round<=this.maxRound; ++round) {

			// Lets run the function to get the word
			state.round = round;
			state.roundLeft = state.maxRound - round;
			let guess = func( state, wordList );

			// if match is found, return now =)
			if( guess == word ) {
				// console.log("# Valid word match : "+word)		
				return round;
			}

			// if blank, fail
			if( guess == null || guess.length != wordLength ) {
				throw `Unexpected word guess : ${guess}`
			}

			// lets update the state, one character at a time
			for(let i=0; i<wordLength; ++i) {
				
				// the guessing char to check
				let guessChar = guess.charAt(i);

				// is a valid character ?
				let isValidChar = false;

				// lets handle positional logic
				if( word.charAt(i) == guessChar ) {
					isValidChar = true;
					state.pos[i].foundChar = guessChar;
				} else if( word.indexOf(guessChar) >= 0 ) {
					isValidChar = true;
					state.pos[i].hintSet.add(guessChar);
				}
				
				// lets handle overall logic
				if( isValidChar ) {
					state.goodCharSet.add( guessChar );
				} else {
					state.badCharSet.add( guessChar );
					state.validCharSet.delete( guessChar );
				}
			}

			// Lets update guesses history
			state.history.push( guess );

			// and the word list
			filteredWordList = filteredWordList.filter(function(s) {
				// filter out invalid words (hard mode)
				for(const bad of state.badCharSet) {
					if(s.includes(bad)) {
						return false;
					}
				}
				// filter out words with wrong hint locations
				for(let i=0; i<wordLength; ++i) {
					let sChar = s.charAt(i);
					if(state.pos[i].foundChar && sChar != state.pos[i].foundChar) {
						return false;
					}
					for(const bad of state.pos[i].hintSet) {
						if(sChar == bad) {
							return false;
						}
					}
				}
				// filter out words WITHOUT the hinted chars
				for(const good of state.goodCharSet) {
					if(!s.includes(good)) {
						return false;
					}
				}

				// all checks pass, return true
				return true;
			});
			validWordList = validWordList.filter(function(s) {
				// filter out invalid words (hard mode)
				for(const bad of state.badCharSet) {
					if(s.includes(bad)) {
						return false;
					}
				}
				// all checks pass, return true
				return true;
			});
			uniqueWordList = uniqueWordList.filter(function(s) {
				// filter out invalid words (hard mode)
				for(const bad of state.badCharSet) {
					if(s.includes(bad)) {
						return false;
					}
				}
				// filter out unique words (only unused chars)
				for(const bad of state.goodCharSet) {
					if(s.includes(bad)) {
						return false;
					}
				}
				// all checks pass, return true
				return true;
			});

			// update state
			wordList.filtered = filteredWordList;
			wordList.valid = validWordList;
			wordList.unique = uniqueWordList;
		}
		
		// log if enabled
		if( this.log ) {
			console.log("### Failed word match : "+word);
			console.log("### Final state ")
			console.log(state)
		}

		// no match found, return 0
		return 0;
	}

	/**
	 * Test against a word list, and return the formular stats
	 * 
	 * @param {Function} func which is given the stateObj, and wordList obj
	 * @param {Array<String>} wordList which is tested against
	 * 
	 * @return {Object} consisting of, pass/fail rate, score count, and avgScore
	 */
	runWithWordList( func, wordList ) {
		// The stats object to return
		const wordListLength = wordList.length;
		const stat = {
			// pass / fail tracker
			pass: 0,
			fail: 0,
			scoreCount: {},
			avgScore: 0,

			// Test size for reference
			testSize: wordListLength
		};

		// total passing score, to track
		let totalScore = 0;

		// lets iterate the word list
		for(let i=0; i<wordListLength; ++i) {
			const word = wordList[i];
			const score = this.runWithWord(func, word);

			// and handle score counting
			if( score > 0 ) {
				stat.pass++;
				if( stat.scoreCount[score] > 0 ) {
					stat.scoreCount[score]++;
				} else {
					stat.scoreCount[score] = 1;
				}
				totalScore += score;
			} else {
				stat.fail++;
			}

			// Current test size
			stat.testSize = i+1;
			// Passing %
			stat.passRatePercentage = ( stat.pass / stat.testSize )*100

			// Incremental logging
			if( this.log ) {
				if( i==9 || (i > 0 && i%25 == 24) ) {
					console.log(`>>-- (running ${i+1} out of ${wordListLength}) `)
					console.log(stat)
				}
			}
		}

		// Final logging
		if( this.log ) {
			console.log(`>>-- (final run for ${wordListLength}) `)
			console.log(stat)
		}

		// lets update the avg score
		stat.avgScore = totalScore / stat.pass;

		// and return the stat obj
		return stat;
	}

	/**
	 * Test against the full word list, and return the formular stats
	 * 
	 * @param {Function} func which is given the stateObj, and wordList obj
	 * 
	 * @return {Object} consisting of, pass/fail rate, score count, and avgScore
	 */
	runWithTestWordList(func, testSize = 100) {
		if( testSize <= -1 ) {
			return this.runWithWordList(func, this.testWordList);
		} else if( testSize*4 <= this.testWordList.length ) {
			// we intentionally avoid using the front of wordlist, 
			// due to the confirmation bias of the filtered list
			let base = Math.floor(this.testWordList.length/2)+testSize;
			return this.runWithWordList(func, this.testWordList.slice(base,base+testSize));
		} else {
			return this.runWithWordList(func, this.testWordList.slice(0,testSize));
		}
	}
}

module.exports = WordleAlgoTester;
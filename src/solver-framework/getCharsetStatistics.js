
/**
* Increment an object key, used at various stages of the counting process.
* Required because the following does not work
*
* ```
* let obj = {};
* obj[key]++;
* console.log( obj[key] ); // Returns NaN
* ```
* @param {Object} obj 
* @param {String} key 
**/
function _incrementObjectProperty( obj, key ) {
	if( obj[key] > 0 ) {
		obj[key]++;
	} else {
		obj[key] = 1;
	}
}

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
function getCharsetStatistics( dictArray ) {
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
			_incrementObjectProperty( overallStats, char );
			
			// Populate the charset, for overall unique stats
			charSet.add( char );
			
			// Increment each positional stat
			_incrementObjectProperty( positionalStats[i], char );
		}
		
		// Populate the unique stats
		for( const char of charSet ) {
			// Increment the overall unique stat
			_incrementObjectProperty( overallUniqueStats, char );
			
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

// Export the function
module.exports = getCharsetStatistics;
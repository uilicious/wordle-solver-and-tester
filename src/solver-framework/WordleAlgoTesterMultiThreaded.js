const wordList = require("../word-list/original-wordle-list");
const { Worker } = require('worker_threads')
const scriptDir = __dirname;

/**
 * This is a Wordle algorithim tester used to facilitate testing, 
 * and scoring various implementation of the wordle tester. 
 * 
 * Only support original wordle list (for now)
 */
class WordleAlgoTesterMultiThreaded {

	/**
	 * Initialize the tester, with the `rankingFunctionName` against standard wordle
	 * 
	 * @param {String} rankingFunctionName
	 */
	constructor( rankingFunctionName ) {
		this.rankingFunctionName = rankingFunctionName;
	}

	/**
	 * Run the wordle tester across a 100 threads, this can be optimized to be tagged
	 * against the system vCPU count, but i was lazy.
	 * 
	 * 100 should be enough for even some of the biggest system (except maybe 128 vCPU nodes)
	 * but low enough to not kill even a quad core
	 */
	async runScoring() {
		// How much each worker should handle
		const sectionLen = Math.round(wordList.answer.length / 100);
		const rankingFunctionName = this.rankingFunctionName;

		// The rolling count and limit
		let rollingCount = 0;
		let totalLimit = wordList.answer.length;

		// Array to hold all the workers, and response promise
		let workerArr = [];
		let promiseArr = [];

		// Lets kick off each worker
		for(let i=0; i<=100; ++i) {
			let thread = new Worker( scriptDir+'/WordleAlgoTesterWorker.js');

			console.log(`# Starting thread ${i}, for ${i*sectionLen} - ${(i+1)*sectionLen}`)

			let resPromise = new Promise((good,bad) => {
				thread.on('message', (result) => {
					good(result);
				});
				thread.on("error", (error) => {
					bad(error);
				})

				thread.postMessage({
					rankingFunctionName: rankingFunctionName,
					offset: i*sectionLen,
					count: sectionLen
				})
			});

			workerArr[i] = thread;
			promiseArr[i] = resPromise;
		}

		// Await all the response
		let promiseRes = await Promise.all(promiseArr);

		// Join them together
		let pass = 0;
		let fail = 0;
		let testSize = 0;
		let totalScore = 0;
		let scoreCount = {
			'1':0,
			'2':0,
			'3':0,
			'4':0,
			'5':0,
			'6':0,
		}

		for(let i=0; i<promiseRes.length; ++i) {
			let resObj = promiseRes[i];
			pass += resObj.pass;
			fail += resObj.fail;
			testSize += resObj.testSize;
			for(let a=0; a<=6; ++a) {
				if( resObj.scoreCount[a] ) {
					scoreCount[a] += resObj.scoreCount[a];
					totalScore += resObj.scoreCount[a]*a;
				}
			}
		}

		// The final return avg
		let ret = {
			pass: pass,
			fail: fail,
			scoreCount: scoreCount,
			avgScore: totalScore/pass,
			testSize: testSize,
			passRatePercentage: (pass / testSize) * 100
		}
		return ret;
		// console.log(promiseRes);
	}
}
module.exports = WordleAlgoTesterMultiThreaded;
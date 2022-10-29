# wordle-solver-and-tester

Wordle solver, and tester. The following code is used on the basis for the following blog post

- https://uilicious.com/blog/automate-wordle-via-uilicious/
- https://uilicious.com/blog/how-saine-mathematically-beats-crane-as-one-of-the-best-wordle-starting-word/

And a geekcamp 2022 titled "Using math, statistics, & javascript to automate the solving of Wordle", where you can find the slides here

- https://docs.google.com/presentation/d/1y0mHKkLHxKlv_0mV-tKw1ziZrj9m3j7gtzlIjyyzbnE/edit?usp=sharing
- Video Recording Link: (TBD)

# Getting useful stats

You can run the various following commands, to get useful information, on building your wordle solver

```bash
# Statistics of characters used in the first word
# Note the result is in RAW JSON, which is hard to read
nodejs ./run/01-firstWordCharacterStatistics.js 

# Statistics of starting words
# This provides an easier to read breakdown numbers for a given starting word
nodejs ./run/02-startingWordMatchStatistics.js SAINE
```

# Customizing and running the ranking function

You can find the various ranking function inside `src/ranking-function`.
The file `v4-matchedPositionalScore.js` is currently the reference function with a 100% pass rate.

However if you are starting out, it might be easier to read `v1-simplePositionalScore.js`

To run and debug each ranking function, you can "score it" using the single threaded runner

```bash
nodejs ./run/11-scoreRankingFunction-singleThread.js  v4-matchedPositionalScore
```

This would give you useful debugging information on any failed word match, including the dump of the game state at the end of it.

However, this function takes a very long time to execute (~20 minutes), so if you want to use the multi-threaded function, you can use the following instead

```bash
nodejs ./run/21-scoreRankingFunction-multiThread.js  v4-matchedPositionalScore
```

The downside however, the logs can come in out of order, due to the multiple threads involved. So =|

# Exporting your ranking function, to Uilicious Snippet

Once you have a working formular, you can run it live against an actual working web wordle

```
nodejs ./run/31-runUiliciousSnippet.js  v4-matchedPositionalScore
```

This will return a URL with the snippet, like : https://snippet.uilicious.com/test/public/L6c3ry6R3EmnGz25KLkKku

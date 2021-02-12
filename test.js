import {readFileSync} from 'fs';
import grapheme_iterator from './index.js';

const testData = readFileSync('GraphemeBreakTest.txt', 'ASCII')
      .split('\n')
      .filter(line =>
        line != null && line.length > 0 && !line.startsWith('#'))
      .map(line => line.split('#')[0])
      .map(line => {
        const codePoints = line.split(/\s*[×÷]\s*/).filter(x => !!x.length).map(c => parseInt(c, 16));
        const input = codePoints.map(x => String.fromCodePoint(x)).join('');

        const expected = line.split(/\s*÷\s*/).filter(x => !!x.length).map(sequence => {
          const codePoints = sequence.split(/\s*×\s*/).filter(x => !!x.length).map(c => parseInt(c, 16));

          return codePoints.map(x => String.fromCodePoint(x)).join('');
        });

        return { input, expected };
      });

export const countGraphemes = str => {
  let count = 0;
  for (const each of grapheme_iterator(str)) count++;
  return count;
}


const n_tests = testData.length;
const valuefails = [];
const countfails = [];

for (let i in testData) {
  const {input, expected} = testData[i];
  let [...results] = grapheme_iterator(input)
  const count = countGraphemes(input);
  if (count !== expected.length)
    countfails.push({casenum: i, result: count, expected: expected.length});
  for (let j in results.length > expected.length ? results : expected) {
    if(results[j] !== expected[j]) {
      valuefails.push({casenum: i, grapheme: j, result: results[j], expected: expected[j]});
      break;
    }
  }
}

if (valuefails.length !== 0)
  for (const {casenum, grapheme, expected, result} of valuefails.slice(0,5))
    console.error (`iterateGraphemes: In case ${casenum}: expected`, expected, `at grapheme ${grapheme} but got`, result, `instead.`);
if (countfails.length !== 0)
  for (const {casenum, grapheme, expected, result} of countfails.slice(0,5))
    console.error (`countGraphemes: In case ${casenum}: expected`, expected, `graphemes but got`, result, `instead.`);

if (valuefails.length === 0 && countfails.length === 0) {
  console.log(`All ${n_tests} tests passed.`)
  process.exit(0);
} else {
  console.error(`iterateGraphemes: ${valuefails.length} of ${n_tests} failed.`)
  console.error(`countGraphemes: ${countfails.length} of ${n_tests} failed.`)
  process.exit(1);
}

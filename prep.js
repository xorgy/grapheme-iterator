import {readFileSync, writeFileSync} from 'fs';

const segprops_a = readFileSync("GraphemeBreakProperty.txt", "ASCII")
      .split('\n')
      .filter(x => !!x && !/^#/.test(x))
      .map(s => s.match(/^([0-9A-F]+)(?:..([0-9A-F]+))?\s+;\s([a-zA-Z]*).*$/))
      .map(([_,a,b,x]) => [parseInt(a, 16), b && parseInt(b, 16), x])
      .reduce((acc, [a, b, x]) => {
        if(!acc[x]) acc[x] = [];
        acc[x].push([a, b ? b - a : 0]);
        return acc;
      }, {});

const segprops_b = {};

const fnil = (f, d) => (x, ...args) => x ? f(x, ...args) : f(d, ...args);

const update = (m, k, f, ...addargs) => {
  m.set(k, f(m.get(k), ...addargs))
  return m;
}

for (const [k, vs] of Object.entries(segprops_a)) {
  const lemap = vs.reduce(
    (acc, [a, o]) => update(acc, o, fnil(x => [...x, a], [])),
    new Map());

  segprops_b[k] = [...lemap.entries()];
};

const segprops_c = [];

const propenums = {
  Prepend: 1,
  CR: 2,
  LF: 3,
  Control: 4,
  Extend: 5,
  Regional: 6,
  SpacingMark: 7,
  L: 8,
  V: 9,
  T: 10,
  LV: 11,
  LVT: 12,
  ZWJ: 13
};

for (const [k, v] of Object.entries(segprops_b)) {
  segprops_c.push([propenums[k], v]);
}

const segprops_d = [];

{
  for (const [p, mr] of segprops_c)
    for (const [s, bs] of mr)
      segprops_d.push([p, s, bs])
}

const segprops_e = [];

{
  for (const [p, s, bs] of segprops_d) {
    segprops_e.push([
      p, s, bs,
      bs.reduce((a, x) => Math.min(a, x)),
      bs.reduce((a, x) => Math.max(a, x)) + s
    ]);
  }
}

let segprops_f = [...segprops_e];

let keepgoing = 0;
do {
  let oldseg = [...segprops_f];
  segprops_f = [];
  keepgoing = 0;
  for (const [p, s, bs, min, max] of oldseg) {
    if (bs.length > 68) {
      keepgoing++;
      const bsa = bs.slice(0, (bs.length / 2) | 0);
      const bsb = bs.slice((bs.length / 2) | 0);
      segprops_f.push([
        p, s, bsa,
        bsa.reduce((a, x) => Math.min(a, x)),
        bsa.reduce((a, x) => Math.max(a, x)) + s
      ]);
      segprops_f.push([
        p, s, bsb,
        bsb.reduce((a, x) => Math.min(a, x)),
        bsb.reduce((a, x) => Math.max(a, x)) + s
      ]);
    } else {
      segprops_f.push([p, s, bs, min, max]);
    }
  }
} while (keepgoing);

writeFileSync(
  "GraphemeBreakProperty.js",
  `// Generated by prep.js
const GraphemeBreakProperty = JSON.parse(${(JSON.stringify(JSON.stringify(segprops_f)))});
export default GraphemeBreakProperty;
`);

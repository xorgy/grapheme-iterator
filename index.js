import {classify} from './GraphemeBreakProperty.js'

const Any = 0,
      Prepend = 1,
      CR = 2,
      LF = 3,
      Control = 4,
      Extend = 5,
      Regional = 6,
      SpacingMark = 7,
      L = 8,
      V = 9,
      T = 10,
      LV = 11,
      LVT = 12,
      ZWJ = 13;

const grapheme_iterator = s => ({
  *[Symbol.iterator]() {
    let pp = -1; // GB1
    let egc = "";
    let regionalstack = 0;
    for (const cs of s) {
      const cc = cs.codePointAt(0);
      const cp = classify(cc);

      if (cp === Extend || cp === ZWJ
         || cp == SpacingMark /* GB9a */) {
        egc += cs; // GB9
      } else
        switch (pp) {
        case ZWJ:
        case Prepend: // GB9b
        case -1: // GB1
          egc += cs;
          break;
        case Extend:
          if (cp === Extend) {
            egc += cs;
          } else {
            yield egc;
            egc = cs;
          }
          break;
        case CR:
          if (cp === LF) {
            egc += cs; // GB3
          } else {
            yield egc;
            egc = cs; // GB4
          }
          break;
        case L: // GB6
          if (cp === L
              || cp === V
              || cp === LV
              || cp === LVT) {
            egc += cs;
          } else {
            yield egc;
            egc = cs;
          }
          break;
        case LV: case V: // GB7
          if (cp === V || cp === T) {
            egc += cs;
          } else {
            yield egc;
            egc = cs;
          }
          break;
        case LVT: case T: // GB8
          if (cp === T) {
            egc += cs;
          } else {
            yield egc;
            egc = cs;
          }
          break;
        case Regional: // GB12
          if(!(regionalstack % 2)) {
            egc += cs;
            break;
          }
//        case Any: // GB999
//        case Control: // GB4
//        case LF: // GB4
        default:
          yield egc;
          egc = cs;
        }
      regionalstack = cp === Regional ? regionalstack + 1 : 0;
      pp = cp;
    }
    if (egc !== "") {
      yield egc; // GB2
    }
  }
});

export default grapheme_iterator;

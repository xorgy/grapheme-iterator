declare function grapheme_iterator(s: string): Iterable<string>;

declare module "grapheme-iterator" {
    export = grapheme_iterator;
}

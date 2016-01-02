/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../app.common.d.ts" />
declare module Blog.ArticleList {
    /**
     * The default list-strategy that chronologically orders all articles,
     * newest to oldest.
     */
    class ListAllStrategy extends Common.AListStrategy {
        type: string;
        reverse: boolean;
        itemsList(source: Common.MetaArticle[]): Common.MetaArticle[];
        /**
         * Override to signal that this strategy can handle the 'all' list-type.
         */
        static canHandle(listType: string): boolean;
    }
    /**
     * Another example strategy that lists all meta articles which have
     * their last modification in the matched year.
     */
    class ByYearStrategy extends Common.AListStrategy {
        /**
         * Returns all articles within the given year (the year was supplied
         * here in the constructor as the listType-argument).
         */
        itemsList(source: Common.MetaArticle[]): Common.MetaArticle[];
        static canHandle(listType: string): boolean;
    }
    /**
     * A simple search strategy that takes a term and scores them against
     * all articles' properties and selects the highest score per article.
     * It returns then a descending list of them.
     */
    class SimpleSearchStrategy extends Common.AListStrategy {
        itemsList(source: Common.MetaArticle[]): Common.MetaArticle[];
        static canHandle(listType: string): boolean;
        /**
         * Taken from https://github.com/joshaven/string_score/blob/master/string_score.js
         * and modified to be a static function instead.
         */
        private static score(str, word, fuzziness?);
        /**
         * Taken from https://github.com/zdyn/jaro-winkler-js (MIT License)
         *
         * The Jaro Winkler string distance allows for more fuzzy searches.
         */
        private static score_JaroWinkler(string1, string2);
    }
}

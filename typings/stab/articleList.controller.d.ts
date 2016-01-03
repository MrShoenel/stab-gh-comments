/// <reference path="../angularjs/angular.d.ts" />
/// <reference path="../angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./app.common.d.ts" />
/// <reference path="listStrategies.d.ts" />
/// <reference path="./content.service.d.ts" />
declare module Blog.ArticleList {
    class ArticleListController {
        private ContentService;
        private $stateParams;
        private $scope;
        private $location;
        private CONFIG;
        currentPage: Common.Page<Common.MetaArticle>;
        listType: string;
        sortReverse: boolean;
        pageIndex: number;
        inject: Common.IKVStore<string>;
        searchTerm: string;
        itemsPerPage: number;
        /**
         * Used by the directive's template.
         */
        isSearchList: boolean;
        /**
             * Used as dependecy-injected factory.
             */
        static inlineAnnotatedConstructor: any[];
        constructor(ContentService: Blog.Service.ContentService, $stateParams: angular.ui.IStateParamsService, $scope: angular.IScope, $location: angular.ILocationService, CONFIG: Common.Constants);
        /**
         * Public getter for isSearch.
         */
        isSearch: boolean;
        /**
         * Parses a string of the form "a=b;c=d;.." into a KVStore<string>.
         * This is useful when multiple values were supposed to be injected.
         */
        private static parseInject(inject);
        private advanceToPage();
        search(): void;
        gotoPrevPage(): void;
        gotoNextPage(): void;
        private getStrategy(listType?, sortReverse?, throwIfNone?);
    }
}

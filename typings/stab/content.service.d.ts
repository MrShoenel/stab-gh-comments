/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../article/article.module.d.ts" />
/// <reference path="../../app.common.d.ts" />
declare module Blog.Service {
    /**
     * The service that provides data to controllers.
     */
    class ContentService {
        private $http;
        private $q;
        private $cacheFactoryService;
        private $sce;
        private contentJson;
        private metaCache;
        private cache;
        private fragmentCache;
        /**
         * Used as dependecy-injected factory.
         */
        static inlineAnnotatedConstructor: any[];
        constructor($http: angular.IHttpService, $q: angular.IQService, $cacheFactoryService: angular.ICacheFactoryService, $sce: angular.ISCEService);
        /**
         * Used to initialize the meta-content. That means it will load
         * the content.json which gives us information about all the
         * available content.
         */
        initializeMetaContent(): angular.IPromise<Common.ContentJSON>;
        /**
         * Function that loads all the user's dependencies.
         */
        loadMyDeps($ocLazyLoad: oc.ILazyLoad): angular.IPromise<void>;
        /**
         * Gets one Article by its URL-name. Uses caching internally.
         */
        articleByUrlName(urlName: string): angular.IPromise<Common.Article>;
        /**
         * This function returns all MetaArticles. The optional argument filter allows
         * to return a filtered subset of all articles.
         *
         * @param filter if the filter is a 2Tuple, then its t1 is used for specifying
         *  the meta tag to compare with and its t2 is used for the comparison. So if
         *  you were to provide <"displayat", "topnav"> then only those articles which
         *  have the meta-tag "displayat" with the value "topnav" would be returned.
         *  If the provided filter is a function, then it will be given each MetaArticle
         *  and must return true or false.
         */
        getMetaArticles(filter?: Common.I2Tuple<string, string> | ((metaArticle: Common.MetaArticle) => boolean)): angular.IPromise<Common.MetaArticle[]>;
        /**
         * Returns all fragments. There are no parameters to this function so we
         * can implement it as property. Ensures that all returned fragments
         * have been cached properly.
         */
        fragments: angular.IPromise<Common.MetaFragment[]>;
        /**
         * Returns a single fragment by ID. Fragments will be put to the local
         * cache before they are returned. Subsequent requests to the same ID
         * will returned the cached fragment.
         */
        getFragmentByID(id: string): angular.IPromise<Common.Fragment>;
        /**
         * This function picks up all ContentTransformers and applies them to
         * the given article.
         */
        private static preprocessArticle(article);
    }
}

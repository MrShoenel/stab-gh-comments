/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.d.ts" />
/// <reference path="../service/content.service.d.ts" />
declare module Blog.Article {
    class ArticleController {
        private ContentService;
        private Config;
        useBindHtmlCompile: boolean;
        private article;
        articleHtml: any;
        /**
             * Used as dependecy-injected factory.
             */
        static inlineAnnotatedConstructor: any[];
        constructor(ContentService: Blog.Service.ContentService, Config: Common.Constants);
    }
}

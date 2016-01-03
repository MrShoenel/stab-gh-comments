/// <reference path="./app.common.d.ts" />

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

/// <reference path="../angularjs/angular.d.ts" />
/// <reference path="./app.common.d.ts" />
/**
 * This is the main module of the blog.
 */
declare module Blog.Article {
    class Article implements Common.IModuleFactory {
        createModule(): angular.IModule;
    }
    /**
     * This class will transform internal links which use the notation
     * <a stab-ref="<article-url-name>">..</a> into proper links that
     * can be used to link within articles.
     */
    class StabArticleLinkContentTransformer implements Common.ContentTransformer {
        transform(original: string): string;
    }
    var module: angular.IModule;
}

/// <reference path="app.common.d.ts" />
/// <reference path="app.config.d.ts" />
/**
 * This is the main module of the blog.
 */
declare module Blog {
    class BlogApp implements Common.IModuleFactory {
        createModule(): angular.IModule;
    }
    var module: angular.IModule;
}

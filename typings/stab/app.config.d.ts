/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="app.common.d.ts" />
/// <reference path="app/service/content.service.d.ts" />
/// <reference path="app/article/article.controller.d.ts" />
/// <reference path="app/ui.router.stateData/ui-router-stateData.module.d.ts" />
declare module Blog {
    function configure(module: angular.IModule): angular.IModule;
    /**
     * Decodes a URL-encoded string, even if it has been encoded
     * multiple times.
     */
    function realDecodeURI(str: string): string;
}

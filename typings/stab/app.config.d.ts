/// <reference path="../angularjs/angular.d.ts" />
/// <reference path="../oclazyload/oclazyload.d.ts" />
/// <reference path="../angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="app.common.d.ts" />
/// <reference path="./content.service.d.ts" />
/// <reference path="./article.controller.d.ts" />
/// <reference path="./ui-router-stateData.module.d.ts" />
declare module Blog {
    function configure(module: angular.IModule): angular.IModule;
    /**
     * Decodes a URL-encoded string, even if it has been encoded
     * multiple times.
     */
    function realDecodeURI(str: string): string;
}

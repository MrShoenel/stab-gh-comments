/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/requirejs/require.d.ts" />
/// <reference path="../../../typings/oclazyload/oclazyload.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../app.common.d.ts" />
/// <reference path="../../app.config.d.ts" />
/**
 * This module is based on ideas for angular-ui-router-title. It
 * provides arbitrary and hierarchical state-data. This module is
 * an enhanced replacement for angular-ui-router-title.
 */
declare module Ui.Router.StateData {
    class UiRouterStateData implements Common.IModuleFactory {
        createModule(): angular.IModule;
    }
    /**
     * Helper class to encapsulate a state's data (the data-property)
     * in a nicer way. The ui-router-stateData module will take certain
     * actions if a state's data-property is an instance of this class
     * and has certain values.
     * The purpose of this class is to tame the <any>-nature of the data-
     * property and to bring in some conformity.
     */
    class ExtendedStateData {
        private data;
        constructor(obj?: Object);
        set(key: string, value: any): ExtendedStateData;
        get<T>(key: string, defaultIfEmpty?: any): T;
        private static prop_usesLocationSearch;
        /**
         * Getter/setter depending on if an argument was supplied
         */
        usesLocationSearch(use?: boolean): ExtendedStateData | boolean;
    }
    var module: angular.IModule;
}

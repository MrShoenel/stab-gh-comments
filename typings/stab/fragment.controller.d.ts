/// <reference path="../angularjs/angular.d.ts" />
/// <reference path="../angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="./content.service.d.ts" />
declare module Blog {
    class FragmentController {
        private $scope;
        private ContentService;
        trustedValue: any;
        /**
             * Used as dependecy-injected factory.
             */
        static inlineAnnotatedConstructor: any[];
        constructor($scope: angular.IScope, ContentService: Blog.Service.ContentService);
    }
}

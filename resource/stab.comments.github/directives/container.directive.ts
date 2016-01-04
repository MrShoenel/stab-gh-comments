/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../controllers/containerDirective.controller.ts" />

module Blog.Article.Comments {
	export var StabGithubCommentsContainerDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			replace: true,
			restrict: 'E',

			scope: {
				issueUrl: '@'
			},

			controllerAs: 'commentVm',
			controller: 'StabGithubCommentsContainerDirectiveController',

			template: (scope: StabGithubCommentsContainerDirectiveControllerScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => {
				var __inline__template = 'container.template.html';
				return __inline__template;
			}
		};
	};

	StabGithubCommentsContainerDirective.$inject = [];
	angular.module('blogapp.article.stab-gh-comments').directive('stabGithubCommentsContainer', StabGithubCommentsContainerDirective);

	/**
	 * This interface describes the controller which is accessible within the
	 * directive and scope.
	 */
	export interface StabGithubCommentsContainerDirectiveControllerScope extends angular.IScope {
		commentVm: StabGithubCommentsContainerDirectiveController;
		issueUrl: string;
	};
};

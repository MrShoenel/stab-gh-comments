/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../services/authorization.service.ts" />
/// <reference path="../services/comments.service.ts" />
/// <reference path="../services/user.service.ts" />
/// <reference path="./container.directive.ts" />

module Blog.Article.Comments {
	export var StabGithubCommentsCreatePostDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			replace: true,
			restrict: 'E',

			controllerAs: 'createPostVm',
			controller: 'StabGithubCommentsCreatePostDirectiveController',

			template: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => {
				var __inline__template = 'createPost.template.html';
				return __inline__template;
			}
		};
	};

	StabGithubCommentsCreatePostDirective.$inject = [];
	angular.module('blogapp.article.stab-gh-comments').directive('stabGithubCommentsCreatePost', StabGithubCommentsCreatePostDirective);

	/**
	 * We extend it because we inherit it from the parent. It contains
	 * the parent directive's VM as well.
	 */
	export interface StabGithubCommentsCreatePostDirectiveControllerScope extends StabGithubCommentsContainerDirectiveControllerScope {
	};
};

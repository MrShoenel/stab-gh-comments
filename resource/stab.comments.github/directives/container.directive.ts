/// <reference path="../../../typings/angularjs/angular.d.ts" />

module Blog.Article.Comments {
	export var ContainerDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			replace: true,
			restrict: 'E',
			template: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => {
				var __inline__template = 'container.template.html';
				return __inline__template;
			}
		};
	};

	ContainerDirective.$inject = [];
	angular.module('blogapp.article.stab-gh-comments').directive('stabGithubCommentsContainer', ContainerDirective);
};

/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../services/authorization.service.ts" />

module Blog.Article.Comments {
	export var CreatePostDirective: angular.IDirectiveFactory = (): angular.IDirective => {
		return {
			replace: true,
			restrict: 'E',

			controllerAs: 'createPostVm',
			controller: ['StabGithubCommentsAuthorizationService', (authService: StabGithubCommentsAuthorizationService) => {
				var ctrl = {
					isAuthorized: false,
					isWaitingForAuthorization: false,
					tryAuthorize: (): void => {
						ctrl.isWaitingForAuthorization = true;
						authService.authorize()
							.then(isAuthorized => ctrl.isAuthorized = isAuthorized)
							.finally(() => ctrl.isWaitingForAuthorization = false);
					}
				};

				ctrl.isWaitingForAuthorization = true;
				authService.isUserAuthorized
					.then(isAuthorized => ctrl.isAuthorized = isAuthorized)
					.finally(() => ctrl.isWaitingForAuthorization = false);

				return ctrl;
			}],

			template: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => {
				var __inline__template = 'createPost.template.html';
				return __inline__template;
			}
		};
	};

	CreatePostDirective.$inject = [];
	angular.module('blogapp.article.stab-gh-comments').directive('stabGithubCommentsCreatePost', CreatePostDirective);
};

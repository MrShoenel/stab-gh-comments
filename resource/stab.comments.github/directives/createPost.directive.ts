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
			/*controller: ['StabGithubCommentsAuthorizationService', 'StabGithubCommentsService', 'StabGithubCommentsUserService', (authService: StabGithubCommentsAuthorizationService, commentService: StabGithubCommentsService, userService: StabGithubCommentsUserService) => {
				var ___________dummy_id: Common.GithubComment;
				var ctrl = {
					isAuthorized: false,
					isWaitingForAuthorization: false,
					authenticatedUser: <Common.GithubCommenter>null,

					tryAuthorize: (): void => {
						ctrl.isWaitingForAuthorization = true;
						authService.accessTokenUsingExistingAuthorizationOrAuthorize
							.then(isAuthorized => ctrl.isAuthorized = true)
							.finally(() => ctrl.isWaitingForAuthorization = false);
					},

					createComment: (): void => {
						commentService.createComment('/MrShoenel/stab-gh-comments/issues/1', 'A test comment').then(optComment => ___________dummy_id = optComment.get);
					},

					updateComment: (): void => {
						commentService.patchComment('/MrShoenel/stab-gh-comments/issues/1', 'A patched test', ___________dummy_id);
					},

					deleteComment: (): void => {
						commentService.deleteComment('/MrShoenel/stab-gh-comments/issues/1', ___________dummy_id);
					}
				};

				//////
				userService.authenticatedUser.then(optUser => ctrl.authenticatedUser = optUser.get);
				//////

				ctrl.isWaitingForAuthorization = true;
				authService.isUserAuthorized
					.then(isAuthorized => ctrl.isAuthorized = isAuthorized)
					.finally(() => ctrl.isWaitingForAuthorization = false);

				return ctrl;
			}],*/

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

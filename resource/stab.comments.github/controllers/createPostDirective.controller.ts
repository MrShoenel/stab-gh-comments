/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../stab.common.ts" />
/// <reference path="../services/authorization.service.ts" />
/// <reference path="../services/comments.service.ts" />
/// <reference path="../services/user.service.ts" />
/// <reference path="../directives/createPost.directive.ts" />

module Blog.Article.Comments {
	export class StabGithubCommentsCreatePostDirectiveController {

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$scope', 'StabGithubCommentsAuthorizationService', 'StabGithubCommentsService', 'StabGithubCommentsUserService', StabGithubCommentsCreatePostDirectiveController];

		public constructor(private $scope: StabGithubCommentsCreatePostDirectiveControllerScope, private authService: StabGithubCommentsAuthorizationService, private commentsService: StabGithubCommentsService, private userService: StabGithubCommentsUserService) {
		};
	};

	angular.module('blogapp.article.stab-gh-comments').controller('StabGithubCommentsCreatePostDirectiveController', StabGithubCommentsCreatePostDirectiveController.inlineAnnotatedConstructor);
};

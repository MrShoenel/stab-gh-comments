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
		public static inlineAnnotatedConstructor: any[] = ['$scope', '$q', 'StabGithubCommentsAuthorizationService', 'StabGithubCommentsService', 'StabGithubCommentsUserService', StabGithubCommentsCreatePostDirectiveController];

		public constructor(private $scope: StabGithubCommentsCreatePostDirectiveControllerScope, private $q: angular.IQService, private authService: StabGithubCommentsAuthorizationService, private commentService: StabGithubCommentsService, private userService: StabGithubCommentsUserService) {
		};

		/**
		 * Posts a new comment.
		 */
		public postComment(body: string): angular.IPromise<any> {
			if (!body || (body + '').trim() === '') {
				alert('Your comment must not be empty.');
				return this.$q.when();
			}

			return this.commentService.createComment(this.$scope.commentVm.issueUrl, body);
		};
	};

	angular.module('blogapp.article.stab-gh-comments').controller('StabGithubCommentsCreatePostDirectiveController', StabGithubCommentsCreatePostDirectiveController.inlineAnnotatedConstructor);
};

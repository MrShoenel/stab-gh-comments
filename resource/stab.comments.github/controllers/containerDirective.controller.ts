/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../stab.common.ts" />
/// <reference path="../services/authorization.service.ts" />
/// <reference path="../services/comments.service.ts" />
/// <reference path="../directives/container.directive.ts" />

module Blog.Article.Comments {
	export class StabGithubCommentsContainerDirectiveController {

		// VM properties:
		public isAuthorized: boolean = false;
		public isWaitingForAuthorization: boolean = false;
		public authenticatedUser: Common.GithubCommenter = null;

		private _issueUrl: string;

		public get issueUrl(): string {
			return this._issueUrl;
		};

		public comments: Common.GithubComment[];

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$scope', '$q', 'StabGithubCommentsService', 'StabGithubCommentsAuthorizationService', 'StabGithubCommentsUserService', StabGithubCommentsContainerDirectiveController];

		public constructor(private $scope: StabGithubCommentsContainerDirectiveControllerScope, private $q: angular.IQService, private commentService: StabGithubCommentsService, private authService: StabGithubCommentsAuthorizationService, private userService: StabGithubCommentsUserService) {
			this._issueUrl = $scope.issueUrl;
			// Load the comments:
			commentService.commentsForIssueByUrl(this.issueUrl).then(comments => this.comments = comments.get || []);

			// Wait for the user:
			userService.authenticatedUser.then(optUser => {
				if (optUser.isPresent) {
					this.authenticatedUser = optUser.get;
				}
			});

			// Check if user is currently authorized:
			authService.isUserAuthorized
				.then(isAuthorized => this.isAuthorized = isAuthorized)
				.finally(() => this.isWaitingForAuthorization = false);
		};

		////////////////////////////////
		/////
		///// Below only VM methods:
		/////
		////////////////////////////////

		/**
		 * Attempts an authorization.
		 */
		public tryAuthorize(): angular.IPromise<void> {
			this.isWaitingForAuthorization = true;
			return this.authService.accessTokenUsingExistingAuthorizationOrAuthorize.then(optToken => {
				this.isAuthorized = optToken.isPresent;
			}).finally(() => {
				this.isWaitingForAuthorization = false;
			});
		};

		/**
		 * Posts a new comment.
		 */
		public postComment(body: string): angular.IPromise<void> {
			if (!body || (body + '').trim() === '') {
				alert('Your comment must not be empty.');
				return this.$q.when();
			}

			this.commentService.createComment(this.issueUrl, body).then(optComment => {
				this.comments.unshift(optComment.get);
			});
		};

		/**
		 * Deletes a given comment. The user must confirm first, however.
		 */
		public deleteComment(comment: Common.GithubComment): angular.IPromise<void> {
			if (!confirm('Do you really want to delete your comment?')) {
				return this.$q.when();
			}

			return this.commentService.deleteComment(this.issueUrl, comment).then(success => {
				this.comments = this.comments.filter(c => c.id !== comment.id);
			});
		};
	};

	angular.module('blogapp.article.stab-gh-comments').controller('StabGithubCommentsContainerDirectiveController', StabGithubCommentsContainerDirectiveController.inlineAnnotatedConstructor);
};

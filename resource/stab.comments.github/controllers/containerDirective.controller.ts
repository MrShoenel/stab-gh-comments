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
		public allowCommentEdit: boolean = false;
		public allowCommentDelete: boolean = false;
		public mobileMode: string = null; // 'xs' or 'sm' are valid mobile modes, null otherwise

		/**
		 * Used to indicate whether this controller is currently busy. Note that
		 * this returns true if this controller or its parent-controller is busy.
		 */
		private _isBusy: boolean = false;
		public get isBusy(): boolean {
			return this._isBusy || this.isWaitingForAuthorization;
		};

		private _issueUrl: string;

		public get issueUrl(): string {
			return this._issueUrl;
		};

		private _issue: Common.GithubIssue;
		public get issue(): Common.GithubIssue {
			return this._issue;
		};

		/**
		 * Public getter for the comments. Returns the issue's comments
		 * because we do not directly access them.
		 * 
		 * @return Common.GithubComment[] the comments for the current issue.
		 */
		public get comments(): Common.GithubComment[] {
			return this.issue ? this.issue.comments : [];
		};

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$scope', '$q', 'CONFIG_COMMENTS', 'StabGithubCommentsService', 'StabGithubCommentsAuthorizationService', 'StabGithubCommentsUserService', StabGithubCommentsContainerDirectiveController];

		public constructor(private $scope: StabGithubCommentsContainerDirectiveControllerScope, private $q: angular.IQService, private configComments: Common.Constants, private commentService: StabGithubCommentsService, private authService: StabGithubCommentsAuthorizationService, private userService: StabGithubCommentsUserService) {
			this._issueUrl = $scope.issueUrl;
			this._isBusy = true;
			this.allowCommentEdit = configComments.get<boolean>('ALLOW_COMMENT_EDIT');
			this.allowCommentDelete = configComments.get<boolean>('ALLOW_COMMENT_DELETE');

			// Load the comments by first loading the issue:
			const promise_issue = commentService.issueByUrl(this.issueUrl).then(optIssue => {
				commentService.commentsForIssueByUrl(this.issueUrl).then(optComments => {
					// Note that we do not use the comments directly because they are
					// part of the issue and nicely managed by the comment-service.
					this._issue = optIssue.get;
				});
			});

			// Check if user is currently authorized:
			const promise_auth = authService.isUserAuthorized
				.then(isAuthorized => this.isAuthorized = isAuthorized)
				.finally(() => this.isWaitingForAuthorization = false);

			// Wait for the user:
			userService.authenticatedUser.then(optUser => {
				if (optUser.isPresent) {
					this.authenticatedUser = optUser.get;
				}
			});

			// Now wait for some actions to finish.
			this._isBusy = true;
			$q.all([ promise_issue, promise_auth ]).finally(() => {
				this._isBusy = false;
			});

			this.mobileMode = (window.innerWidth < 400 ? 'xs' : (window.innerWidth < 768 ? 'sm' : null));
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
		 * Deletes a given comment. The user must confirm first, however.
		 */
		public deleteComment(comment: Common.GithubComment): angular.IPromise<any> {
			if (!confirm('Do you really want to delete your comment?')) {
				return this.$q.when();
			}

			this._isBusy = true;
			return this.commentService.deleteComment(this.issueUrl, comment)
				.finally(() => this._isBusy = false);
		};

		/**
		 * Patches one comment. Upon success, swaps out the old comment
		 * in the issue.
		 */
		public patchComment(comment: Common.EditableComment & Common.GithubComment): angular.IPromise<any> {
			this._isBusy = true;
			return this.commentService.patchComment(this.issueUrl, comment)
				.finally(() => this._isBusy = false);
		};
	};

	angular.module('blogapp.article.stab-gh-comments').controller('StabGithubCommentsContainerDirectiveController', StabGithubCommentsContainerDirectiveController.inlineAnnotatedConstructor);
};

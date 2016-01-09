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
     * Returns an URL that points to the authorization-app's state-path
		 * so that we can get a state in the first place. Then we get re-
		 * directed to Github from that app. 
     */
		public get authorizationUrl(): string {
			const clientId = this.configComments.get<string>('OAUTH_CLIENT_ID'),
				scopes = this.configComments.get<string[]>('OAUTH_SCOPES').join(','),
				authAppUrl = this.configComments.get<string>('OAUTH_AUTHORIZATION_APP_URL') + 'state',
				blogUrl = this.authService.authCallbackAbsolutePath,
				redirectUri = encodeURIComponent(this.configComments.get<string>('OAUTH_AUTHORIZATION_APP_URL') + 'authorize/?blog_url=' + blogUrl);

				return authAppUrl + '?authorize_at=' +
					encodeURIComponent('https://github.com/login/oauth/authorize'
					+ '?client_id=' + clientId
					+ '&scope=' + scopes
					+ '&redirect_uri=' + redirectUri);
		};

		/**
		 * Used to indicate whether this controller is currently busy. Note that
		 * this returns true if this controller or its parent-controller is busy.
		 * Everything that makes the controller busy ought to increment this value
		 * and decrement it once finished using finally().
		 */
		private _isBusy: number = 0;
		public get isBusy(): boolean {
			return this._isBusy > 0 || this.isWaitingForAuthorization;
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
		public static inlineAnnotatedConstructor: any[] = ['$scope', '$q', '$anchorScroll', '$timeout', 'CONFIG_COMMENTS', 'StabGithubCommentsService', 'StabGithubCommentsAuthorizationService', 'StabGithubCommentsUserService', StabGithubCommentsContainerDirectiveController];

		public constructor(private $scope: StabGithubCommentsContainerDirectiveControllerScope, private $q: angular.IQService, private $anchorScroll: angular.IAnchorScrollService, private $timeout: angular.ITimeoutService, private configComments: Common.Constants, private commentService: StabGithubCommentsService, private authService: StabGithubCommentsAuthorizationService, private userService: StabGithubCommentsUserService) {
			this._issueUrl = $scope.issueUrl;
			this.allowCommentEdit = configComments.get<boolean>('ALLOW_COMMENT_EDIT');
			this.allowCommentDelete = configComments.get<boolean>('ALLOW_COMMENT_DELETE');

			// Load the comments by first loading the issue:
			this._isBusy++;
			const promise_issue = commentService.issueByUrl(this.issueUrl).then(optIssue => {
				this._isBusy++;
				commentService.commentsForIssueByUrl(this.issueUrl).then(optComments => {
					// Note that we do not use the comments directly because they are
					// part of the issue and nicely managed by the comment-service.
					this._issue = optIssue.get;
				}).finally(() => this._isBusy--);
			}).finally(() => this._isBusy--);

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
			this._isBusy++;
			$q.all([ promise_issue, promise_auth ]).finally(() =>  this._isBusy--);

			this.mobileMode = (window.innerWidth < 400 ? 'xs' : (window.innerWidth < 768 ? 'sm' : null));
						this.$timeout(glowTime + 100).then(() => {
							this.issue.comments.forEach(comment => comment.isNew = false);
						});
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

			this._isBusy++;
			return this.commentService.deleteComment(this.issueUrl, comment)
				.finally(() => this._isBusy--);
		};

		/**
		 * Patches one comment. Upon success, swaps out the old comment
		 * in the issue.
		 */
		public patchComment(comment: Common.EditableComment & Common.GithubComment): angular.IPromise<any> {
			this._isBusy++;
			return this.commentService.patchComment(this.issueUrl, comment)
				.finally(() => this._isBusy--);
		};
	};

	angular.module('blogapp.article.stab-gh-comments').controller('StabGithubCommentsContainerDirectiveController', StabGithubCommentsContainerDirectiveController.inlineAnnotatedConstructor);
};

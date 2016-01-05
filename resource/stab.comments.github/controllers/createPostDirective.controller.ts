/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../stab.common.ts" />
/// <reference path="../services/authorization.service.ts" />
/// <reference path="../services/comments.service.ts" />
/// <reference path="../services/user.service.ts" />
/// <reference path="../directives/createPost.directive.ts" />

module Blog.Article.Comments {
	export class StabGithubCommentsCreatePostDirectiveController {

		/**
		 * Used to indicate whether this controller is currently busy. Note that
		 * this returns true if this controller or its parent-controller is busy.
		 */
		private _isBusy: boolean = false;
		public get isBusy(): boolean {
			return this._isBusy || this.$scope.commentVm.isBusy;
		};

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$scope', '$q', '$anchorScroll', 'StabGithubCommentsAuthorizationService', 'StabGithubCommentsService', 'StabGithubCommentsUserService', StabGithubCommentsCreatePostDirectiveController];

		public constructor(private $scope: StabGithubCommentsCreatePostDirectiveControllerScope, private $q: angular.IQService, private $anchorScroll: angular.IAnchorScrollService, private authService: StabGithubCommentsAuthorizationService, private commentService: StabGithubCommentsService, private userService: StabGithubCommentsUserService) {
		};

		/**
		 * Posts a new comment.
		 */
		public postComment(body: string): angular.IPromise<any> {
			if (!body || (body + '').trim() === '') {
				alert('Your comment must not be empty.');
				return this.$q.when();
			}

			this._isBusy = true;
			return this.commentService.createComment(this.$scope.commentVm.issueUrl, body)
				.then(optComment => {
					const domDeferred = this.$q.defer<void>();
					const newCommentId = 'stab-github-comment-' + optComment.get.id;
					const interval = window.setInterval(() => {
						if (document.querySelector('#' + newCommentId)) {
							// Empty the textarea and scroll to new comment
							this.$scope.post.commentBody = '';
							this.$anchorScroll(newCommentId);
							clearInterval(interval);
							domDeferred.resolve();
						}
					}, 25);
					return domDeferred.promise;
				}).finally(() => this._isBusy = false);
		};
	};

	angular.module('blogapp.article.stab-gh-comments').controller('StabGithubCommentsCreatePostDirectiveController', StabGithubCommentsCreatePostDirectiveController.inlineAnnotatedConstructor);
};

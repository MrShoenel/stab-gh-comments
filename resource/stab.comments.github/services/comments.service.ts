/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/stab/app.common.d.ts" />
/// <reference path="./authorization.service.ts" />
/// <reference path="./user.service.ts" />
/// <reference path="../stab.common.ts" />


module Blog.Article.Comments {

	export class StabGithubCommentsService {

		private issueCache: angular.ICacheObject;

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', '$cacheFactory', 'StabGithubCommentsAuthorizationService', 'StabGithubCommentsUserService', StabGithubCommentsService];

		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private $cacheFactoryService: angular.ICacheFactoryService, private authService: StabGithubCommentsAuthorizationService, private userService: StabGithubCommentsUserService) {
			this.issueCache = $cacheFactoryService('issues');
		};

		/**
		 * Gets one issue by Url.
		 * 
		 * @see https://developer.github.com/v3/issues/#get-a-single-issue
		 * @param issueUrl string the full URL to the issue.
		 * @return angular.IPromise<Common.Optional<Common.GithubIssue>> an Optional that
		 *  contains the issue. The Optional will be empty if an error occurs.
		 */
		public issueByUrl(issueUrl: string): angular.IPromise<Common.Optional<Common.GithubIssue>> {
			issueUrl = StabGithubCommentsService.normalizeIssueUrl(issueUrl);
			const issueApiUrl = StabGithubCommentsService.toApiIssueUrl(issueUrl);
			const issue = this.issueCache.get<Common.GithubIssue>(issueUrl);
			if (issue) {
				return this.$q.when(new Common.Optional(issue));
			}

			return this.$http.get<Common.GithubIssue>(issueApiUrl).then(promiseCallbackArg => {
				const issue = promiseCallbackArg.data;
				issue.isOpen = issue.state === 'open';
				issue.comments = [];
				this.issueCache.put(issueUrl, issue);
				return new Common.Optional(issue);
			}).catch(() => {
				// Empty optional:
				return new Common.Optional<Common.GithubIssue>();
			});
		};

		/**
		 * To keep track of the parameter used for 'sortBy'. This is necessary
		 * for when creating new comments so we know where to insert them.
		 */
		private issueComments_sortBy: string = 'created';

		/**
		 * Retrieves all comments for one issue regarding the supplied parameters. Note
		 * that we internally keep track of 'sortBy'.
		 * 
		 * @see https://developer.github.com/v3/issues/comments/#list-comments-in-a-repository
		 * @param issueUrl string the full URL to the issue from where you load the comments.
		 * @param sortBy string either 'created' or 'updated', defaults to 'created'.
		 * @param order Common.SortOrder either ASC or DESC, default to DESC.
		 * @param since Date to load comments since a specified Date, default to new Date(0).
		 * @return angular.IPromise<Common.Optional<Common.GithubComment[]>> array of Github-comments.
		 *  The Optional will be empty if an error occurs.
		 */
		public commentsForIssueByUrl(
			issueUrl: string,
			sortBy: string = 'created',
			order: Common.SortOrder = Common.SortOrder.DESC,
			since: Date = new Date(0)
		) : angular.IPromise<Common.Optional<Common.GithubComment[]>> {
			// update 'sortBy'
			this.issueComments_sortBy = sortBy === 'created' ? sortBy : 'updated';

			issueUrl = StabGithubCommentsService.normalizeIssueUrl(issueUrl);
			const issueApiUrl = StabGithubCommentsService.toApiIssueUrl(issueUrl);
			const promiseIssue = this.issueByUrl(issueUrl);
			const promiseComments = this.$http.get<Common.GithubComment[]>(issueApiUrl + '/comments', {
				params: {
					sort: sortBy === 'created' ? sortBy : 'updated',
					direction: order === Common.SortOrder.ASC ? 'asc' : 'desc',
					since: since.toISOString()
				}
			}).then(promiseCallbackArg => new Common.Optional(promiseCallbackArg.data)).catch(() => {
				// return an empty optional
				return new Common.Optional<Common.GithubComment[]>();
			});

			return this.$q.all([ promiseIssue, promiseComments ]).then((promisesVals: Common.Optional<any>[]) => {
				const optIssue = promisesVals[0] as Common.Optional<Common.GithubIssue>;
				const optComments = promisesVals[1] as Common.Optional<Common.GithubComment[]>;

				if (optIssue.isEmpty || optComments.isEmpty) {
					return new Common.Optional<Common.GithubComment[]>();
				}

				const processedComments = optComments.get.map(comment => {
					return StabGithubCommentsService.processComment(comment, optIssue.get);
				}).sort((a, b) => Date.parse(a[sortBy === 'created' ? 'created_at' : 'updated_at']) > Date.parse(b[sortBy === 'created' ? 'created_at' : 'updated_at']) ? (order === Common.SortOrder.ASC ? 1 : -1) : (order === Common.SortOrder.ASC ? -1 : 1));
				this.setCommentDeletableFlag(processedComments);

				// Set the comments to the issue:
				optIssue.get.comments = processedComments;

				return new Common.Optional<Common.GithubComment[]>(processedComments);
			});
		};

		/**
		 * Convenience wrapper. Patches (edits) a comment. Assumes that the
		 * comment already has an updated body.
		 * 
		 * @see this.createOrPatchComment(..)
		 */
		public patchComment(issueUrl: string, comment: Common.GithubComment): angular.IPromise<Common.Optional<Common.GithubComment>> {
			return this.createOrPatchComment(issueUrl, comment.body, comment).then(optComment => {
				return this.issueByUrl(issueUrl).then(issue => {
					const idxInIssue = issue.get.comments.map((comment, idx) => {
						return { comment, idx };
					}).filter(obj => obj.comment.id === optComment.get.id)[0].idx;

					// Now replace the comment at the specified index with the patched one:
					issue.get.comments[idxInIssue] = optComment.get;

					return optComment;
				});
			});
		};

		/**
		 * Convenience wrapper. Creates a comment.
		 * 
		 * @see this.createOrPatchComment(..)
		 */
		public createComment(issueUrl: string, body: string): angular.IPromise<Common.Optional<Common.GithubComment>> {
			return this.createOrPatchComment(issueUrl, body).then(optComment => {
				return this.issueByUrl(issueUrl).then(issue => {
					// Prepend the new comment to its issue; comments are sorted from
					// newest to oldest, so we have to unshift.
					issue.get.comments.unshift(optComment.get);
					return optComment;
				});
			});
		};

		/**
		 * Creates or patches a new comment using authorization and returns it. The
		 * action depends on whether the parameter 'comment' is a comment or not. If,
		 * then the action is presumed to be 'patch'; 'create', otherwise.
		 * 
		 * @see https://developer.github.com/v3/issues/comments/#create-a-comment
		 * @see https://developer.github.com/v3/issues/comments/#edit-a-comment
		 */
		private createOrPatchComment(issueUrl: string, body: string, comment?: Common.GithubComment): angular.IPromise<Common.Optional<Common.GithubComment>> {
			issueUrl = StabGithubCommentsService.normalizeIssueUrl(issueUrl);

			return this.authService.accessTokenUsingExistingAuthorizationOrAuthorize.then(optToken => {
				if (!optToken.isPresent) {
					return this.$q.when(new Common.Optional<Common.GithubComment>());
				}

				// POST or PATCH?
				const isPatch = !!comment && angular.isNumber(comment.id);
				const method = isPatch ? this.$http.patch : this.$http.post;
				const issueApiUrl = StabGithubCommentsService.toApiIssueUrl(
					// Note that PATCH-issue-URLs do NOT reference an Issue-ID, they look
					// like: PATCH /repos/:owner/:repo/issues/comments/:id
					// (Same goes for DELETE-URLs) so we have to prepare that:
					isPatch ? issueUrl.substring(0, issueUrl.lastIndexOf('/')) : issueUrl
				);

				return method<Common.GithubComment>(issueApiUrl + '/comments' + (isPatch ? '/' + comment.id : ''),
				{ body: body }, {
					headers: {
						Authorization: 'token ' + optToken.get
					}
				}).then(promiseCallbackArg => {
					return this.issueByUrl(issueUrl).then(optIssue => {
						if (!optIssue.isPresent) {
							throw new Error('The issue is not present.');
						}

						const comment = StabGithubCommentsService.processComment(promiseCallbackArg.data, optIssue.get);
						this.setCommentDeletableFlag([comment]);

						return new Common.Optional(comment);
					});
				}).catch(() => {
					return this.$q.when(new Common.Optional<Common.GithubComment>());
				});
			});
		};

		/**
		 * Deletes one comment on the given issue.
		 */
		public deleteComment(issueUrl: string, comment: Common.GithubComment): angular.IPromise<boolean> {
			issueUrl = StabGithubCommentsService.normalizeIssueUrl(issueUrl);
			const issue = this.issueByUrl(issueUrl);
			issueUrl = issueUrl.substring(0, issueUrl.lastIndexOf('/'));
			const issueApiUrl = StabGithubCommentsService.toApiIssueUrl(issueUrl);

			return this.authService.accessTokenUsingExistingAuthorizationOrAuthorize.then(optToken => {
				if (!optToken.isPresent) {
					return false;
				}

				return this.$http.delete<void>(issueApiUrl + '/comments/' + comment.id, {
					headers: {
						Authorization: 'token ' + optToken.get
					}
				}).then(() => {
					return issue.then(optIssue => {
						optIssue.get.comments = optIssue.get.comments.filter(c => c.id !== comment.id);
						return true;
					});
				}).catch(() => {
					return false;
				});
			});
		};

		/**
		 * Takes an array of comments and sets the isDeletable-flag for
		 * each of them. Note that this method must wait for a user to
		 * authorize, which may never happens. But when they do, it walks
		 * the comments and sets the flag to true for each comment that is
		 * owned by that user.
		 * 
		 * @return angular.IPromise<Common.GithubComment[]> a promise
		 *  containing all the comments that were checked/flagged.
		 */
		private setCommentDeletableFlag(comments: Common.GithubComment[]): angular.IPromise<Common.GithubComment[]> {
			return this.authService.userAuthorizedPromise.then(() => {
				return this.userService.authenticatedUser.then(optUser => {
					const user = optUser.get;
					comments.forEach(c => c.isDeletable = c.user.id === user.id);
					return comments;
				});
			});
		};

		/**
		 * Transforms an issue-URL to a relative, normalized form. E.g.:
		 * - https://github.com/MrShoenel/stab-gh-comments/issues/1
		 *   becomes 'MrShoenel/stab-gh-comments/issues/1'
		 * - /MrShoenel/stab-gh-comments/issues/1
		 *   becomes 'MrShoenel/stab-gh-comments/issues/1'
		 * 
		 * We use this URL as the issue's ID.
		 * 
		 * @return string the normalized issue-URL.
		 */
		private static normalizeIssueUrl(issueUrl: string): string {
			return (issueUrl + '').replace(/(?:https:\/\/github.com)?(?:\/)?([^/]+?\/[^/]+?\/issues\/[^/]+?)/i, '$1');
		};

		/**
		 * Returns an absolute Github-API Issue-URL from a normalized URL.
		 * 
		 * @param normalizedIssueUrl string the normalized URL. The bahavior of
		 *  this method is undefined for any non-normalized issue-URL.
		 */
		private static toApiIssueUrl(normalizedIssueUrl: string): string {
			return 'https://api.github.com/repos/' + normalizedIssueUrl;
		};

		/**
		 * Process a Github comment and does the following currently:
		 * - Populate 'commenter'-property from 'user'-property
		 * - Parse created- and updated-dates into JS-Dates
		 * - Populate 'isIssueOwner'-property of comment
		 */
		private static processComment(comment: Common.GithubComment, issue: Common.GithubIssue): Common.GithubComment {
			const commentWasUpdated = comment.created_at !== comment.updated_at;
			comment.commenter = comment.user; // populate standard-property
			comment.created_at = new Date(Date.parse(comment.created_at.toString()));
			comment.updated_at = commentWasUpdated ?
				new Date(Date.parse(comment.updated_at.toString())) : null;
			comment.isIssueOwner = comment.user.id === issue.user.id;
			comment.isDeletable = false; // default, will update once user is there
			return comment;
		};
	};

	angular.module('blogapp.article.stab-gh-comments')
		.service('StabGithubCommentsService', StabGithubCommentsService.inlineAnnotatedConstructor);
};

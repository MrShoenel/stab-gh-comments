/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/stab/app.common.d.ts" />
/// <reference path="../stab.common.ts" />


module Blog.Article.Comments {

	export class StabGithubCommentsService {

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', StabGithubCommentsService];

		public constructor(private $http: angular.IHttpService) {};

		/**
		 * Gets one issue by Url.
		 * 
		 * @see https://developer.github.com/v3/issues/#get-a-single-issue
		 * @param issueUrl string the full URL to the issue.
		 * @return angular.IPromise<Common.Optional<Common.GithubIssue>> an Optional that
		 *  contains the issue. The Optional will be empty if an error occurs.
		 */
		public issueByUrl(issueUrl: string): angular.IPromise<Common.Optional<Common.GithubIssue>> {
			return this.$http.get<Common.GithubIssue>(issueUrl).then(promiseCallbackArg => {
				const issue = promiseCallbackArg.data;
				issue.isOpen = issue.state === 'open';
				return new Common.Optional(issue);
			}).catch(() => {
				// Empty optional:
				return new Common.Optional<Common.GithubIssue>();
			});
		};

		/**
		 * Retrieves all comments for one issue regarding the supplied parameters.
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
			// e.g. https://api.github.com/repos/MrShoenel/stab-gh-comments/issues/comments/168499913
			return this.$http.get<Common.GithubComment[]>(issueUrl + '/comments', {
				params: {
					sort: sortBy === 'created' ? sortBy : 'updated',
					direction: order === Common.SortOrder.ASC ? 'asc' : 'desc',
					since: since.toISOString()
				}
			}).then(promiseCallbackArg => {
				return new Common.Optional(promiseCallbackArg.data.map(ghCommentar => {
					ghCommentar.commenter = ghCommentar.commenter; // populate standard-property
					ghCommentar.created_at = new Date(Date.parse(ghCommentar.created_at.toString()));
					ghCommentar.updated_at = new Date(Date.parse(ghCommentar.updated_at.toString()));

					return ghCommentar;
				}));
			}).catch(() => {
				// return an empty optional
				return new Common.Optional<Common.GithubComment[]>();
			});
		};
	};

	angular.module('blogapp.article.stab-gh-comments')
		.service('StabGithubCommentsService', StabGithubCommentsService.inlineAnnotatedConstructor);
};

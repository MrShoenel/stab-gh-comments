/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/stab/app.common.d.ts" />
/// <reference path="./authorization.service.ts" />
/// <reference path="../stab.common.ts" />


module Blog.Article.Comments {

	export class StabGithubCommentsUserService {

		private userCache: angular.ICacheObject;

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', '$cacheFactory', 'StabGithubCommentsAuthorizationService', StabGithubCommentsUserService];

		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private $cacheFactoryService: angular.ICacheFactoryService, private authService: StabGithubCommentsAuthorizationService) {
			this.userCache = $cacheFactoryService('users');
		};

		/**
		 * Gets the currently authenticated user. This method waits for the
		 * Authorization-service.
		 * 
		 * @see https://developer.github.com/v3/users/#get-the-authenticated-user
		 */
		public get authenticatedUser(): angular.IPromise<Common.Optional<Common.GithubCommenter>> {
			return this.authService.userAuthorizedPromise.then(() => {
				return this.authService.accessTokenUsingExistingAuthorizationOrAuthorize.then(optToken => {
					if (!optToken.isPresent) {
						return new Common.Optional<Common.GithubCommenter>();
					}

					const user = this.userCache.get<Common.GithubCommenter>('__authenticated_user__');
					return user === void 0 ? this.$http.get<Common.GithubCommenter>('https://api.github.com/user', {
						headers: {
							Authorization: 'token ' + optToken.get
						}
					}).then(promiseCallbackArg => {
						const user = promiseCallbackArg.data;
						this.userCache.put(user.id.toString(), user);
						this.userCache.put('__authenticated_user__', user);
						return new Common.Optional(user);
					}).catch(() => {
						return new Common.Optional<Common.GithubCommenter>();
					}) : this.$q.when(new Common.Optional(user));
				});
			});
		};
	};

	angular.module('blogapp.article.stab-gh-comments')
		.service('StabGithubCommentsUserService', StabGithubCommentsUserService.inlineAnnotatedConstructor);
};

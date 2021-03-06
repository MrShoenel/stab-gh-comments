/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/stab/app.common.d.ts" />
/// <reference path="../stab.common.ts" />

module Blog.Article.Comments {

	export class StabGithubCommentsAuthorizationService {

		/**
		 * Deferred and Promise that resolve once the user is authorized.
		 */
		private userAuthorizedDeferred: angular.IDeferred<void>;
		public get userAuthorizedPromise(): angular.IPromise<void> {
			return this.userAuthorizedDeferred.promise;
		};

		/**
		 * Deferred that resolves when there is a valid token in the
		 * localStorage.
		 * @see this.pollLocalStorage(..)
		 */
		private localStorageDeferred: angular.IDeferred<string> =
			this.$q.defer<string>();

		/**
		 * Property which we use to check if the localStorage is available. We
		 * use it to store the access token.
		 */
		private static get isLocalStorageAvailable(): boolean {
			var test = 'test';
			try {
				localStorage.setItem(test, test);
				localStorage.removeItem(test);
				return true;
			} catch (e) { }
			return false;
		};

		/**
		 * Convenience wrapper to retrieve the access-token from the localStorage.
		 * @return Optional<string> may containing the Token.
		 */
		public get accessToken(): Common.Optional<string> {
			return new Common.Optional<string>(
				localStorage.getItem(this.CONFIG.get<string>('OAUTH_LOCAL_STORAGE_TOKEN_KEY')));
		};

		/**
		 * Used to reset (delete) an invalid token.
		 */
		private resetAccessToken(): void {
			localStorage.removeItem(this.CONFIG.get<string>('OAUTH_LOCAL_STORAGE_TOKEN_KEY'));
		};

		private localStorageInterval: number = null;

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', 'CONFIG_COMMENTS', StabGithubCommentsAuthorizationService];

		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private CONFIG: Common.Constants) {
			this.userAuthorizedDeferred = $q.defer<void>();
		};

		/**
		 * This function uses the access token stored in the localStorage and
		 * queries its validity including the scopes.
		 */
		public get isUserAuthorized(): angular.IPromise<boolean> {
			var token = this.accessToken;
			if (!StabGithubCommentsAuthorizationService.isLocalStorageAvailable || token.isEmpty) {
				return this.$q.when(false);
			}

			// allrighty, now we gotta check the existing token and required scopes:
			const scopes = this.CONFIG.get<string[]>('OAUTH_SCOPES').join(',');
			return this.$http.get<boolean>(this.CONFIG.get<string>('OAUTH_AUTHORIZATION_APP_URL') + 'check/' + token.get + '/' + scopes).then(foo => {
				this.userAuthorizedDeferred.resolve();
				return true;
			}).catch(_404 => {
				this.resetAccessToken();
				return false;
			});
		};

		/**
		 * This method is a convenience wrapper that checks the existing authorization
		 * using this.isUserAuthorized() and authorizes the user if not done yet. Returns
		 * then an Optional with the accessToken.
		 * 
		 * @return angular.IPromise<Common.Optional<string>> an Optional containing the
		 *  accessToken if successful; an empty one, otherwise.
		 */
		public get accessTokenUsingExistingAuthorizationOrAuthorize(): angular.IPromise<Common.Optional<string>> {
			return this.isUserAuthorized.then(isAuthorizedOrNot => {
				if (isAuthorizedOrNot) {
					this.userAuthorizedDeferred.resolve();
					return this.accessToken;
				}

				return this.pollLocalStorage().then(token => {
					return this.isUserAuthorized.then(isAuthorizedOrNot => {
						return new Common.Optional<string>(isAuthorizedOrNot ? token : null);
					});
				});
			});
		};

		/**
		 * Polls the localStorage every mSecs for the presence of our
		 * requested OAuth token. Resolves once it is present.
		 */
		private pollLocalStorage(mSecs: number = 50): angular.IPromise<string> {
			if (!StabGithubCommentsAuthorizationService.isLocalStorageAvailable) {
				return this.$q.when<string>(null);
			}

			// Check for token every 50ms
			if (this.localStorageInterval === null) {
				this.localStorageInterval = setInterval(() => {
					var token = this.accessToken;
					if (token.isPresent) {
						clearInterval(this.localStorageInterval);
						this.localStorageInterval = null;
						this.localStorageDeferred.resolve(token.get);
					}
				}, mSecs);
			}

			return this.localStorageDeferred.promise;
		};

		/**
		 * This getter returns the absolute path to our authorization-callback file.
		 * It is assumend to be within the same directory as this comments module.
		 */
		public get authCallbackAbsolutePath(): string {
			const fileName = this.CONFIG.get<string>('OAUTH_HTML_CALLBACK_FILE');
			let pathHere = (<Element[]>Array.prototype.slice.call(document.querySelectorAll('script'), 0)).filter((elem: Element) => {
				return elem.hasAttribute('src') && (elem.getAttribute('src') + '').indexOf('stab.comments.github') >= 0;
			})[0].getAttribute('src');

			pathHere = pathHere.substring(0, pathHere.lastIndexOf('/')) + '/';

			return location.protocol + '//' + location.host +
				(pathHere.indexOf('/') === 0 ? pathHere : location.pathname + pathHere) + fileName;
		};
	};

	angular.module('blogapp.article.stab-gh-comments')
		.service('StabGithubCommentsAuthorizationService', StabGithubCommentsAuthorizationService.inlineAnnotatedConstructor);
};

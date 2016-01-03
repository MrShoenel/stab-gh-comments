/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/stab/app.common.d.ts" />
/// <reference path="../stab.common.ts" />

module Blog.Article.Comments {

	export class StabGithubCommentsAuthorizationService {

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

		private localStorageInterval: number = null;

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', '$q', 'CONFIG_COMMENTS', StabGithubCommentsAuthorizationService];

		public constructor(private $http: angular.IHttpService, private $q: angular.IQService, private CONFIG: Common.Constants) {};

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
			return this.$http.get<boolean>(this.CONFIG.get<string>('OAUTH_AUTHORIZATION_APP_URL') + 'check/' + token.get + '/' + scopes)
				.then(foo => true)
				.catch(_404 => false);
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
					return this.accessToken;
				}

				return this.authorize().then(isAuthorized => {
					return isAuthorized ? new Common.Optional<string>() : this.accessToken;
				});
			});
		};

		/**
		 * This function retrieves a new state from the authorization app.
		 */
		private get state(): angular.IPromise<string> {
			const appUrl = this.CONFIG.get<string>('OAUTH_AUTHORIZATION_APP_URL');
			return this.$http.get<string>(appUrl + 'state').then(promiseCallbackArg => promiseCallbackArg.data);
		};

		/**
		 * This method opens an authorization window in which the user can log
		 * into Github and authorize the app to post comments on their behalf.
		 * This is what happens chonologically:
		 * - obtain a new state, then
		 * - open the window to Github while
		 * - starting to poll the localStorage for a token
		 * - once present, check the integrity of the token and
		 * - finally close the previously opened window.
		 */
		public authorize(): angular.IPromise<boolean> {
			if (!StabGithubCommentsAuthorizationService.isLocalStorageAvailable) {
				return this.$q.when(false);
			}

			return this.state.then(state => {
				const clientId = this.CONFIG.get<string>('OAUTH_CLIENT_ID'),
					scopes = this.CONFIG.get<string[]>('OAUTH_SCOPES').join(','),
					blogUrl = this.authCallbackAbsolutePath,
					redirectUri = encodeURIComponent(this.CONFIG.get<string>('OAUTH_AUTHORIZATION_APP_URL') + 'authorize/?blog_url=' + blogUrl);

				var wnd: Window = window.open('https://github.com/login/oauth/authorize'
					+ '?client_id=' + clientId
					+ '&state=' + state
					+ '&scope=' + scopes
					+ '&redirect_uri=' + redirectUri,
					'_blank');

				// Now we poll the localStorage for the token and resolve once it's there:
				return this.pollLocalStorage().then(token => {
					return this.isUserAuthorized;
				}).finally(() => {
					wnd.close();
				});
			}).catch(() => {
				return false;
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

			if (this.localStorageInterval !== null) {
				throw new Error('You may only call this function once.');
			}

			// Check for token every 50ms
			const defer = this.$q.defer<string>();
			this.localStorageInterval = setInterval(() => {
				var token = this.accessToken;
				if (token.isPresent) {
					clearInterval(this.localStorageInterval);
					this.localStorageInterval = null;
					defer.resolve(token.get);
				}
			}, mSecs);

			return defer.promise;
		};

		/**
		 * This getter returns the absolute path to our authorization-callback file.
		 * It is assumend to be within the same directory as this comments module.
		 */
		private get authCallbackAbsolutePath(): string {
			const fileName = this.CONFIG.get<string>('OAUTH_HTML_CALLBACK_FILE');
			let pathHere = (<Element[]>Array.prototype.slice.call(document.querySelectorAll('script'), 0)).filter((elem: Element) => {
				return elem.getAttribute('src').indexOf('stab.comments.github') >= 0;
			})[0].getAttribute('src');

			pathHere = pathHere.substring(0, pathHere.lastIndexOf('/')) + '/';

			return location.protocol + '//' + location.host +
				(pathHere.indexOf('/') === 0 ? pathHere : location.pathname + pathHere) + fileName;
		};
	};

	angular.module('blogapp.article.stab-gh-comments')
		.service('StabGithubCommentsAuthorizationService', StabGithubCommentsAuthorizationService.inlineAnnotatedConstructor);
};

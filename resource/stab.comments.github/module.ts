/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/stab/app.common.d.ts" />

module Blog.Article.Comments {

	var includedCss = '';

	function addStylesToHead() {
		var style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.setAttribute('id', 'stab-comments-github-styles');
		style.innerHTML = includedCss;
		document.querySelector('head').appendChild(style);
	};

	class StabGithubComments {
		public createModule(): angular.IModule {
			if (includedCss !== '') {
				addStylesToHead();
			}

			return angular.module('blogapp.article.stab-gh-comments', [
				// The following two are for markdown:
				'ngSanitize',
				'btford.markdown'
			]).constant('CONFIG_COMMENTS', new Common.Constants()
					// This is our app's ID that we use to authorize a commenter.
					.add('OAUTH_CLIENT_ID', 'ddd88d5a03c3e91978f3')
					// The scopes we are going to obtain
					.add('OAUTH_SCOPES', ['user', 'public_repo'])
					// This file will receive the token and put it into the localStorage.
					.add('OAUTH_HTML_CALLBACK_FILE', 'auth.callback.html')
					// Where our app lives:
					.add('OAUTH_AUTHORIZATION_APP_URL', 'https://stab-gh-comments-authorizer.herokuapp.com/')
					// This is the name of the key in the localStorage where we store the token:
					.add('OAUTH_LOCAL_STORAGE_TOKEN_KEY', 'STAB_GITHUB_COMMENTS_OAUTH_ACCESS_TOKEN')
			);
		};
	};

	export var stabGithubComments = new StabGithubComments().createModule();
};

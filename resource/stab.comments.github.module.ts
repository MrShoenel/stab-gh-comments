/// <reference path="../typings/angularjs/angular.d.ts" />

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

			return angular.module('blogapp.article.stab-gh-comments', []);
		};
	};

	export var stabGithubComments = new StabGithubComments();
};

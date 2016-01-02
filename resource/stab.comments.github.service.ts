/// <reference path="../typings/angularjs/angular.d.ts" />


module Blog.Article.Comments {

	export class StabGithubCommentsService {

		/**
		 * Used as dependecy-injected factory.
		 */
		public static inlineAnnotatedConstructor: any[] = ['$http', StabGithubCommentsService];

		public constructor(private $http: angular.IHttpService) {};
	};

};

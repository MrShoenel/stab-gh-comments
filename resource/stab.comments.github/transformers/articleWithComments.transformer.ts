/// <reference path="../../../typings/stab/app.common.d.ts" />

module Blog.Article {
	/**
	 * This class we use to transform meta-tags within the article
	 * to a directive which gets appended to the article.
	 */
	export class StabGithubCommentsArticleTransformer implements Common.ContentTransformer {
		public static matchMeta =
			/<meta\s+?name="stab-github-comments-issue-url"\s+?content="([^"]+)"\s*?\/?>/i;

		public transform(original: string): string {
			var exec = StabGithubCommentsArticleTransformer.matchMeta.exec(original);

			if (exec === null) {
				// no match, return original
				return original;
			}

			return original.replace('</article>', '<stab-github-comments-container issue-url="' + exec[1] +  '"></stab-github-comments-container></article>');
		};
	};
};

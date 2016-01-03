/**
 * Here we extend the Common-module of Stab.
 */
module Common {
	/**
	 * This class is similar to the Optional<T>-class known from Java.
	 */
	export class Optional<T> {
		/**
		 * The Optional is considered to be empty if the value === null.
		 * Note that undefined is a valid value, however.
		 */
		constructor(private value?: T) {
			value = value || null;
		};

		/**
		 * @return Boolean true if the contained value === null.
		 */
		public get isEmpty(): boolean {
			return this.value === null;
		};

		/**
		 * The inverse operation to isEmpty().
		 * @return Boolean true, if this Optional contains a non-null value;
		 * false, otherwise.
		 */
		public get isPresent(): boolean {
			return !this.isEmpty;
		};

		/**
		 * @throws Error if this Optional is empty.
		 * @returns T the wrapped value.
		 */
		public get get(): T {
			if (this.isEmpty) {
				throw new Error('The Optional<T> does not contain any value.');
			}
			return this.value;
		};
	};

	/**
	 * We use this for comment-ordering and other purposes.
	 */
	export enum SortOrder {
		ASC,
		DESC,
		RANDOM
	};

	/////////////////////////////////////////////////////
	////
	////  Below we add some comment-related interfaces:
	////
	/////////////////////////////////////////////////////

	/**
	 * Standard interface to model someone who commented.
	 */
	export interface Commenter {
		name: string;
	};

	/**
	 * Standard interface to model a comment.
	 */
	export interface Comment {
		commenter: Commenter;
		body: string;
	};

	/**
	 * Specialized Github interface to model a commenter from Github.
	 */
	export interface GithubCommenter extends Commenter {
		id: number; // Github User-ID
		login: string; // The Github username
		avatar_url: string;
	};

	/**
	 * Specialized Github interface to model Github-comments and -commenters.
	 */
	export interface GithubComment extends Comment {
		id: number; // Github Issue-comment-ID
		url: string; // URL to that comment

		// Note that this is different from the Comment-interface. However, we
		// will populate the parent's property 'commenter' as well.
		user: GithubCommenter;

		// Github responds with parseable string which we will parse into Dates.
		created_at: Date;
		updated_at: Date;
	};

	/**
	 * We use this interface to fetch Meta-information about an issue. This
	 * helps us to decorate the whole conversation with information we need
	 * specifically for comments.
	 * Note that an issue contains lots of other information which is not
	 * implemented in this interface.
	 */
	export interface GithubIssue {
		id: number;
		url: string;
		state: string;
		isOpen: boolean;

		// Will be populated for convenience reasons:
		user: GithubCommenter;
	};
};
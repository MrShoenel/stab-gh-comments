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
			this.value = value || null;
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
	 * Generic interface that can be implemented on arbitrary types
	 * to determine equality.
	 */
	export interface Equatable<T> {
		equals(other: T): boolean;
	};

	/**
	 * Interface to be implemented by specialized comparers. Especially
	 * useful if the types to compare do not have an actual implementation.
	 */
	export interface EqualityComparer<T> {
		/**
		 * Returns true if both instances are equal. If the instances given
		 * implement Equatable<T> then this method is used to determine
		 * equality.
		 */
		equals(a: T | Equatable<T>, b: T | Equatable<T>): boolean;
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
	 * Interface with a property that signalizes a comment which is
	 * in the state 'edit'.
	 */
	export interface EditableComment extends Comment {
		isEditing: boolean;
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
		// If a comment hasn't been updated, Github sets 'updated_at' to the same
		// time as 'created_at'. In this case, we set 'updated_at' to null!
		updated_at: Date;

		// Will be populated
		isIssueOwner: boolean;
		// Only true if a comment was created by the current user.
		isDeletable: boolean;
		// Will be temporarily set to true if loaded from Github again.
		isNew: boolean;
	};

	/**
	 * Class to compare two comments from Github.
	 */
	export class GithubCommentEqualityComparer implements EqualityComparer<GithubComment> {
		/**
		 * Hashes a String similar to how it's done in Java.
		 * 
		 * @return number the hash-value of the string given.
		 */
		public static hash(value: string): number {
			value = value + '';
			var hash = 0;
			if (value.length === 0) {
				return hash;
			}

			for (var i = 0; i < value.length; i++) {
				var char = value.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash = hash & hash; // Convert to 32bit integer
			}

			return hash;
		};

		/**
		 * Equates two GithubComments and returns true if the following
		 * conditions are met:
		 * - same ID, Url, hash of content, creation- and update-timestamps
		 * 
		 * @return boolean true, if the conditions are met; false, otherwise.
		 */
		public equals(a: GithubComment, b: GithubComment): boolean {
			var hash = GithubCommentEqualityComparer.hash;

			return a.id === b.id &&
				a.url === b.url &&
				hash(a.body) === hash(b.body) &&
				a.created_at.getTime() === b.created_at.getTime() &&
				(a.updated_at === null && b.updated_at === null ? true :
					(a.updated_at.getTime() === (b.updated_at === null ? null : b.updated_at.getTime()))
				);
		};
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

		comments: GithubComment[];

		// Will be populated for convenience reasons:
		user: GithubCommenter;
	};
};

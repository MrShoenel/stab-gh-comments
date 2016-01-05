#stab-gh-comments

This is an additional module for [***Stab***](https://github.com/MrShoenel/stab) which allows you to facilitate Github's Issue comments for articles which you blog using Stab. To see it in action, you may visit my [personal](https://mrshoenel.github.io/) blog.

This whole comment module is currently less than 60 KB! It is fully fledged, embedded into *Stab* it can do the following:

* List all comments for an Issue
* Create new comments
* Edit and delete your own comments
* Immediate markdown-preview
* Get each user's and the authorized user's profile information to show avatars, names etc.

This module uses the application [stab-gh-comments-authorizer](https://github.com/MrShoenel/stab-gh-comments-authorizer) to authorize users so they can post. This app is open source as well! I provide a free hosted instance on [*heroku*](https://stab-gh-comments-authorizer.herokuapp.com/) which you are welcome to use! You can however use your own (copy of the) application to authorize users, this can be configured in the main module of *stab-gh-comments*.

## Download and/or build

There is a release branch which always holds the latest version, since the whole system consists only of ***two*** files! If you want to build it yourself or make other changes to it, you need to check out the latest version from *master* and run these commands:

	npm install
	grunt --optimize

The *--optimize*-flag builds a concatenated and uglified version of this comment module (the default, because we want to keep the memory- and bandwidth-footprint low).

## Installation in Stab
Obtain a copy of *stab-gh-comments*. It is recommended to use an *optimized* build (contains of two files only; the compressed and combined JavaScript and the authorization-callback file) and the *Stab*-feature ***MyDeps***.

The installation is as easy as:

* **copy** the file *auth.callback.html* into /content/mydeps
* **copy** the file *stab.comments.github.js* into the same directory
	* If you like, you may go ahead and create a sub-directory within your *mydeps*-folder to put these files in. This is fine as long as the two files stay in the **same** folder.

<small>*Note:* If you do not use an optimized version, you will have to manually install *stab-gh-comments* within your application and dependency system.</small>
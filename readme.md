#stab-gh-comments

This is an additional module for [***Stab***](https://github.com/MrShoenel/stab) which allows you to facilitate Github's Issue comments for articles in *realtime* which you blog using Stab. To see it in action, you may visit my [personal](https://mrshoenel.github.io/) blog.

This whole comment module is currently less than **60 KB** in size! It is fully fledged and embedded into *Stab* it can do the following:

* List all comments for an Issue
* Create new comments
* Edit and delete your own comments
	* This can be configured and switched off as of v.1.1.1
* Immediate markdown-preview
* Store authorization in *localStorage* and lazily validate it once the user comes back, all in the background!
* Get each user's and the authorized user's profile information to show avatars, names etc.
* Responsive all the way:
	* During authorization, wait's for the user to finish, then closes the window, enables the form, loads details from Github etc.
	* When posting: Adds posts directly to the thread and jumps to them!
	* When editing: Make edits to your comments *in-place*, with instant preview.
* ***NEW*** in v1.3.1:
	* *Realtime comments*: stab-gh-comments now can use WebSocket to be notified of new comments while you're viewing existing comments. This can be disabled. You will need to set up a Github-Webhook and use an application to forward those messages via Webhook. Therefore I created [**Github Realtime Webhook**](https://github.com/MrShoenel/github-realtime-webhook) and I also provide a free hosted instance on [*heroku*](https://github-realtime-webhook.herokuapp.com) which you are welcome to use.
	
**See images of all this below!**

This module uses the application [stab-gh-comments-authorizer](https://github.com/MrShoenel/stab-gh-comments-authorizer) to authorize users so they can post. This app is open source as well! I provide a free hosted instance on [*heroku*](https://stab-gh-comments-authorizer.herokuapp.com/) which you are welcome to use! You can however use your own (copy of the) application to authorize users, this can be configured in the main module of *stab-gh-comments*.

## Download and/or build

There is a [**release branch**](https://github.com/MrShoenel/stab-gh-comments/tree/release) which always holds the latest version, since the whole system consists only of ***two*** files! If you want to build it yourself or make other changes to it, you need to check out the latest version from *master* and run these commands:

	npm install
	grunt --optimize

The *--optimize*-flag builds a concatenated and uglified version of this comment module (the default, because we want to keep the memory- and bandwidth-footprint low).

## Installation in Stab
Obtain a copy of *stab-gh-comments*. It is recommended to use an *optimized* build (contains only two files: the compressed/combined JavaScript and the authorization-callback file) and the *Stab*-feature ***MyDeps***.

The installation is as easy as:

* **copy** the file *auth.callback.html* into /content/mydeps
* **copy** the file *stab.comments.github.js* into the same directory
	* If you like, you may go ahead and create a sub-directory within your *mydeps*-folder to put these files in. This is fine as long as the two files stay in the **same** folder.
* **rebuild** and deploy your *Stab*-content (your articles) as this will also re-deploy the comment-system.

<small>*Note:* If you do not use an optimized version, you will have to manually install *stab-gh-comments* within your application and dependency system.</small>

## Usage in Stab
To attach comments to one of your articles you publish with Stab, you need to do the following:
* **Create an issue on Github**: This issue will be used to attach the comments to. If you have a Github-hosted blog (with Github-Pages) you may go to its repository and create an issue for each of your articles you want comments for.
* **Add a meta-tag**: Like other tags on your articles, you will have to add a meta-tag with the issue-URL. This tag may look like the following:

	&lt;meta name="**stab-github-comments-issue-url**" content="**https://github.com/MrShoenel/stab-gh-comments/issues/1**" /&gt;
	
	Self-explanatory, isn't it?

## How *stab-gh-comments* looks:
Here you will find some screenshots of how the system looks and what it supports. The CSS was kept simple so you can easy adapt it to your needs, mostly *Bootstrap-compatible* classes were used.

### Pre-authorization
This is how the *create post* form looks if you're not authorized:

![](https://raw.githubusercontent.com/MrShoenel/stab-gh-comments/develop/readme_resource/pre-auth.gif)

### If you click Authorize:
Then *stab-gh-comments* will open a popup to Github where you can log in and authorize [stab-gh-comments-authorizer](https://github.com/MrShoenel/stab-gh-comments-authorizer) to post, edit and update comments on your behalf:

![](https://raw.githubusercontent.com/MrShoenel/stab-gh-comments/develop/readme_resource/while-auth-app.gif)

### During Authorization
The user will get a feedback during the authorization and once it's done, without any reloading! This is how that looks:

![](https://raw.githubusercontent.com/MrShoenel/stab-gh-comments/develop/readme_resource/while-auth.gif)

### When authorized
Once we got back a valid *access token*, *stab-gh-comments* re-renders the thread-system and allows you to perform common CRUD-operations (commenting etc.) In the following picture you'll see an example thread
* with the box to create comments unlocked,
* an edited comment
* and another comment which currently edited

![](https://raw.githubusercontent.com/MrShoenel/stab-gh-comments/develop/readme_resource/commenting_editing_reading.gif)

#### Mobile view
This comment system adapts to the available screen width. if it's less than 768px, it'll look like this (*sm*-view):

![](https://raw.githubusercontent.com/MrShoenel/stab-gh-comments/develop/readme_resource/commenting_editing_reading_mobile-sm.gif)

For devices with less than 400px in width, it will degrade even further (*xs*-view):

![](https://raw.githubusercontent.com/MrShoenel/stab-gh-comments/develop/readme_resource/commenting_editing_reading_mobile-xs.gif)

### Badges
Each post/comment has badges, similar to Github's commenting-system. The issue-creator has the **Owner**-badge. If you see a comment of yours and you've been authorized, you can **edit** and **delete** your own comments *in-place*!
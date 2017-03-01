---
layout: page
title: Indieweb
permalink: /indieweb/
---
Here's a look at how my website complies with IndieWeb standards and what my plans and ideas are for the future of my site and for the IndieWeb.

## Projects
* indigenous (Under Development) - A iOS and macOS share extension that sends data to a Micropub endpoint. You will download the app, login with IndieAuth, then you can send micropub to your site by using the iOS or macOS share sheet.

## Working On

### Currently Working
* Finishing marking up my templates with microformats
* Converting current posts into different collection types that match IndieWeb post types.
* Finish PESOS reading data from Goodreads to my site, build a read page to be my central portal for my reading information.

### Itches
* Build a Micropub Endpoint based on (Node-Micropub)[https://github.com/voxpelli/node-micropub-express]
* Set up PESOS import of Kindle Highlights
* Explore watch post type for logging TV and Movies, with /watch portal page.
* Move video posts from YouTube to POSSE
* Add support for sending Webmentions
* Add support for replying/citing posts
* Add support for receiving webmentions
* Import all the old Tweets, Instagram and Facebook posts after filtering out the irrelevant posts I don't want to keep.
* Begin POSSE processes starting with notes

### Random Brainstorm Ideas for Future
* Lifestream Micropub Syncing app. An iOS app that syncs the Healthkit data that you choose up to your micropub endpoint.
* Explore Read-It-Later style app that utilizes h-feed and micropub with private read posts from your site.

### Completed
* Marked up site content with microformats
* Added basic level of PESOS for Goodreads currently reading and recently read books.
* Set up Web Sign In
* Own my own domain

## Implementation Design
* This site is a standard jekyll site.
** Currently my site contains the following post types: article, book review, photo, video.
** All of these are actually just posts with different YAML front-matter. This is bad and they need to be changed into collections. Also video is currently just a link to YouTube. #IndieWebFail. That needs to be fixed.
* node.js scripts run in the background to [[PESOS]] Goodreads content to my /data directory and periodically rebuilds my Jekyll site with fresh data.
* The goal is to always have a static site as much as possible, with node.js micro services that update my static files as need be. Eventually, if needed, having [[node.js]] store data in a database and then whenever data is updated, re-publish static files. I would like to stick with jekyll as long as possible, but if that ever gets to the point that it is too complicated, the goal is to build a node.js module that exports HTML through a template language like Jade.
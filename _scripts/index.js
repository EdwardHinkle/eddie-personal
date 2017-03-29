var config = require("./config.json");

var goodreads = require('goodreads');
var gr = new goodreads.client({ key: config.goodreads.key, secret: config.goodreads.secret });
var fs = require("fs");
var request = require("request");
var Promise = require('bluebird');
var md5 = require('md5');
var _ = require('lodash');


gr.getSingleShelf({
    userID: 22018436,
    shelf: 'currently-reading',
    page: 1,
    per_page: 100
}, function(currentlyReading){
    var json = JSON.stringify(currentlyReading.GoodreadsResponse.books[0].book);
    fs.writeFile(__dirname + '/../_source/_data/currently_reading.json', json, 'utf8', function(error){
        if (error != undefined) {
            console.error("OOPS!", error);
        }
        console.log("Currently Reading List Retrieved");
    });
});

gr.getSingleShelf({
    userID: 22018436,
    shelf: 'read',
    page: 1,
    per_page: 4,
    sort: 'date_read'
}, function(recentlyRead){
    var json = JSON.stringify(recentlyRead.GoodreadsResponse.books[0].book);
    fs.writeFile(__dirname + '/../_source/_data/recently_read.json', json, 'utf8', function(error){
        if (error != undefined) {
            console.error("OOPS!", error);
        }
        console.log("Recently Read List Retrieved");
    });
});

request("https://webmention.io/api/mentions?token=" + config.webmention.token, {

}, (err, data) => {
    if (err != undefined) {
        console.log("Error");
        console.log(err);
    }
    
    var webmentions = {};
    var webmentionData = JSON.parse(data.body);

    Promise.each(webmentionData.links, (mention) => {
        var targetPage = mention.target.split("http://eddiehinkle.com").pop().split("?")[0];

        if (webmentions[targetPage] === undefined) {
            webmentions[targetPage] = { likes: [], replies: [], reactions: [], mentions: [] }
        }

        switch(mention.activity.type) {
            case 'like':
                // Check if item exists
                addReplaceOrIgnoreWebMention(webmentions[targetPage].likes, mention);
                break;
            case 'link':
                addReplaceOrIgnoreWebMention(webmentions[targetPage].mentions, mention);
                break;
            case 'reply':
                // At some point this should check the content and if the content is only an emoji, it should add it as a "reaction"
                addReplaceOrIgnoreWebMention(webmentions[targetPage].replies, mention);
                break;
        }
    }).then(() => {
        var json = JSON.stringify(webmentions);
        fs.writeFile(__dirname + '/../_source/_data/webmentions.json', json, 'utf8', function(error){
            if (error != undefined) {
                console.error("OOPS!", error);
            }
            console.log("Webmentions Retrieved");
        }); 
    });
});

function addReplaceOrIgnoreWebMention(current_array, mention) {
    // Find out if item exists in array
    var replaceIndex = _.findIndex(current_array, (object) => {
        return object.data.url == mention.data.url;
    })

    if (replaceIndex == -1) {
        // If item doesn't exist, add it
        current_array.push(mention);
    } else {
        // If item does exist, only add it if it has a date and the date is older than the new item
        if (current_array[replaceIndex].data.published_ts != undefined && current_array[replaceIndex].data.published_ts < mention.data.published_ts) {
            current_array[replaceIndex] = mention;
        }
    }
}


// Get Book Status

// Query this url
//https://www.goodreads.com/user/show/(USERID).xml?key=(KEY)
// parse <user>
// parse <user_statuses>
// parse <user_status> each of these status are the current progress of the current book. 
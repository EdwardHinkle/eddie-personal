var config = require("./config.json");

var goodreads = require('goodreads');
var gr = new goodreads.client({ key: config.goodreads.key, secret: config.goodreads.secret });
var fs = require("fs");
var request = require("request");
var Promise = require('bluebird');
var md5 = require('md5');
var _ = require('lodash');
var emojiData = require('emoji-data');


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
                addOrCreateEmojiArray("+1", webmentions[targetPage].reactions, mention);
                break;
            case 'link':
                if (tryAddEmojiReaction(webmentions[targetPage].reactions, mention) == false) {
                    addReplaceOrIgnoreWebMention(webmentions[targetPage].mentions, mention);
                }
                break;
            case 'reply':
                if (tryAddEmojiReaction(webmentions[targetPage].reactions, mention) == false) {
                    addReplaceOrIgnoreWebMention(webmentions[targetPage].replies, mention);
                }
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

function tryAddEmojiReaction(reactionsArray, mention) {
    var emoji = getEmojiReaction(mention)
    if (emoji == undefined) {
        return false;
    } else {
        addOrCreateEmojiArray(emoji, reactionsArray, mention);
        return true;
    }
}

function addOrCreateEmojiArray(emoji, reactionsArray, mention) {
    var reactionIndex = _.findIndex(reactionsArray, (object) => {
        return object.code == emoji;
    });
    
    if (reactionIndex == -1) {
        reactionsArray.push({
            code: emoji,
            display: "" + emojiData.find_by_short_name(emoji),
            content: []
        });
        reactionIndex = reactionsArray.length-1;
    }
    addReplaceOrIgnoreWebMention(reactionsArray[reactionIndex].content, mention);
}

function getEmojiReaction(mention) {
    var emojiFound = undefined;
    var stripContent = mention.data.content.replace(/<\/?[^>]+(>|$)/g, "").replace(/\n/g, "");
    
    emojiData.scan(stripContent).forEach(
        function(ec) {
            if (stripContent.length < 5) {
                emojiFound = ec.short_name;
            }
        }
    );

    return emojiFound;

}

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
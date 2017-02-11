var goodreads = require('goodreads');
var gr = new goodreads.client({ key: 'KSXzo3GFar32jnjtiVlQjw', secret: 'hP7UPqEHVGUlDEdAd5JiRsiCwBj5OMDqPwe5rZz9o' });
var fs = require("fs");

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

// Get Book Status

// Query this url
//https://www.goodreads.com/user/show/(USERID).xml?key=(KEY)
// parse <user>
// parse <user_statuses>
// parse <user_status> each of these status are the current progress of the current book. 
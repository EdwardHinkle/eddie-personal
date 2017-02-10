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
    fs.writeFile('../_source/_data/currently-reading.json', json, 'utf8', function(){
        console.log("Done");
    });
});

// Get Book Status

// Query this url
//https://www.goodreads.com/user/show/(USERID).xml?key=(KEY)
// parse <user>
// parse <user_statuses>
// parse <user_status> each of these status are the current progress of the current book. 
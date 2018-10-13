var express = require("express");
var db = require("../models");

// Require axios and cheerio to allow scraping
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

module.exports = function(app) {
// A GET route for scraping the NY Times site
app.get("/", function(req, res) {
    // First we grab the body of the html with axios
    axios.get("https://www.nytimes.com/section/technology").then(function(response) {
        // Then we load that into cheerios and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now we grab every h1 tag
        $(".post-title").each(function(i,element) {
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
            .children("a")
            .text();
            result.link = $(this)
            .children("a")
            .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function(dbArticle) {
                    //View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    // If any error occured, send it to the client
                    return res.json(err);
                });
        });
    });

    // If we are able to successfully scrape and save an Article, send a message to the client
    res.render("index");
});




// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function(dbArticle) {
            // If we're able to successfully find Articles
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If error
            res.json(err);
        });
});

// Route for grabbing a specific Article by id
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the parameter, prepare a query
    db.Article.findOne({ _id: req.params.id })
    // .. and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
        // If successfull
        res.json(dbArticle);
    })
    .catch(function(err) {
        // If error
        res.json(err);
    });
});

// Route for saving/updating an Article's associated note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function(dbNote) {
            // If successful
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {note: dbNote._id}, {new: true});
        })
        .then(function(dbArticle) {
            // If successful
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If error
            res.json(err);
        });
});

};
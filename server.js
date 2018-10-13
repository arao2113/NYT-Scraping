// Dependencies
var express =  require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");



// Require all models
var db = require("./models");

var PORT = 8080;

// Initialize Express
var app = express();

// Configure middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

// Make publica a static folder
app.use(express.static("public"));

//

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/nyt", { useNewUrlParser: true});

// Routes
require("./controllers/apiRoutes.js")(app);

// Start the server
app.listen(PORT, function() {
    console.log("Server running on port " + PORT + "!");
});

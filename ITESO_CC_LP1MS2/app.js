// Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stemmer = require('porter-stemmer').stemmer;
var async = require('async');

//Own Modules
var dynamoDbTable = require('./keyvaluestore.js');

// Express
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));

app.use(function(req, res, next) {
    res.setHeader("Cache-Control", "no-cache must-revalidate");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/search/:word', function(req, res) {
  var stemmedword = stemmer(req.params.word).toLowerCase(); //stem the word
  console.log("Stemmed word: "+stemmedword);
  
  var imageurls = []; 
  
  var processData = function(callback) {
      terms.get(stemmedword, function(err, data) { // Begin search
      if (err) {
        console.log("getAttributes() failed: " + err);
        callback(err.toString(), imageurls);
      } else if (data == null) {
        console.log("getAttributes() returned no results");
        callback(undefined, imageurls);
      } else {
        // Iterate through the items and save the urls of the related images
        // in a list.
  	    async.forEach(data, function(attribute, callback) { 
                images.get(attribute.category, function(err, data){
                    if (err) {
                        console.log(err);
                    }
                    imageurls.push(data[0].url);
                    callback();
                 });
          }, function() {
            // One we finished processing the images we use a callback
            // to send the information.
            callback(undefined, imageurls);
          });
     }
    });
  };

  processData(function(err, queryresults) {
    // Callback
    if (err) {
      res.send(JSON.stringify({results: undefined, num_results: 0, error: err}));
    } else {
      res.send(JSON.stringify({results: queryresults, num_results: queryresults.length, error: undefined}));
    }
  });
});

var images = new dynamoDbTable('images');
var terms = new dynamoDbTable('labels');

// Unit tables to be used.
images.init(
    function(){
        terms.init(
            function(){
                console.log("Labels Storage Initialized");
            }
        )
        console.log("Images Storage Initialized");
    }    
);

app.listen(3000, () => console.log(`Server ready`));
module.exports = app;

  var AWS = require('aws-sdk');
  AWS.config.loadFromPath('./config.json');

  var db = new AWS.DynamoDB();

  function keyvaluestore(table) {
    this.LRU = require("lru-cache");
    this.cache = new this.LRU({ max: 500 }); // Add missing new keyword.
    this.tableName = table;
  };
  
  /**
   * Initialize the tables
   * 
   */
  keyvaluestore.prototype.init = function(whendone) {
    
    var tableName = this.tableName;
    var self = this;
    
    var params = {
      TableName: tableName
    }
    
    db.describeTable(params, (err, data) => {
      if(err) {
        console.log(err);
      } else {
        whendone(); //Call Callback function.
      }
    });
    
  };

  /**
   * Get result(s) by key
   * 
   * @param search
   * 
   * Callback returns a list of objects with keys "inx" and "value"
   */
  
keyvaluestore.prototype.get = function(search, callback) {
    var self = this;
    // If we have the request search in cache we do not search again.
    if (self.cache.get(search))
          callback(null, self.cache.get(search));
    else {
      var items = [];
      if(this.tableName == "images") {
        /**
         * Params for the query in the table of images.
         */
        let params = {
          TableName: this.tableName,
          ExpressionAttributeNames: {
            '#keyw': 'keyword',
            '#murl': 'url'
          },
          ExpressionAttributeValues:{
            ":key" : {S: search}
          },
          KeyConditionExpression: '#keyw = :key',
          ProjectionExpression: '#murl,#keyw'
        };
        // Query the images using the params that we defined previuosly.
        db.query(params, (err, data) => {
          if(err) {
            console.log(err);
          } else {
            let items = [];
            data.Items.forEach(item => {
              items.push({
                "keyword": item.keyword.S
                ,"url": item.url.S
              });
            });
            self.cache.set(search,items); // Add search results into the cache.
            callback(null,items);
            };
          }
        );
      } else if (this.tableName == "labels") {
        /**
         * Params for the query in the table of labels.
         */
        var params = {
          TableName: this.tableName,
          ExpressionAttributeNames: {
            '#keyw': 'keyword',
            '#cat': 'category'
          },
          ExpressionAttributeValues:{
            ":key" : {S: search}
          },
          KeyConditionExpression: '#keyw = :key',
          ProjectionExpression: 'inx,#cat,#keyw'
        };
        // Query the labels using the params that we defined previuosly.
        db.query(params, (err, data) => {
          if(err) {
            console.log(err);
          } else {
            let items = [];
            data.Items.forEach(item => {
              items.push({
                "keyword": item.keyword.S
                ,"inx": item.inx.N
                ,"category": item.category.S
              });
            });
            self.cache.set(search,items);
              callback(null,items);
            };
          }
        );
      }
    }
  };

  module.exports = keyvaluestore;

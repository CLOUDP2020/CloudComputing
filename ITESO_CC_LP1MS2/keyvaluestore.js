  var AWS = require('aws-sdk');
  AWS.config.loadFromPath('./config.json');

  var db = new AWS.DynamoDB();

  function keyvaluestore(table) {
    this.LRU = require("lru-cache");
    this.cache = new this.LRU({ max: 500 });
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
    
    if (self.cache.get(search))
          callback(null, self.cache.get(search));
    else {
      var items = [];
      if(this.tableName == "images") {
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
            self.cache.set(search,items);
            callback(null,items);
            };
          }
        );
      } else if (this.tableName == "labels") {
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

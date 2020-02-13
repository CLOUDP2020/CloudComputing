var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var s3 = new aws.S3();

var fileUpload = require('express-fileupload');
router.use(fileUpload());


router.get('/', function(req, res) {
  s3.listBuckets({},function(err,data) {
      if(err) {
          res.render('error', {err})
          return;
      }
      res.render('listBuckets', { buckets: data.Buckets});
  });
});

router.get('/:bucket/', function(req, res) {
     let bucketName = req.params.bucket;
    
     s3.listObjects({Bucket: bucketName},function(err, data) {
        if(err) {
            res.render('error', {err})
            return;
        }
        res.render('bucket', {name: data.Name, bucket: data.Contents})
    });
  });

router.get('/:bucket/:key', function(req, res) {
    let bucketName = req.params.bucket;
    let key = req.params.key;
    let params = {
        Bucket: bucketName,
        Key: key
    };
    
    s3.getObject(params,function(err, data) {
       if(err) {
           res.render('error', {err});
           return;
       }
       res.type(data.ContentType);
       res.send(data.Body);
   });
});


router.post('/', async function(req,res) {
    let bucketName = req.body.bucket;
    console.log(bucketName);
    var params = {
        Bucket: bucketName
    };
    
    s3.createBucket(params, function(err, data) {
        if(err) {
            res.render('error', {err});
            return;
        }
        res.send(data);
    });
});

router.post('/:bucket', function(req,res) {
   let err = {
       code: "error",
       message: "no files sended",
       stack: ""
   }
   if (req.files == undefined) {
       res.render('error', {err});
       return;
   }
    let keys = Object.keys(req.files);
    if (keys.length > 1) {
        err.code = 'Two many files.';
        err.message = 'Such one file upload is supported';
        res.render('error', {err});
        return;
    }
    let bucketName = req.params.bucket;
    let file = req.files[keys[0]];
    let params = {
        Bucket: bucketName,
        Key: file.name,
        Body: file.data
    };
    s3.putObject(params, function(err, data){
        if(err) {
            res.render('error', {err});
            return;
        }
        res.send(data)
    });     
});

module.exports = router;

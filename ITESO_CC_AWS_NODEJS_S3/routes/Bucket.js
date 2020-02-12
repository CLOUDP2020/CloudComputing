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

    /*
     * @TODO - Programa la logica para crear un nuevo objeto.
     * TIPS:
     *  req.files contiene todo los archivos enviados mediante post.
     *  cada elemento de files contiene multiple información algunos campos
     *  importanets son:
     *      data -> Buffer con los datos del archivo.
     *      name -> Nombre del archivo original
     *      mimetype -> tipo de archivo.
     *  el conjunto files dentro del req es generado por el modulo 
     *  express-fileupload
     *  
    */
     
});

module.exports = router;

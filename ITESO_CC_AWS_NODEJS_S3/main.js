var AWS = require('aws-sdk');
var fs = require('fs')
var s3 = new AWS.S3();

uploadBinFile('main.js', 'therealfinalbucket', 'main.js')

function uploadBinFile(path, bucketName, fileName) {
    fs.readFile(path, function(err, data) {
        if(err) {
            throw err;
        }
        let base64 = new Buffer(data, 'binary');
        let params = {
            Bucket: bucketName,
            Key: fileName,
            Body: base64
        };
        s3.putObject(params, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log('File added ' + data.ETag);
            }
        });
    });
}

function getObjetcContent(bucketName, key) {
    let params = {
        Bucket: bucketName,
        Key: key
    };

    s3.getObject(params, function(err, data){
        if (err) {
            console.log(err);
        } else {
            console.log(data);
            console.log(data.Body.toString());
        }
    });
}


function getBuckets() {
    var params = {};

    s3.listBuckets( params, function(err, data) {
        if (err) {
            console.log("ERROR FUNC", err);
        } else {
            console.log(data);
        }
    });
}

function createBucket(bucketName) {
    var params = {
        Bucket: bucketName/*,
        CreateBucketConfiguration: {
            LocationConstraint: 'us-east-1'
        }*/
    };
    
    s3.createBucket(params, function(err, data) {
        var addFile = true;
        if (err) {
            if (err.code == 'BucketAlreadyOwnedByYou') {
                console.log('bucket exits');
            } else {
                console.log(err, err.stack);
                addFile = false
            }
        }
        if (addFile) {
            var params = {
                Bucket: bucketName,
                Key: 'file01.txt',
                Body: 'Hello World aws-sdk s3'
            }
            s3.putObject(params, function(err, data) {
                if(err) {
                    console.log(err, err.stack);
                } else {
                    console.log('File added ' + data.ETag);
                }
            });
        }
    });
}
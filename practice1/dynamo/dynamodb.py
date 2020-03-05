import boto3
from boto3.dynamodb.conditions import Key
import json
import traceback
from .configuration import Config

# If you are using aws educate account you must update your credentials in
# ~/.aws/credentials every 3 hours.
class Dynamodb():
    def __init__(self, path_conf):
        self.conf = Config(path_conf) 
        # Init resource with region in Conf class.
        self.resource =  boto3.resource(
            'dynamodb',
            region_name = self.conf.get_region()
        )

        try:
            self.resource.create_table(
                AttributeDefinitions=[
                    {
                        'AttributeName': 'keyword',
                        'AttributeType': 'S'
                    }
                ],
                TableName='images',
                KeySchema=[
                    {
                        'AttributeName': 'keyword',
                        'KeyType': 'HASH'
                    }
                ],
                ProvisionedThroughput = {
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            )
        except Exception as e:
            print("Exception ocurred creating images table: {}".format(e.__class__.__name__)) 
        else:
            print('Images table created')

        try:
            self.resource.create_table(
                AttributeDefinitions=[
                    {
                        'AttributeName': 'keyword',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'inx',
                        'AttributeType': 'N'
                    }                    
                ],
                TableName='labels',
                KeySchema=[
                    {
                        'AttributeName': 'keyword',
                        'KeyType': 'HASH'
                    },
                    {
                        'AttributeName': 'inx',
                        'KeyType': 'RANGE'
                    }
                ],
                ProvisionedThroughput = {
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            )
        except Exception as e:
            print("Exception ocurred creating labels table: {}".format(e.__class__.__name__)) 
        else:
            print('Labels table created')
        
        self.table_images = self.resource.Table('images')
        self.table_labels = self.resource.Table('labels')

    def get_conf(self):
        return self.conf
    
    def put_image(self, keyword, url):
        try:
            self.table_images.put_item(
                Item = {
                    'keyword': keyword,
                    'url': url
                }
            )
        except Exception as e:
            print("Exception ocurred adding item to images table: {}".format(e.__class__.__name__)) 
        else:
            print('Item added')
    
    def put_label(self, keyword, inx, category):
        try:
            self.table_labels.put_item(
                Item = {
                    'keyword': keyword,
                    'inx': inx,
                    'category': category
                }
            )
        except Exception as e:
            print("Exception ocurred adding item to label table: {}".format(e.__class__.__name__)) 
        else:
            print('Item added')

    def put_images(self, dict_imgs):
        reqs = []
        req = {"images": []}
        i = 0
        for img_key in dict_imgs.keys():
            put_req = {
                'PutRequest': {
                    'Item': {
                        'keyword': img_key,
                        'url': dict_imgs[img_key]
                    }
                }
            }
            
            i+=1
            req['images'].append(put_req)
            # batch_write_item() only supports 25 items per request, we must limit the number of items
            if (i >= 25):
                reqs.append(req)
                req = {"images": []}
                i = 0

        if (len(req['images']) > 0):
            reqs.append(req)
        # TODO: Try to use threads to perform simultaneous calls
        # We have a Queue of request, so we iterate through it and
        # perform all the requests synchronously. 
        for request in reqs:
            self.resource.batch_write_item(RequestItems = request)
        return

    def put_labes(self, dict_labels):
        reqs = []
        req = {"labels": []}
        i = 0
        for label_key in dict_labels.keys():
            put_req = {
                'PutRequest': {
                    'Item': {
                        'keyword': label_key[0],
                        'inx': label_key[1],
                        'category': dict_labels[label_key] 
                    }
                }
            }
            
            i+=1
            req['labels'].append(put_req)
            # batch_write_item() only supports 25 items per request, we must limit the number of items.
            if (i >= 25): 
                reqs.append(req)
                req = {"labels": []}
                i = 0

        if (len(req['labels']) > 0):
            reqs.append(req)

        # TODO: Try to use threads to perform simultaneous calls
        # We have a Queue of request, so we iterate through it and
        # perform all the requests synchronously. 
        for request in reqs:
            self.resource.batch_write_item(RequestItems = request)
        return

    def search(self, keyword):
        res = self.table_labels.query(KeyConditionExpression=Key('keyword').eq(keyword))
        categories = []
        matches = []
        # Fill list of categories that matches with the search keyword.
        for item in res['Items']:
            categories.append(item['category'])
        
        # TODO: Ask if this is the best way to do this.
        # Get all images of the categories fetched previously.
        for cat in categories:
            r = self.table_images.get_item(
                Key = {'keyword': cat},
                AttributesToGet=['url'],
            )
            matches.append(r['Item']['url'])
        return matches
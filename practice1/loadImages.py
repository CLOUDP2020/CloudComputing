import keyvalue.sqlitekeyvalue as KeyValue
import keyvalue.stemmer as Stemmer
from keyvalue.parsetriples import ParseTriples
import time
from dynamo.dynamodb import Dynamodb

# Make connections to KeyValue
kv_labels = KeyValue.SqliteKeyValue("sqlite_labels.db","labels",sortKey=True)
kv_images = KeyValue.SqliteKeyValue("sqlite_images.db","images")

# Process Logic.
parser_images = ParseTriples('keyvalue/images.ttl')
parser_labels = ParseTriples('keyvalue/labels.ttl')

img = parser_images.getNextImage()
label = parser_labels.getNextLabel()

n = 100
dict_imgs = {}
dict_labels = {}
dict_labels_sort = {}
start = time.time()

print("IMAGES")
print("Proccesing...")
i = 0
while(img and len(dict_imgs) < n):
    # Check if the image have not been added and verify the type of relation.
    if(dict_imgs.get(img[0]) == None and img[1] == "http://xmlns.com/foaf/0.1/depiction"):
        dict_imgs[img[0]] = img[2]
    img = parser_images.getNextImage()
    i += 1

print("LABELS")
print("Proccesing...")
i = 0
proccesed_imgs = 0
while(label and proccesed_imgs < n):
    # Check if the current label has a related image in the images dict, if not we don't add the label.
    if (dict_imgs.get(label[0]) and label[1] == 'http://www.w3.org/2000/01/rdf-schema#label'):
        proccesed_imgs += 1
        steam = Stemmer.stem(label[2]).strip()
        steam_keys = steam.split(' ')
        # Create set of steam keys
        # Example: The real value of the money -> {the, real, value, of, money} Prevent duplicate words in category
        set_steam_keys = set()
        for aux in steam_keys:
            set_steam_keys.add(aux)
        # We use two dictionaries: dict_labels_sort and dict_labels.
        # The first one is used to handle duplicate words. For example:
        # We have two categories, North America and South America, wichi are stemmed
        # as the follow: {noth, america}, {south, america}
        # As we notice, we will have the same keyword for two differente categories, so we need
        # to add a sort key. I handle this with a dictionary:
        # For the fisrt category dict_labels_sort will be:
        # {
        #     "america": 0
        # }
        # On the other hand, the second category will use the dict in the follwing state:
        # {
        #     "america": 1
        # }
        for steam_key in set_steam_keys:
            # Update dict_labels_sort
            if (dict_labels_sort.get(steam_key) == None):
                dict_labels_sort[steam_key] = 0
            else:
                dict_labels_sort[steam_key] = dict_labels_sort[steam_key] + 1

            dict_labels[(steam_key, dict_labels_sort[steam_key])] = label[0]
            
    label = parser_labels.getNextLabel()
    i += 1


# Load images and labels in files.
# for img_key in dict_imgs.keys():
#     kv_images.put(img_key, dict_imgs[img_key])

# for label_key in dict_labels.keys():
#     kv_labels.putSort(label_key[0], str(label_key[1]), dict_labels[label_key])

# Dynamodb 
# Init Dynamodb with the configuration file path as attribute.
dy = Dynamodb('C:\\Users\\isaac\\Documents\\Github\\Isaac\\ITESO\\Cloud\\practice1\\dynamo\\config.json')
# Put images and labels on their corresponding table.
dy.put_images(dict_imgs)
dy.put_labes(dict_labels)

end = time.time()
print("Elapsed time  ", str(end-start), " s")

# Close KeyValues Storages
kv_labels.close()
kv_images.close()

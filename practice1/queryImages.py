import keyvalue.sqlitekeyvalue as KeyValue
import keyvalue.parsetriples as ParseTripe
import keyvalue.stemmer as Stemmer
import sys
from dynamo.dynamodb import Dynamodb

# Make connections to KeyValue
                                    # dbfile, table_name, 
kv_labels = KeyValue.SqliteKeyValue("sqlite_labels.db","labels",sortKey=True)
kv_images = KeyValue.SqliteKeyValue("sqlite_images.db","images")

# Process Logic.

dict_search = {}
arguments = len(sys.argv)
d = Dynamodb('C:\\Users\\isaac\\Documents\\Github\\Isaac\\ITESO\\Cloud\\practice1\\dynamo\\config.json')

# Searching using db files.

# if (arguments > 1):
#     for i in range(1, arguments):
#         steam_arg = Stemmer.stem(sys.argv[i])
#         labels = []
#         images = []
#         label_pk = steam_arg
#         label_sort = 0
#         while kv_labels.getSort(label_pk, str(label_sort)):
#             labels.append(kv_labels.getSort(label_pk, str(label_sort)))
#             label_sort += 1
#         for l in labels:
#             images.append(kv_images.get(l))
#         dict_search[steam_arg] = images
#     print(dict_search)
# else:
#     print("Missing arguments..")

# Searching using Dynamodb

if (arguments > 1):
    for i in range(1, arguments):
        steam_arg = Stemmer.stem(sys.argv[i])
        dict_search[steam_arg] = d.search(steam_arg)
    print(dict_search)        
else:
    print("Missing arguments..")

# Close KeyValues Storages
kv_labels.close()
kv_images.close()

Documentation
GET /api/v1/search_tree
Reply should be a json tree. 
Example:
[
    {
        "name": "root", 
        "children": [
            {
                "children": [], 
                "name": "size", 
                "min": 1, 
                "max": 1000000, 
                "interval": true, 
                "type": "number", 
                "id": 1, 
                "example": 50
            }, 
            {
                "children": [], 
                "type": "string", 
                "id": 2, 
                "name": "mime_type", 
                "example": "application/x-bsh"
            }, 
            {
                "children": [
                    {
                        "children": [], 
                        "type": "checkbox", 
                        "id": 4, 
                        "name": "kernel32.dll"
                    }
                ], 
                "id": 3, 
                "name": "imports"
            }
        ]
    }
]
--------------------
GET http://localhost:8080/api/v1/search?callback=angular.callbacks._0&data=1%3D50%264%3Dtrue
data variable is a series of id's and variables:
1=50&4=true
The reply should be a list of hashes in JSONP format like this:
angular.callbacks._0([{
    "status": "OK", 
    "data": [
        "2fa9672b7507f0e983897cfd18b24d3810bb2160", 
        "hashfile2"
    ]
}]);
---------------------
GET http://localhost:8080/api/v1/metadata?file_hash=2fa9672b7507f0e983897cfd18b24d3810bb2160
The reply is a json tree with the file structure.

{
    "hash": {
        "sha2": "4c1975b445ee45c30a280782404bf2aa5b10b2bc90ff36d8e9a6b11023b5d837", 
        "sha1": "2fa9672b7507f0e983897cfd18b24d3810bb2160", 
        "md5": "d3f1d5e41455f0045cf41c123348a770"
    }, 
    "description": "HTML document, UTF-8 Unicode text, with very long lines, with CRLF, LF line terminators", 
    "particular_header": {}, 
    "fuzzy_hash": "384:JX6ofmALWDdq2a9u5TWIhmJk95MJ8nWfuTdLH+8q/ZUUNXH+nZrYL:4ofSDxikmS9TnWfue8qB+nZrYL", 
    "size": 20859, 
    "mime_type": "text/html", 
    "file_id": "2fa9672b7507f0e983897cfd18b24d3810bb2160"
}
---------------------------
GET http://localhost:8080/api/v1/logs
The reply is in array jsons
[{"datetime": "2016-06-06 14:04", "hash": "a2fa9672b7507f0e983897cfd18b24d3810bb216"},
{"datetime": "2016-06-06 15:04", "hash": "a2fa9672b7507f0e983897cfd18b24d3810bb216"}]

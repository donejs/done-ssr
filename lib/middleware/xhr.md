### Server -> Client


Cookies are only on a raw http response IF the server updated or created them during the request like so:

```
HTTP/1.1 200 OK
X-Powered-By: Express
set-cookie: testHTTPONLY=87; Max-Age=900; Path=/; Expires=Fri, 19 Feb 2016 14:13:11 GMT; HttpOnly
set-cookie: test2=11; Max-Age=900; Path=/; Expires=Fri, 19 Feb 2016 14:13:11 GMT
set-cookie: connect.sid=s%3AfKbjY9Uy8M4E7Qs9ERU1NtHy6Z_TsCjy.64IN0pnrAdpoKDPrZasDyjomq57GxcqOtofcA5YAjug; Path=/; HttpOnly
Content-Type: text/html; charset=utf-8
Content-Length: 3660
ETag: W/"vojxRoHVYHVnAwyNy2ZUAQ=="
Date: Fri, 19 Feb 2016 13:58:11 GMT
Connection: keep-alive
```

They can be read on the express response object like this:

```
RespObj = {
    _headers: {
        'set-cookie': ['testHTTPONLY=87; Max-Age=900; Path=/; Expires=Fri, 19 Feb 2016 14:13:11 GMT; HttpOnly',
            'test2=11; Max-Age=900; Path=/; Expires=Fri, 19 Feb 2016 14:13:11 GMT',
            'connect.sid=s%3AfKbjY9Uy8M4E7Qs9ERU1NtHy6Z_TsCjy.64IN0pnrAdpoKDPrZasDyjomq57GxcqOtofcA5YAjug; Path=/; HttpOnly'
        ]
    }
}
```

"set-cookie" will only be an array if there is more than one, otherwise it's a string.

Any cookie that is flagged 'HttpOnly' is inaccessable from JavaScript in modern browsers but it is still stored in the browser and the key=value of those cookies is still sent with requests.



### Client -> Server

All active cookies are on the raw http request but it's only their key=value pairs; The other information is not sent:

```
GET /players HTTP/1.1
Host: localhost:5000
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36
Accept-Encoding: gzip, deflate, sdch
Accept-Language: en-US,en;q=0.8
Cookie: test1=0; testHTTPONLY=87; test2=11; connect.sid=s%3AWDhHXtizN4kCsPRslGJbteG_9FCm9mhN.%2BVCJdldBBSw8F1QwU%2FppaTYbACyfnNEb2aS%2BSBf0sko
```

The request cookies even include the key value pairs of HttpOnly cookies even though `document.cookie -> "test1=0; test2=11"`.

They can be read on the express request object like this:

```
ReqObj = {
  headers: {
    cookie: 'test1=0; testHTTPONLY=87; test2=11; connect.sid=s%3AWDhHXtizN4kCsPRslGJbteG_9FCm9mhN.%2BVCJdldBBSw8F1QwU%2FppaTYbACyfnNEb2aS%2BSBf0sko'
  }
}
```

If you `$ npm install cookie-parser --save` and set up the server to use it:

```
var cookieParser = require('cookie-parser');
app.use( cookieParser() );
```

Then you can also access the cookies like so:

```
ReqObj = {
  cookies: {
    test1: '0',
    testHTTPONLY: '87',
    test2: '11',
    'connect.sid': 's:fKbjY9Uy8M4E7Qs9ERU1NtHy6Z_TsCjy.64IN0pnrAdpoKDPrZasDyjomq57GxcqOtofcA5YAjug'
  }
}
```

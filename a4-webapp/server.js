var http = require('http'),
    qs = require('querystring'),
    fs = require('fs'),
    url = require('url'),
    port = 8080,
    mongo = require('mongodb'),
    assert = require('assert');

var mongoClient = mongo.MongoClient;
const dbUri = "mongodb+srv://YifeiJin:Jyf85603631@cluster0-ladso.mongodb.net/test?retryWrites=true";
const dbName = 'a4-data';
const collectionName = 'reservation';


var server = http.createServer(function (req, res) {
    var uri = url.parse(req.url);

    if (req.method === "GET") {
        switch (uri.pathname) {
            case '/':
                sendFile(res, 'public/index.html');
                break;
            case '/data':
                var resultArray = [];
                var resultObject = {};

                mongoClient.connect(dbUri, {
                    useNewUrlParser: true
                }, function (err, client) {
                    assert.equal(err, null);

                    var cursor = client.db(dbName).collection(collectionName).find();
                    cursor.forEach(function (doc, err) {
                        assert.equal(err, null);
                        resultArray.push(doc)
                    }, function () {
                        client.close();
                        resultObject.reserv = resultArray;
                        res.end(JSON.stringify(resultObject, null, 4));
                    })
                });
                break;

            case '/menu':
                sendFile(res, 'public/menu.html');
                break;
            case '/reservation':
                sendFile(res, 'public/reservation.html');
                break;
            default:
                res.end('404 not found')
        }
    } else if (req.method === "POST") {
        switch (uri.pathname) {
            case '/add':
                handleAdd(res, req);
                break;
            default:
                res.end('404 not found')
        }
    } else {
        res.end('405 Method Not Supported')
    }
});

server.listen(process.env.PORT || port);
console.log('listening on 8080');

// subroutines
// NOTE: this is an ideal place to add your data functionality

function handleAdd(res, req) {
    var postdata = '';

    req.on('data', function (d) {
        postdata += d
    });
    req.on('end', function () {
        var aRecord = qs.parse(postdata);
        console.log(aRecord)
        if(aRecord.time == ''){
            return
        }
        var timeString = '0'.concat(aRecord.time.substr(0,1), ':', aRecord.time.substr(1,2), ':00 PM');
        console.log(timeString)
        var dateString = aRecord.date.concat(' ', timeString);

        var dateVal = new Date(dateString);
        console.log(dateString);        
        console.log(dateVal);
        console.log(dateVal.getUTCHours()-4 -12); // EST Hours 
        console.log(dateVal.getUTCMinutes()); // EST Minutes
        console.log(dateVal.getUTCSeconds()); // EST Seconds

        var item = {
            party_size: aRecord.people,
            name: aRecord.name,
            phone: parseInt(aRecord.phone),
            date: dateVal
        };

        mongoClient.connect(dbUri, {
            useNewUrlParser: true
        }, function (err, client) {
            assert.equal(err, null);

            client.db(dbName).collection(collectionName).insertOne(item, function (err) {
                assert.equal(err, null);
                client.close();
            })
        })
    });

    sendFile(res, 'public/index.html')
}


function sendFile(res, filename, contentType) {
    contentType = contentType || 'text/html';

    fs.readFile(filename, function (error, content) {
        res.writeHead(200, {
            'Content-type': contentType
        });
        res.end(content, 'utf-8');
    })

}

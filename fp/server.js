var fs = require('fs'),
    qs = require('querystring'),
    mongo = require('mongodb'),
    assert = require('assert'),
    express = require('express'),
    session = require('express-session'),
    md5 = require('md5');


var mongoClient = mongo.MongoClient;
const dbUri = "mongodb+srv://YifeiJin:Jyf85603631@cluster0-ladso.mongodb.net/test?retryWrites=true";
const dbName = 'fp-data';
const collectionName = 'userInfo';

var app = express();
app.use(session({
    secret: 'cookie'
    // resave: true,
    // saveUninitialized: true
}))

app.get('/', function (req, res) {
    if (req.session.userName) {
        res.redirect('/main')
    } else {
        sendFile(res, 'public/index.html');
    }
})

app.get('/data', function (req, res) {
    var resultArray = [];
    var resultObject = {};
    var theusername = req.session.userName;

    mongoClient.connect(dbUri, {
        useNewUrlParser: true
    }, function (err, client) {
        assert.equal(err, null);

        client.db(dbName).collection(collectionName).findOne({userName: theusername}, function(err, result){
            assert.equal(err, null);
            resultArray.push(result);
            resultObject = resultArray[0];
            res.end(JSON.stringify(resultObject, null, 4));
        })
        client.close();
    })
})

app.post('/add', function (req, res) {
    console.log("come in")
    var postdata = '';

    req.on('data', function (d) {
        postdata += d
    });
    req.on('end', function () {
        var aMessage = qs.parse(postdata);
        // console.log(aMessage)
        theusername = req.session.userName;

        var msgItem = {
            date: aMessage.date,
            location: aMessage.place,
            content: aMessage.content,
        };

        var resultArray = [];
        var resultObject = {};

        var yo;
        mongoClient.connect(dbUri, { useNewUrlParser: true }, function (err, client) {
            assert.equal(err, null);


            client.db(dbName).collection(collectionName).findOne({ userName: theusername }, function (err, result) {
                assert.equal(err, null);
                console.log(result);
                resultArray.push(result);
                console.log(resultArray[0].data);
                console.log(msgItem);
                resultArray[0].data.push(msgItem);
                // console.log(resultArray[0]);
                client.db(dbName).collection(collectionName).updateOne({ userName: theusername }, { $set: resultArray[0] }, function (err) {
                    assert.equal(err, null);
                    client.close();
                })
            })
        });


        sendFile(res, 'public/main.html')
        // location.replace()
        // res.redirect('index.html')
    })
})

app.get('/main', function (req, res) {
    if (req.session.userName) {
        sendFile(res, 'public/main.html');
    } else {
        res.write('<h1>Please login first</h1>');
        res.write('<a href="/">Login</a>');
        res.end()
    }
})


app.post('/signup', function (req, res) {
    var postdata = "";

    req.on('data', function (d) {
        postdata += d;
    }).on('end', function () {
        postdata = JSON.parse(postdata);

        var item = {
            userName: postdata.username,
            password: md5(postdata.password),
            data: []
        };

        mongoClient.connect(dbUri, {
            useNewUrlParser: true
        }, function (err, client) {
            assert.equal(err, null);

            // if the user already exists
            var query = {
                userName: item.userName
            }

            client.db(dbName).collection(collectionName).findOne(query, function (err, result) {
                assert.equal(err, null);

                if (!result) {
                    client.db(dbName).collection(collectionName).insertOne(item, function (err) {
                        assert.equal(err, null);
                        req.session.userName = item.userName;
                        req.session.password = item.password;
                        res.redirect('/');
                    })
                } else {
                    res.end("User Already Exists!");
                }

                client.close();
            })

        })
    })
})

app.post('/login', function (req, res) {
    var postdata = "";

    req.on('data', function (d) {
        postdata += d;
    }).on('end', function () {
        console.log(postdata)
        postdata = JSON.parse(postdata);

        var name = postdata.username;
        var password = md5(postdata.password);
        console.log(name);
        console.log(password);

        mongoClient.connect(dbUri, {
            useNewUrlParser: true
        }, function (err, client) {
            assert.equal(err, null);

            var query = {
                userName: name,
                password: password
            }

            client.db(dbName).collection(collectionName).findOne(query, function (err, result) {
                if (result) {
                    req.session.userName = name;
                    req.session.password = password;
                    res.redirect('/');
                } else {
                    res.end('Incorrect Username or Password!');
                }
            })
        })
    })
})

app.post('/logout', function (req, res) {
    // destroy the session if the user logs out
    req.session.destroy(function (err) {
        assert.equal(err, null);
        res.redirect('/');
    })
})

app.listen(process.env.PORT || 8080, function () {
    console.log("App Started on port 8080");
})

function sendFile(res, filename, contentType) {
    contentType = contentType || 'text/html';

    fs.readFile(filename, function (error, content) {
        res.writeHead(200, {
            'Content-type': contentType
        });
        res.end(content, 'utf-8');
    })

}

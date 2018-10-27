var http = require('http')
	, qs = require('querystring')
	, fs = require('fs')
	, url = require('url')
	, port = 8080
	, mongo = require('mongodb')
	, assert = require('assert');

var mongoClient = mongo.MongoClient;
const dbUri = "mongodb+srv://YifeiJin:Jyf85603631@cluster0-ladso.mongodb.net/test?retryWrites=true";
const dbName = 'a3-data';
const collectionName = 'data';


var server = http.createServer(function (req, res) {
	var uri = url.parse(req.url);

	// connect to mongodb

	if (req.method === "GET") {
		switch (uri.pathname) {
			case '/':
				sendFile(res, 'public/index.html');
				break;
			case '/index.html':
				sendFile(res, 'public/index.html');
				break;
			case '/data':
				var resultArray = [];
				var resultObject = {};

				mongoClient.connect(dbUri, {useNewUrlParser: true}, function (err, client) {
					assert.equal(err, null);

					var cursor = client.db(dbName).collection(collectionName).find();
					cursor.forEach(function (doc, err) {
						assert.equal(err, null);
						resultArray.push(doc)
					}, function () {
						client.close();
						resultObject.food = resultArray;
						res.end(JSON.stringify(resultObject, null, 4));
					})
				});
				break;

			case '/css/style.css':
				sendFile(res, 'public/css/style.css', 'text/css');
				break;
			case '/js/scripts.js':
				sendFile(res, 'public/js/scripts.js', 'text/javascript');
				break;
			default:
				res.end('404 not found')
		}
	}

	else if (req.method === "POST") {
		switch (uri.pathname) {
			case '/add':
				handleAdd(res, req);
				break;
			case '/delete':
				handleDelete(res, req);
				break;
			case '/edit':
				handleEdit(res, req);
				break;
			default:
				res.end('404 not found')
		}
	}

	else {
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
		var aFood = qs.parse(postdata);

		var item = {
			foodName: aFood.name,
			originalCity: aFood.city,
			spiciness: aFood.spiciness,
			normalPrice: aFood.price
		};

		mongoClient.connect(dbUri, {useNewUrlParser: true}, function (err, client) {
			assert.equal(err, null);

			client.db(dbName).collection(collectionName).insertOne(item, function (err) {
				assert.equal(err, null);
				client.close();
			})
		})
	});

	sendFile(res, 'public/index.html')
}

function handleDelete(res, req) {
	var postdata = '';

	req.on('data', function (d) {
		postdata += d
	});

	req.on('end', function () {
		var aFood = qs.parse(postdata);

		mongoClient.connect(dbUri, {useNewUrlParser: true}, function (err, client) {
			assert.equal(err, null);

			client.db(dbName).collection(collectionName).deleteOne({foodName:aFood.name}, function (err) {
				assert.equal(err, null);
				client.close();
			})
		})
	});

	sendFile(res, 'public/index.html')
}

function handleEdit(res, req) {
	var postdata = '';

	req.on('data', function (d) {
		postdata += d
	});

	req.on('end', function () {
		var aFood = qs.parse(postdata);

		var item = {
			foodName: aFood.name,
			originalCity: aFood.city,
			spiciness: aFood.spiciness,
			normalPrice: aFood.price
		};

		mongoClient.connect(dbUri, {useNewUrlParser: true}, function(err, client) {
			assert.equal(err, null);

			client.db(dbName).collection(collectionName).updateOne({foodName: aFood.ON}, {$set: item}, function (err) {
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
		res.writeHead(200, {'Content-type': contentType});
		res.end(content, 'utf-8');
	})

}

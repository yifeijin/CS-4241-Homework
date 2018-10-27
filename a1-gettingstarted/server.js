var http = require('http')
	, fs   = require('fs')
	, url  = require('url')
	, port = 8080
	, MongoClient = require('mongodb').MongoClient;

var server = http.createServer (function (req, res) {
	var uri = url.parse(req.url)

	switch( uri.pathname ) {
		case '/':
			sendFile(res, 'index.html')
			break
		case '/index.html':
			sendFile(res, 'index.html')
			break
		default:
			res.end('404 not found')
	}
})

server.listen(process.env.PORT || port);
console.log('listening on 8080')

// subroutines

function sendFile(res, filename) {

	fs.readFile(filename, function(error, content) {
		res.writeHead(200, {'Content-type': 'text/html'})
		res.end(content, 'utf-8')
	})

}

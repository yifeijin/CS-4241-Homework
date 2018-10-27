var http = require('http')
    , qs = require('querystring')
    , fs = require('fs')
    , url = require('url')
    , port = 8080;

var server = http.createServer(function (req, res) {
    var uri = url.parse(req.url)

    console.log("hello")

    if (req.method === "GET") {
        switch (uri.pathname) {
            case '/':
                sendFile(res, 'public/index.html')
                break
            case '/index.html':
                sendFile(res, 'public/index.html')
                break
            case '/data':
                handleShow(res, 'food.json')
                break
            case '/css/style.css':
                sendFile(res, 'public/css/style.css', 'text/css')
                break
            case '/js/scripts.js':
                sendFile(res, 'public/js/scripts.js', 'text/javascript')
                break
            default:
                res.end('404 not found')

        }
    }

    else if (req.method === "POST") {
        switch (uri.pathname) {
            case '/add':
                handlePost(res, req)
                break
            case '/delete':
                handleDelete(res, req)
                break
            case '/edit':
                handleEdit(res, req)
                break
            default:
                res.end('404 not found')
        }
    }

    else {
        res.end('405 Method Not Supported')
    }
})

server.listen(process.env.PORT || port);
console.log('listening on 8080')

// subroutines
// NOTE: this is an ideal place to add your data functionality

function handleShow(res, file) {
    fs.readFile(file, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            // var dataStr = data.toString()
            var foods = JSON.parse(data)
            res.writeHead(200)
            res.end(JSON.stringify(foods, null, 4))
        }
    })
}

function handleEdit(res, req) {
    var postdata = ''

    req.on('data', function (d) {
        postdata += d
    })

    req.on('end', function () {
        var foodEdit = qs.parse(postdata)

        fs.readFile('food.json', function (err, data) {
            if (err) {
                console.log(err)
            } else {
                var obj = JSON.parse(data)
            }

            for (i in obj.food) {
                if (obj.food[i].foodName === foodEdit.ON) {
                    obj.food.splice(i, 1)
                }
            }

            console.log(foodEdit)
            

            obj.food.push({
                "foodName": foodEdit.name,
                "OriginalCity": foodEdit.city,
                "spiciness": checkSpici(foodEdit.spiciness),
                "NormalPrice": foodEdit.price,
                "range": calculateRange(parseInt(foodEdit.price))
            }) 

            var json = JSON.stringify(obj, null, 4)
            fs.writeFile('food.json', json, function (err) {
                if (err) console.log(err)
            })
        })
    })

    sendFile(res, 'public/index.html')
}

function handleDelete(res, req) {
    var postdata = ''

    req.on('data', function (d) {
        postdata += d
    })

    req.on('end', function () {
        var foodDelete = qs.parse(postdata)

        fs.readFile('food.json', function (err, data) {
            if (err) {
                console.log(err)
            } else {
                var obj = JSON.parse(data)
            }

            for (i in obj.food) {
                if (obj.food[i].foodName === foodDelete.name) {
                    obj.food.splice(i, 1)
                }
            }

            var json = JSON.stringify(obj, null, 4)
            fs.writeFile('food.json', json, function (err) {
                if (err) console.log(err)
            })
        })
    })

    sendFile(res, 'public/index.html')
}

function handlePost(res, req) {
    var postdata = ''
    req.on('data', function (d) {
        postdata += d
    })

    req.on('end', function () {
        var aFood = qs.parse(postdata)

        fs.readFile('food.json', function (err, data) {
            if (err) {
                console.log(err)
            } else {
                var obj = JSON.parse(data)
            }

            obj.food.push({
                "foodName": aFood.name,
                "OriginalCity": aFood.city,
                "spiciness": checkSpici(aFood.spiciness),
                "NormalPrice": aFood.price,
                "range": calculateRange(parseInt(aFood.price))
            })

            var json = JSON.stringify(obj, null, 4)
            fs.writeFile('food.json', json, function (err) {
                if (err) console.log(err)
            })
        })
    })

    sendFile(res, 'public/index.html')
}

function sendFile(res, filename, contentType) {
    contentType = contentType || 'text/html';

    fs.readFile(filename, function (error, content) {
        res.writeHead(200, { 'Content-type': contentType })
        res.end(content, 'utf-8')
    })

}

// Check if spiciness input is a valid number from 0-5
function checkSpici(spici){
    if (spici <=5 && spici >=0){
        return spici
    }else return "invalid spiciness input!"
}

// Show dollar sign for price, if price is invalid, show error input
function calculateRange(price){
    if(price <= 10 && price >= 1){
        return "$"
    }else if(price <= 30 && price > 10){
        return "$$"
    }else if(price <=50 && price > 30){
        return "$$$"
    }else if(price <= 100 && price > 50){
        return "$$$$"
    } else return "invalid price input!"
}


var express = require('express');
var app = express();

require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', 'views'); 

app.get('/', function(req, res) {
    res.render('view', {
        appkey : process.env.appkey
    });
})

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listening at http://%s:%s", host, port);
})
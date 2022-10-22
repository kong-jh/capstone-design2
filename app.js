var express = require('express');
var app = express();

// env file
require('dotenv').config();

// MVC - ejs
app.set('view engine', 'ejs');
app.set('views', 'views'); 

//mysql
var mysql = require('mysql');
const password = process.env.DATABASE_PASSWORD;
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'nodeuser',
    password: password,
    database: 'mobility',
    port : 3306
});
connection.connect();


app.get('/', function(req, res) {
    res.render('view', {
        appkey : process.env.appkey
    });
})

app.get('/bike', (req, res) => {
    var sql = 'select id, name, lat, lon from bike3';
    connection.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('error');
      }
      res.render('bike_view', {appkey : process.env.appkey, results:results});
    });
  });

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listening at http://%s:%s", host, port);
})
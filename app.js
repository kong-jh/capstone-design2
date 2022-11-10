var express = require('express');
var app = express();
var request = require('request');

var axios = require('axios');

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// env file
require('dotenv').config();

// MVC - ejs
app.set('view engine', 'ejs');
app.set('views', 'views'); 

//mysql
var mysql = require('mysql');
const { response } = require('express');
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

app.get('/bikeapi', (req, res) => {
  var api_url1 = 'http://openapi.seoul.go.kr:8088/52477357596b6a6831367345684774/json/bikeList/1/1000/';
  var api_url2 = 'http://openapi.seoul.go.kr:8088/52477357596b6a6831367345684774/json/bikeList/1001/2000/';

  axios
    .all([axios.get(api_url1), axios.get(api_url2)])
    .then(
      axios.spread((res1, res2) => {
        //console.log(res1, res2);
        //console.log(res1.data.rentBikeStatus.row);
        var res3 = [...res1.data.rentBikeStatus.row, ...res2.data.rentBikeStatus.row];
        //console.log(res3);
        res.render('api_view', {appkey:process.env.appkey, locations:res3})
      })
    )
    .catch((err) => console.log(err));
})

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listening at http://%s:%s", host, port);
})
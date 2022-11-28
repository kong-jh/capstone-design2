var express = require('express');
var app = express();
var request = require('request');
const spawn = require('child_process').spawn;
var axios = require('axios');

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
  const key = process.env.weatherkey;
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var date = today.getDate();
  var hours = ('0'+(today.getHours()-1)%24).slice(-2);

  axios.get("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey="+key+"&dataType=JSON&base_date="+year+month+date+"&base_time="+hours+"00&nx=60&ny=127")
  .then(function(response) {
    console.log(response);
    console.log(response.data.response.body.items.item);
    var tmp = response.data.response.body.items.item[3].obsrValue;
    var hum = response.data.response.body.items.item[1].obsrValue;
    var wind = response.data.response.body.items.item[7].obsrValue;
    var prec = response.data.response.body.items.item[2].obsrValue;

    var sql = 'select id, name, lat, lon from bike3';

    connection.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('error');
      }
      res.render('view', {appkey:process.env.appkey, results:results, tmp:tmp, hum:hum, wind:wind, prec:prec});
    });
  })
  .catch(function(error) {
    console.log(error);
  });
})

app.get('/predict', (req, res) => {
    var sql = 'select id, name, lat, lon from bike3';
    connection.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('error');
      }
      res.render('bike_view', {appkey : process.env.appkey, results:results});
    });
  });

app.get('/bikestatus', (req, res) => {
  var bikekey = process.env.bikekey;
  var api_url1 = 'http://openapi.seoul.go.kr:8088/'+bikekey+'/json/bikeList/1/1000/';
  var api_url2 = 'http://openapi.seoul.go.kr:8088/'+bikekey+'/json/bikeList/1001/2000/';
  var api_url3 = 'http://openapi.seoul.go.kr:8088/'+bikekey+'/json/bikeList/2001/3000/';

  axios
    .all([axios.get(api_url1), axios.get(api_url2), axios.get(api_url3)])
    .then(
      axios.spread((res1, res2, res3) => {
        //console.log(res1, res2);
        //console.log(res1.data.rentBikeStatus.row);
        var locations = [...res1.data.rentBikeStatus.row, ...res2.data.rentBikeStatus.row, ...res3.data.rentBikeStatus.row];
        //console.log(res3);
        res.render('api_view', {appkey:process.env.appkey, locations:locations})
      })
    )
    .catch((err) => console.log(err));
});

app.get('/predict/:id/:hour', (req, res) => {
  var id = req.params.id;
  var hour = req.params.hour;
  const bikekey = process.env.bikekey;
  const weatherkey = process.env.weatherkey;

  // today
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var date = today.getDate();
  var day = (today.getDay() -1)%7;
  var hours = ('0'+(today.getHours()-1)%24).slice(-2);
  console.log('day', year,month,date);
  console.log('time', hours+'00');

  // weather
  var weather_url = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey="+weatherkey+"&pageNo=1&numOfRows=1000&dataType=JSON&base_date="+year+month+date+"&base_time="+hours+"30&nx=61&ny=127";
  var bike_url1 = 'http://openapi.seoul.go.kr:8088/'+bikekey+'/json/bikeList/1/1000/';
  var bike_url2 = 'http://openapi.seoul.go.kr:8088/'+bikekey+'/json/bikeList/1001/2000/';
  var bike_url3 = 'http://openapi.seoul.go.kr:8088/'+bikekey+'/json/bikeList/2001/3000/';

  axios
    .all([axios.get(weather_url), axios.get(bike_url1), axios.get(bike_url2), axios.get(bike_url3)])
    .then(
      axios.spread((res1, res2, res3, res4) => {
        //weather, bike API
        var result = res1.data.response.body.items.item;
        //var weathers  = weather_extract(result, today.getHours());
        var weather = weather_time(result, ('0'+(today.getHours()+Number(hour))%24).slice(-2)+"00", month);
        console.log(weather);

        var locations = [...res2.data.rentBikeStatus.row, ...res3.data.rentBikeStatus.row, ...res4.data.rentBikeStatus.row];
        //console.log(locations);
        var bike = locations.filter(function(e) {
          return e.stationName == id;
        })[0].parkingBikeTotCnt;
        
        // predict : weather -> predict.py => (bike) - (result)
        const python = spawn('python', ['predict.py', id, day, weather]);
        python.stdout.on('data', function(data) {
          var result = data.toString().split('\n')[2];
          console.log(result);
          if (bike - result < 0) {
            result = 0;
          } else {
            result = bike - result;
          }
          res.render('predict_view', {id:id, hour:hour, result:result});
        });

        python.stderr.on('data', function(data){
          console.log(data.toString());
        });
      })
    )
    .catch((err) => console.log(err));
});

function weather_time(data, fcsttime, month){
  var json = data.filter(function(e){
    return e.fcstTime == fcsttime;
  });
  if (json[2].fcstValue == "강수없음"){
    json[2].fcstValue = 0;
  }
  return [month, fcsttime, json[4].fcstValue, json[8].fcstValue, json[9].fcstValue, json[2].fcstValue, json[5].fcstValue];
}

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listening at http://%s:%s", host, port);
});
// Donkey Telemetry v3 Server Side
//   for AWS IoT Core
// server_aws.js
// please rename to server.js
// where your node app starts

var fs = require('fs');

// 最新のイメージデータ
let image;

// express
const express = require('express');
const app = express();
const server = app.listen(3000, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static('public'));

// ルートディレクトリを指定した場合
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


// 最新のイメージデータを返信
app.post('/image', function(req, res) {
    if(image) {
      // バイナリのまま返信
      console.log("send image");
      res.writeHead(200, {"Content-Type": "image/jpeg"});
      console.log(image);
      res.write(image);
      res.end();
      //res.send(image);
    }
});


// 最新のスロットル値・アングル値JSON
let msg = {
	"throttle":	0.0,
	"angle":	0.0,
	"timestamp":	"" }

// スロットル値・アングル値JSONデータを返信
app.post('/telem', function(req, res) {
    if(msg) {
        // return latest donkey car data
        res.send(msg);
    } else {
        res.status(404).send();
    }
});

// AWS IoT Core オブジェクト生成
var awsIot = require('aws-iot-device-sdk');

// AWS IoT Core 接続デバイス生成
var device = awsIot.device({
  keyPath: process.env.PRIVATE_KEY_PATH,
 certPath: process.env.CERT_PATH,
   caPath: process.env.CA_PATH,
 clientId: process.env.CLIENT_ID,
     host: process.env.ENDPOINT
});

// 接続時処理
device.on('connect', function() {
  console.log('connect');
  device.subscribe(process.env.SUBSCRIBE_TOPIC);
});

// メッセージ受信時処理
device.on('message', function(topic, payload) {
  console.log('message', topic, payload.toString());
  if(topic.endsWith("image")){
    image = payload;
    console.log("[on message] update image");
  }else{
    if(topic.endsWith("/tub/json")){
      // メータ定義域にあわせて値を調整
      let message = JSON.parse(payload.toString());
      console.log("json_messate=" + message)
      let throttle = ((message["user/throttle"] - (-1.0))/2.0)*100.0;
      let angle = message["user/angle"] * 50.0;
      message.throttle = throttle;
      message.angle = angle
      msg = message;
      console.log("[on message] update msg "+ msg)
    }else if(topic.endsWith("/tub/image")){
      image = payload;
      console.log("[on deviceEvent] update image")
    }else{
        console.log("[on message] ignore topic:" + topic)
    }
  }
//  if(format=="image"){
//    image = payload;
//    console.log("[on deviceEvent] update image");
//  }else{
//    // メータ定義域にあわせて値を調整
//    let message = JSON.parse(payload.toString());
//    let throttle = ((message.throttle - (-1.0))/2.0)*100.0;
//    let angle = message.angle * 50.0;
//    message.throttle = throttle;
//    message.angle = angle
//    msg = message;
//    console.log("[on deviceEvent] update msg "+ msg)
//  }
});

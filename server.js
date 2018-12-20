// Donkey Telemetry v3 Server Side
// server.js
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

// MQTT クライアント生成
const Client = require("ibmiotf");

// IoTP アプリケーション設定
// .env を確認のこと
const appClientConfig  = {
  "org": process.env.ORG_ID,
  "id": process.env.APP_ID,
  "auth-key": process.env.API_KEY,
  "auth-token": "hZo(hjxEu@&fxK*7XW"
}

// アプリケーション設定をセット
let appClient = new Client.IotfApplication(appClientConfig);
appClient.connect();

// IBM Watson IoT Platform ライブラリ詳細ログ表示
// trace, debug, info, warn, errorのいずれかを指定
//appClient.log.setLevel('trace');

// クライアントとブローカが接続したとき
appClient.on("connect", function () {
  console.log("[on connect] start");
  // json/image 両方取得
  appClient.subscribeToDeviceEvents("donkeycar","emperor", "status", "+");
});

// エラー発生時処理
appClient.on("error", function (err) {
  console.log("[on error] Error : "+err);
});

// デバイスイベント受信時処理
appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
  console.log("[on deviceEvent] "+deviceType+" : "+deviceId+" of event "+eventType);
  console.log("[on deviceEvent] format :" + format);
  if(format=="image"){
    image = payload;
    console.log("[on deviceEvent] update image");
  }else{
    // メータ定義域にあわせて値を調整
    let message = JSON.parse(payload.toString());
    let throttle = ((message.throttle - (-1.0))/2.0)*100.0;
    let angle = message.angle * 50.0;
    message.throttle = throttle;
    message.angle = angle
    msg = message;
    console.log("[on deviceEvent] update msg "+ msg)
  }
});

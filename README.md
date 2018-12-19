# Donkey Telemetry v3

Donkey Car上のパーツからMQTTブローカへ送信されているデータを可視化する。



## 表示データ

![表示例](./assets/meter.png)

- （左）ステアリング値
   ステアリングを最左(-50) から最右(+50)までのアナログメータで表現する。正面は0を示す。入力デバイスにより-50,0,50しかとらない場合がある。
- （中央）画像イメージ
   最新のカメライメージ画像。静止画像である。
- （右）スロットル値
   スロットルレベルを最大100から速度0までで表現している。

## アーキテクチャ

![アーキテクチャ](./assets/architecture.png)

MQTTをハブとした非同期通信で実現している。

- [Donkey Car](http://donkeycar.com)
   自律走行をRaspberryPiや市販のRCカーで実現できるオープンソースの自動運転プラットフォーム。
- [IBM Watson IoT Platform](https://www.ibm.com/jp-ja/marketplace/internet-of-things-cloud)
   IBM Cloud上で提供しているMQTTブローカサービス。検証はライトプランの無料枠で実施。
- [Glitch.com](https://glitch.com)
   Node.js開発・実行環境を無料で提供してくれるサービス。シェルコンソールもありpython3.xも既にインストール済みであるため、テストスクリプトの実行も可能。GitHub連携可能。

本リポジトリはGlitch.com上で動作するコードのみ格納されている。[Donkey Carパーツ](https://github.com/coolerking/donkeypart_telemetry) 側はこちらを参照のこと。



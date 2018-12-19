# -*- coding: utf-8 -*-
"""
IBM Watson IoT Platform 用テストPublisher。
一定時間ごとに、乱数生成したメッセージをMQTTブローカ(IoTP)へ送信し続ける。
IBM社提供のIoTFライブラリを使用（pip install ibmiotf）しており、デバイス設定はすべて外部の設定ファイルへ格納されている。

Usage:
    pub.py [--conf=CONFIG_PATH] [--interval=INTERVAL_SECS]

Options:
    --config=CONFIG_PATH    設定ファイルパス。
    --interval=INTERVAL_SECS  publish間のインターバル時間（秒）。
"""
# -*- coding: utf-8 -*-
import os
import subprocess
import json
import random
import datetime
import docopt
from time import sleep
import ibmiotf.device

def publish_forever(config_path='emperor.ini', interval=10):
    try:
        options = ibmiotf.device.ParseConfigFile(config_path)
        client = ibmiotf.device.Client(options)
        print('[publish_forever] config loaded')
    except ibmiotf.ConnectionException  as e:
        print('[publish_forever] config load failed ' + config_path)
        raise e

    client.connect()
    print('[publish_forever] connect client')

    try:
        while(True):
            # dummy msg
            msg ={
                "angle": random.uniform(-1, 1),
                "timestamp": str(datetime.datetime.now()),
                "throttle": random.uniform(-1, 1)}
            message = json.dumps(msg)

            client.publishEvent(event='status', msgFormat='json', data=msg, qos=0)
            print('[publish_forever] published :' + message)
            sleep(interval)
    finally:
        client.disconnect()

if __name__ == '__main__':
    print('[__main__] start')
    # 引数情報の収集
    args = docopt.docopt(__doc__)

    conf_path = args['--conf']
    if conf_path is None:
        conf_path = 'test/emperor.ini'
    
    interval = args['--interval']
    if interval is None:
        interval = 10
    else:
        interval = float(interval)
    
    publish_forever(conf_path, interval)
    print('[__main__] end')

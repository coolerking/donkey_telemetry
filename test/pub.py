# -*- coding: utf-8 -*-
"""
IBM Watson IoT Platform 用テストPublisher。
一定間隔ごとに指定のイメージファイルを送信し続ける。

Usage:
    pub.py [--conf=CONFIG_PATH] [--image=IMAGE_PATH] [--interval=INTERVAL_SECS]

Options:
    --config=CONFIG_PATH      設定ファイルパス。
    --image=IMAGE_PATH        送信するイメージファイルのパス。
    --interval=INTERVAL_SECS  publish間のインターバル時間（秒）。
"""
import os
import pytz
import json
import random
from datetime import datetime
import docopt
import numpy as np
import donkeycar as dk
from time import sleep
#import ibmiotf.device
#from ibmiotf import MessageCodec, Message, InvalidEventException
#import ibmiotf.application

from iotf.part import PubTelemetry

class DummyTub():
  def __init__(self, image):
    self.image = image
  
  def run(self):
    mode = 'local_angle'
    u_an = random.uniform(-1, 1)
    u_th = random.uniform(-1, 1)
    p_an = random.uniform(-1, 1)
    p_th = random.uniform(-1, 1)
    #ts = str(datetime.now())
    return self.image, mode, u_an, u_th, p_an, p_th


if __name__ == '__main__':
  print('[__main__] start')
  # 引数情報の収集
  args = docopt.docopt(__doc__)

  conf_path = args['--conf']
  if conf_path is None:
    conf_path = 'emperor.ini'

  interval = args['--interval']
  if interval is None:
    interval = 10
  else:
    interval = float(interval)

  image_path = args['--image']
  if image_path is None:
    image_path='1_cam-image_array_.jpg'

  with open(image_path, 'br') as f:
    data = f.read()

  rate_hz = 20
  tubs = ['cam/image_array', 'user/mode', 'user/angle', 'user/throttle', 'pilot/angle', 'pilot/throttle']

  V = dk.vehicle.Vehicle()
  dummy = DummyTub(data)
  V.add(dummy, outputs=tubs)
  tele = PubTelemetry('iotf/template.ini', pub_count=rate_hz*5, debug=True)
  V.add(tele, inputs=tubs)

  # Vehicle ループを開始
  V.start(rate_hz=rate_hz, max_loop_count=100000)
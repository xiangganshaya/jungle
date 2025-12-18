#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import string
import shutil
import re
import zipfile
import hashlib
import base64
import json
import struct
import random
import binascii
import multiprocessing
import subprocess
import time
import sys, time, glob, traceback, gc
from shutil import copy2

def os_is_win32():
    return sys.platform == 'win32'

def readFile(filePath):
    file_object = open(filePath,'rb')
    content = file_object.read()
    file_object.close()
    return content

def writeFile(filePath,content):
    file_object = open(filePath,'wb')
    file_object.write(content)
    file_object.close()

def md5_file(name):
    m = hashlib.md5()
    a_file = open(name, 'rb')    #需要使用二进制格式读取文件内容
    m.update(a_file.read())
    a_file.close()
    return m.hexdigest()

def md5_str(s):
    m = hashlib.md5(s)
    # m.update(s)
    return m.hexdigest()

def base64_file(name):
    a_file = open(name, 'rb')    #需要使用二进制格式读取文件内容
    b64 = base64.b64encode(a_file.read())
    a_file.close()
    return b64

def loadJson(jsonName):
    jsonData = ""
    with open(jsonName,'r') as file:
        for line in file:
            jsonData += line
    sjson = json.loads(jsonData)
    file.close()
    return sjson
    pass

def main():
    b64Str = '0ABCDEFGHI1JKLMNOPQRST2UVWX3YZ4abc5defgh6ijklmno7pqrs8tuvw9xyz'

    rawPath = './raw.png'
    b64 = base64_file(rawPath)
    ms = md5_str(b64).upper()
    ms = md5_str(b64[4:8]+ms[10:])

    char_pool = []
    # 复杂的字符转换算法
    for i in range(0, len(ms), 2):
        hex_pair = ms[i:i+2]
        value = int(hex_pair, 16)
        # 确定性转换算法
        transformed = (value * 7919 + (i % 1024)) % len(b64Str)
        char_pool.append(b64Str[transformed])

    # 选择16个字符
    result = ''
    i = 0
    while i < len(char_pool):
        index = (i * 179) % len(char_pool)
        result += char_pool[index]
        # 每选3个字符后对池子进行确定性"洗牌"
        if i % 3 == 2:
            first = char_pool.pop(0)
            char_pool.append(first)
        i += 1
        pass

    rawPath = '../assets/resources/raw/raw.png'
    m5 = md5_file(rawPath)
    jd = loadJson(rawPath+'.meta')
    uuid = jd['uuid']
    # rp = 'assets/resources/native/'+uuid[:2]+'/'+uuid+'.'+m5[:6]+'.png'
    rp = 'assets/resources/native/'+uuid[:2]+'/'+uuid+'.xxxxx.png'
    
    print('key:',result)
    print('path',rp)

    writeFile('key.txt','key: '+result+'\n\npath: \n'+'from: '+rawPath+'\nto: '+rp)
    pass

if __name__=="__main__":
    main()
    pass
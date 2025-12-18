#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys

g_obfuscatorDir = 'obfuscator'

def os_is_win32():
    return sys.platform == 'win32'


def obfuscatorJS():
    curDir = os.getcwd()
    os.chdir(g_obfuscatorDir)

    if False == os.path.exists('node_modules'):
        cmd = 'npm install --no-fund --no-audit'
        if os_is_win32():
            os.system(cmd)
        else:
            os.system(cmd)
            pass
        
        cmd = 'npm install gulp -g'
        if os_is_win32():
            os.system(cmd)
        else:
            os.system(cmd)
            pass
        pass

    cmd = 'gulp'
    if os_is_win32():
        os.system(cmd)
    else:
        os.system(cmd)
        pass

    os.chdir(curDir)
    pass

def main():
    obfuscatorJS()
    pass

if __name__=='__main__':
    main()
    pass


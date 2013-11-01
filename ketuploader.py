from gmusicapi import Musicmanager
from os import listdir
from os.path import isfile, join
import os
import time
import subprocess

api = Musicmanager()
api.login()
mypath = '/home/pi/musics'
while True:
    onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) ]
    if len(onlyfiles) > 0:
        time.sleep(5)
        for file in onlyfiles:
            print(file)
            api.upload(mypath + '/' + file)
            os.remove(mypath + '/' + file)
	



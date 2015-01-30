# To run locally for devel purposes
from bottle import run
import os
 
import simqcolours.server as server
server.ROOT = os.path.abspath("..") + "/"
run(server.application, host='localhost', port=8080)
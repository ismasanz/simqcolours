import bottle

import cPickle as pickle
import anydbm as dbm
import atexit
import datetime

@bottle.route("/api/surveys")
def api():
    try: 
        data = db[bottle.request.remote_addr]
        return pickle.loads(data)
    except KeyError:
        return {}

@bottle.post("/api/surveys")
def catchall_post():
    log.write("%s|%s|%s" % (datetime.datetime.now().time().isoformat(), bottle.request.remote_addr, str(bottle.request.json)))
    log.write("\n")
    db[bottle.request.remote_addr] = pickle.dumps(bottle.request.json)

@bottle.route('<path:path>')
def callback(path):
    if path == "/":
        path = "/index.html"
    return bottle.static_file(path, root="/home/isanz/mysite/simqcolours/app")


log = open("surveys.log", "w+")
atexit.register(lambda: log.close())

db = dbm.open("surveys.db", "c")
atexit.register(lambda: db.close())

bottle.run(port=8080)


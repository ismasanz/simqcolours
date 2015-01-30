from bottle import default_app, route, post, request, static_file, redirect

import shelve
import atexit
import datetime
import sys
import json
import base64
import tempfile
import shutil

ROOT = "/home/isanz/" # Default for deployment in PythonAnywhere

@route("/colours/submit")
def colours_submit():
    vars = request.query.decode()
    print >>sys.stderr, "colours, vars= %s" % vars
    with open("results.csv", "a+") as f:
        f.write(request.remote_addr)
        f.write(",")
        f.write(datetime.datetime.now().isoformat())
        f.write(",")
        f.write("%(red)s,%(blue)s,%(green)s,%(name)s,%(adjetivo)s\n" % vars)
    redirect("/colours/")

@route("/colours/results")
def colours_results():
    with open("results.csv", "r") as f:
        csv = f.read() 
    return csv

@route("/api/surveys")
def api():
    try:
        db = shelve.open(ROOT + "surveys.shelve")
        data = db[request.remote_addr]
        db.close()
        return data
    except KeyError:
        return {}

@route("/api/export")
def api_export():
    shutil.copy(ROOT + "surveys.shelve", ROOT + "surveys.exported.shelve")
    shutil.copy(ROOT + "surveys.log", ROOT + "surveys.exported.log")

@post("/api/surveys")
def api_post():
    json_data = request.json
    if json_data is None:
        json_data = json.load(request.body)
    db = shelve.open(ROOT + "surveys.shelve", "c")
    db[request.remote_addr] = json_data
    db.close()
    #print >>sys.stderr, "Got a POST, json= %s" % len(json_data)
    meta, data = json_data["data"].split(",")
    format = meta.split(";")[0].split("/")[1]
    imgFile = tempfile.NamedTemporaryFile(prefix="img", suffix=".%s" % format, dir="./img", delete=False)
    imgFile.write(base64.b64decode(data))
    imgFile.close()
    json_data["data"] = "file:" + imgFile.name
    with open(ROOT + "surveys.log", "a") as log:
        log.write("%s|%s|%s" % (datetime.datetime.now().time().isoformat(), request.remote_addr, json.dumps(json_data)))
        log.write("\n")
    #print >>sys.stderr, "db content:", [(k, len(v)) for k, v in db.iteritems()]

@route('<path:path>')
def callback(path):
    if path == "/":
        path = "/index.html"
    if path.startswith("/colours"):
        if path == "/colours" or path == "/colours/":
            path = "/colours/index.html"
        return static_file(path, root=ROOT)
    return static_file(path, root=ROOT+"simqcolours/simqcolours/app")

#print >>sys.stderr, "Starting up, log=" + str(log) + " db=" + str(db)
application = default_app()


from bottle import default_app, route, post, request, static_file, redirect,\
    SimpleTemplate, template
from beaker.middleware import SessionMiddleware
from bottle.ext.i18n import I18NPlugin, I18NMiddleware, i18n_defaults, i18n_view, i18n_template


import shelve
import datetime
import sys
import json
import base64
import tempfile
import shutil

ROOT = "/home/isanz/" # Default for deployment in PythonAnywhere

@route("/colours/submit")
def colours_submit():
    variables = request.query.decode()
    print >>sys.stderr, "colours, vars= %s" % variables.allitems()
    if "confidence" not in variables:
        variables["confidence"] = -1 
    with open("results.csv", "a+") as f:
        f.write(request.remote_addr)
        f.write(",")
        f.write(datetime.datetime.now().isoformat())
        f.write(",")
        f.write("%(red)s,%(blue)s,%(green)s,%(name)s,%(adjetivo)s,%(confidence)s\n" % variables)
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
    fmt = meta.split(";")[0].split("/")[1]
    imgFile = tempfile.NamedTemporaryFile(prefix="img", suffix=".%s" % fmt, dir="./img", delete=False)
    imgFile.write(base64.b64decode(data))
    imgFile.close()
    json_data["data"] = "file:" + imgFile.name
    with open(ROOT + "surveys.log", "a") as log:
        log.write("%s|%s|%s" % (datetime.datetime.now().time().isoformat(), request.remote_addr, json.dumps(json_data)))
        log.write("\n")
    #print >>sys.stderr, "db content:", [(k, len(v)) for k, v in db.iteritems()]

@route("/colours/")
@route("/colours/index.html")
def colours_index():
    s = request.environ.get('beaker.session')
    s['visit_count'] = s.get('visit_count', 0) + 1
    s.save()
    #return i18n_template(ROOT + "/colours/index.tpl", visit_count=s['visit_count'], function="i18n_template")
    return template(ROOT + "/colours/index.tpl", visit_count=s['visit_count'])

@route('<path:path>')
def callback(path):
    if path == "/":
        redirect("/index.html")
    if path == "/colours":
        redirect("/colours/index.html")
    if path.startswith("/colours"):
        return static_file(path, root=ROOT)
    return static_file(path, root=ROOT+"simqcolours/simqcolours/app")

def init(root="/home/isanz"):
    global ROOT
    global application
    ROOT = root
    i18n_defaults(SimpleTemplate, request)
    #print >>sys.stderr, "Starting up, log=" + str(log) + " db=" + str(db)
    session_opts = {
        'session.type': 'file',
        'session.cookie_expires': 300,
        'session.data_dir': './sessions',
        'session.auto': True
    }
    
    app = I18NMiddleware(default_app(), I18NPlugin(domain='messages', default='en', locale_dir=ROOT+'colours/locale'))
    application = SessionMiddleware(app, session_opts)
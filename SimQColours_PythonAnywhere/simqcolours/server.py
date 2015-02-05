import csv
import shelve
import datetime
import sys
import json
import base64
import tempfile
import shutil

from bottle import default_app, route, post, request, static_file, redirect,\
    SimpleTemplate, TEMPLATE_PATH, template
from beaker.middleware import SessionMiddleware
from bottle.ext.i18n import I18NPlugin, I18NMiddleware, i18n_defaults, i18n_view, i18n_template

ROOT = "/home/isanz/" # Default for deployment in PythonAnywhere
SUPPORTED_LANGUAGES = ["en", "es"]

@route("/colours/submit")
def colours_submit():
    variables = request.query.decode()
    print >>sys.stderr, "colours, vars= %s" % variables.allitems()
    s = request.environ['beaker.session']
    if variables["initSession"] == '1':
        s['age'] = variables["age"]
        s['sex'] = variables["sex"]
        s.save()
        return redirect("/colours")
    if "confidence" not in variables:
        variables["confidence"] = -1 
    with open("results.csv", "a+") as f:
        writer = csv.writer(f)
        row = [datetime.datetime.now().isoformat(), 
               request.remote_addr, 
               request.headers["Accept-Language"],
               s["age"],
               s["sex"],
               variables["red"],
               variables["green"],
               variables["blue"],
               variables["name"],
               variables["adjetivo"],
               variables["confidence"]]
        writer.writerow(row)
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
    
def set_language():
    langs = request.headers["Accept-Language"].split(",")
    for l in langs:
        iso = l.split(";")[0].split("-")[0]
        if iso in SUPPORTED_LANGUAGES:
            lang = iso
            break
    else:
        lang = "en"
    i18n.set_lang(lang)
    
@route("/colours/")
@route("/colours/index.html")
def colours_index():
    s = request.environ['beaker.session']
    s['visit_count'] = s.get('visit_count', -1) + 1
    s.save()
    set_language()
    #return i18n_template(ROOT + "/colours/index.tpl", visit_count=s['visit_count'], function="i18n_template")
    return template("colours/index.tpl", visit_count=s['visit_count'], function="i18n_template")

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
    global i18n
    TEMPLATE_PATH.insert(0, root)
    print TEMPLATE_PATH
    ROOT = root
    i18n_defaults(SimpleTemplate, request)
    #print >>sys.stderr, "Starting up, log=" + str(log) + " db=" + str(db)
    session_opts = {
        'session.type': 'file',
        'session.cookie_expires': 30,
        'session.data_dir': './sessions',
        'session.auto': True
    }
    
    i18n =  I18NPlugin(domain='messages', default='en', locale_dir=ROOT+'colours/locale')
    app = I18NMiddleware(default_app(), i18n)
    application = SessionMiddleware(app, session_opts)
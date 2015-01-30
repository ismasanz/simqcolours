import json
import sys

file_equiv = {}
current_cksum = None
file_list = []
with open("checksums.sorted") as f:
    for l in f:
        l = l.strip()
        if l == "":
            continue
        cksum, size, fname = l.split()
        if current_cksum is None:
            current_cksum = cksum
            file_list = [fname]
        elif current_cksum != cksum:
            actual_file = None
            for img in file_list:
                if not img.startswith("img/img"):
                    actual_file = img
                    break
            else:
                actual_file = img
            for img in file_list:
                file_equiv["file:/home/isanz/%s" % img] = actual_file
            file_list = [fname]
            current_cksum = cksum
        else:
            file_list.append(fname)
for img in file_list:
    if not img.startswith("img/img"):
        actual_file = img
        break
else:
    actual_file = img
for img in file_list:
    file_equiv["file:/home/isanz/%s" % img] = actual_file

print file_equiv.keys()
print sorted(set(file_equiv.values()))

line = 0
with open("surveys.log") as f:
    for l in f:
        line += 1
        time, ip, data = l.strip().split("|")
        d = json.loads(data)
        if not "stats" in d:
            continue
        try:
            print ip, file_equiv[d["data"]], d["surveys"], file_equiv[d["data"]], d["stats"]
        except KeyError, e:
            print >>sys.stderr, "Missing %s on line %d" % (d["data"], line)
        
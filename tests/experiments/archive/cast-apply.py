#!/usr/bin/env python3
"""Apply cast-rebalance proposals to content/it/cities/<city>.ts.
Usage: apply_cast.py <proposals dir> <repo> [city ...]
Prints the ids whose portrait must be regenerated."""
import json, os, re, sys

src, repo = sys.argv[1], sys.argv[2]
only = set(sys.argv[3:])

def q(v):
    return '"' + v.replace('\\', '\\\\').replace('"', '\\"') + '"'

def set_field(block, key, value):
    pat = re.compile(r"(\n      %s: )(?:'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"|\[[^\]]*\]|\d+)," % key)
    if pat.search(block):
        return pat.sub(lambda m: m.group(1) + value + ',', block, count=1)
    return block + f"\n      {key}: {value},"

regen = []
for f in sorted(os.listdir(src)):
    city = f[:-5]
    if only and city not in only:
        continue
    d = json.load(open(os.path.join(src, f)))
    path = os.path.join(repo, 'content/it/cities', city + '.ts')
    s = open(path).read()
    before = {p['id']: p for p in d['before']}
    for p in d['people']:
        b = before.get(p['id'])
        if b is None:
            continue
        i = s.index(f"      id: '{p['id']}',")
        j = s.index("\n    },", i)
        blk = s[i:j]
        if b['keep']:
            continue
        if p['change']:
            blk = set_field(blk, 'name', q(p['name']))
            blk = set_field(blk, 'gender', q(p['gender']))
            blk = set_field(blk, 'age', str(int(p['age'])))
            blk = set_field(blk, 'role', q(p['role']))
            blk = set_field(blk, 'portraitPrompt', q(p['portraitPrompt']))
            regen.append(p['id'])
        if len(p['personality']) >= len(b['personality'] or []):
            blk = set_field(blk, 'personality', '[' + ', '.join(q(x) for x in p['personality']) + ']')
        here = p['here'].strip()
        if p['change'] and p['background'] and p['background'].strip().lower() not in here.lower():
            here = f"{here} Your background: {p['background'].strip()}."
        blk = set_field(blk, 'here', q(here))
        s = s[:i] + blk + s[j:]
    open(path, 'w').write(s)
print(','.join(regen))

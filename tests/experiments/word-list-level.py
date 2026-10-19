# Round 23, step 1 of 2: the word-list measure of "lines a beginner can follow"
# (cloud session's syllabus handoff, 2026-10-19). For each character line in a
# conversations file, the share of its words a beginner knows by a fixed list:
# a word is known if its lemma is on docs/research/syllabus/level-words-it.csv
# at A1 or A2, or it is a closed-class word (article, preposition, pronoun,
# conjunction, auxiliary: the list has too few of these, e.g. no "che", "ma").
# Numbers, names and punctuation don't count. Lemmas from spaCy's large model
# (any language spaCy has). Step 2, the comparison with the judge:
# word-list-level.mts. Needs a venv with spacy and it_core_news_lg:
#   python3 -m venv v && v/bin/pip install spacy && v/bin/python -m spacy download it_core_news_lg
#   v/bin/python -I tests/experiments/word-list-level.py tests/conversations/synthetic-set/it.json
import csv, json, os, sys
import spacy

src = sys.argv[1]
root = os.getcwd()
words = {}
with open(os.path.join(root, 'docs/research/syllabus/level-words-it.csv')) as f:
    for r in csv.DictReader(f):
        words.setdefault(r['lemma'].lower(), r['level'])
CLOSED = {'DET', 'ADP', 'PRON', 'CCONJ', 'SCONJ', 'AUX'}
SKIP = {'PUNCT', 'NUM', 'PROPN', 'SYM', 'SPACE', 'X'}
nlp = spacy.load('it_core_news_lg')
rows = json.load(open(src))
out = []
for r in rows:
    for t in r['turns']:
        if t['who'] != 'npc':
            continue
        toks = [x for x in nlp(t['text']) if x.pos_ not in SKIP and x.is_alpha]
        def known(x, closed):
            lemma = x.lemma_.lower().split(' ')[0]
            return (closed and x.pos_ in CLOSED) or words.get(lemma) in ('A1', 'A2') or words.get(x.text.lower()) in ('A1', 'A2')
        a = [known(x, True) for x in toks]
        b = [known(x, False) for x in toks]
        out.append({'conv': r['id'], 'line': t['text'], 'n': len(toks),
                    'list': sum(a) / len(a) if a else 1.0, 'listOnly': sum(b) / len(b) if b else 1.0,
                    'unknown': [x.lemma_.lower() for x, k in zip(toks, a) if not k]})
os.makedirs(os.path.join(root, 'tests/experiments/out'), exist_ok=True)
dst = os.path.join(root, 'tests/experiments/out', 'word-list-' + os.path.basename(src))
json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=1)
print(f'{len(out)} lines -> {dst}')

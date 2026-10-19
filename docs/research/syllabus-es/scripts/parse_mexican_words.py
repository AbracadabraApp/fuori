#!/usr/bin/env python3
"""Parse "Mexican Spanish Word Power 2001" (SpanishPod101) text export into
mexican-words.csv and check each lemma against the PCIC A1-A2 list.

Usage: python3 -I parse_mexican_words.py <book.txt> <level-words-es.csv> <out.csv>

Layout: the text is split into pages by the copyright footer. An entry page is
    [topic heading, e.g. "1.1 Business - Negocios", often wrapped]
    English word
    pos                       (noun, verb, adjective, ...)
    <blank lines>
    Mexican Spanish word
    [pos]                     (missing on about 100 entries)
    [Examples + example pairs, ignored; may run on over following pages]
Pages with no pos line are example run-ons and are skipped. The heading runs
straight into the first English line, so the last line of a heading block is
the English word.
"""
import csv
import re
import sys

POS = {"noun", "verb", "adjective", "phrase", "expression", "numeral", "adverb",
       "pronoun", "preposition", "proper noun"}
HEADING = re.compile(r"^(\d+)\.(\d+) [A-Z]")
FOOTER = re.compile(r"^.*All Rights Reserved.*$", re.M)
# Two entries were pasted from a web translator, with its UI text in front.
TRANSLATOR = re.compile(r"^.*English to Spanish translation\s+")
PROPER_TOPICS = ("World ",)  # keep capitals on cities, countries, etc.


def clean_topic(lines):
    t = " ".join(lines)
    t = re.sub(r"^\d+\.\d+ ", "", t)
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"(\d)- (\d)", r"\1-\2", t)  # "0101-" wrapped before "0999"
    return t.strip(" -")


def lemma_case(s, topic):
    if topic.startswith(PROPER_TOPICS):
        return s
    first = s.split()[0] if s.split() else s
    if len(s) > 1 and s[0].isupper() and first[1:] == first[1:].lower():
        return s[0].lower() + s[1:]
    return s


def blocks(lines):
    """Split lines into runs of non-blank lines, keeping their start index."""
    out, cur = [], []
    for l in lines + [""]:
        if l:
            cur.append(l)
        elif cur:
            out.append(cur)
            cur = []
    return out


def parse(book):
    raw = open(book, encoding="utf-8").read()
    entries, problems, topic = [], [], ""
    for n, page in enumerate(FOOTER.split(raw)):
        L = [l.replace("\f", "").strip() for l in page.split("\n")]
        if not any(l in POS for l in L):
            continue  # example run-on page or front matter
        B = blocks(L)
        # English block: the first block containing a pos line.
        bi = next(i for i, b in enumerate(B) if any(l in POS for l in b))
        for b in B[:bi]:  # heading set off by a blank line (only 1.1)
            hi = next((i for i, l in enumerate(b) if HEADING.match(l)), None)
            if hi is not None:
                topic = clean_topic(b[hi:])
        eb = B[bi]
        pi = next(i for i, l in enumerate(eb) if l in POS)
        en_lines, pos_en, rest = eb[:pi], eb[pi], eb[pi + 1:]
        hi = next((i for i, l in enumerate(en_lines) if HEADING.match(l)), None)
        if hi is not None:
            topic = clean_topic(en_lines[hi:-1])
            en_lines = en_lines[-1:]
        if len(en_lines) != 1:
            problems.append(f"page {n}: English wrapped/joined: {en_lines}")
        en = " ".join(en_lines)
        # Spanish block: the next block (or leftover lines of this one).
        sb = rest if rest else (B[bi + 1] if bi + 1 < len(B) else [])
        es_lines, pos_es = [], ""
        for l in sb:
            if l in POS:
                pos_es = l
                break
            if l == "Examples":
                break
            es_lines.append(l)
        if not pos_es:
            problems.append(f"page {n}: no Spanish pos for '{en}'; used English pos '{pos_en}'")
            if len(es_lines) > 1:
                # No pos and no "Examples" marker: keep only the first line.
                problems.append(f"page {n}: Spanish block ambiguous, kept first line of {es_lines}")
                es_lines = es_lines[:1]
        es = " ".join(es_lines)
        if TRANSLATOR.match(es):
            problems.append(f"page {n}: translator UI text stripped before '{TRANSLATOR.sub('', es)}'")
            es = TRANSLATOR.sub("", es)
        elif len(es_lines) > 1:
            problems.append(f"page {n}: Spanish wrapped, joined: '{es}'")
        if not es:
            problems.append(f"page {n}: no Spanish for '{en}'; skipped")
            continue
        entries.append({"spanish": lemma_case(es.strip(), topic), "english": en.strip(),
                        "pos": pos_es or pos_en, "pos_en": pos_en, "topic": topic, "page": n})
    return entries, problems


def main(book, pcic_path, out_path):
    entries, problems = parse(book)
    levels = {}
    for r in csv.DictReader(open(pcic_path, encoding="utf-8")):
        k, lv = r["lemma"].strip().lower(), r["level"].strip()
        if k not in levels or lv < levels[k]:
            levels[k] = lv

    seen, rows, dups = set(), [], []
    for e in entries:
        key = (e["spanish"].lower(), e["english"].lower())
        if key in seen:
            dups.append(f"{e['spanish']} / {e['english']} ({e['topic']})")
            continue
        seen.add(key)
        lv = levels.get(e["spanish"].lower(), "")
        rows.append({"spanish": e["spanish"], "english": e["english"], "pos": e["pos"],
                     "topic": e["topic"], "in_pcic": "yes" if lv else "no", "pcic_level": lv})

    with open(out_path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["spanish", "english", "pos", "topic", "in_pcic", "pcic_level"])
        w.writeheader()
        w.writerows(rows)

    print(f"entries parsed: {len(entries)}; duplicates dropped: {len(dups)}; rows: {len(rows)}", file=sys.stderr)
    for p in problems:
        print("  " + p, file=sys.stderr)
    for d in dups:
        print("  duplicate: " + d, file=sys.stderr)


if __name__ == "__main__":
    main(*sys.argv[1:4])

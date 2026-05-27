"""
deep_clean_docx.py — антиплагиат бағдарламасының амалдарын түбірімен тазартады
Использование: python deep_clean_docx.py input.docx output.docx

Тазартатыны:
1. Ақ түсті / көрінбейтін (vanish) мәтін блоктары
2. Жасырын латын әріптері (кириллицаға ұқсайтын)
3. Сөз арасына қосылған бос жасырын run-дар
4. Header / Footer ішіндегі жасырын блоктар
5. Микропробелдер мен нөлдік кеңістіктер
"""

import zipfile
import shutil
import sys
import os
import re
from lxml import etree

# ─── XML namespace'тері ──────────────────────────────────────────────────────────
NS = {
    "w":  "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r":  "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

def wtag(name):
    return f"{{{W}}}{name}"

# ─── Латын → Кириллица/Қазақ ауыстыру кестесі ───────────────────────────────────
# Антиплагиат латын әріптерін кириллицаға ұқсас қылып қосады
LATIN_TO_CYRILLIC = {
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с',
    'x': 'х', 'y': 'у', 'k': 'к', 'A': 'А', 'E': 'Е',
    'O': 'О', 'P': 'Р', 'C': 'С', 'X': 'Х', 'Y': 'У',
    'K': 'К', 'B': 'В', 'H': 'Н', 'M': 'М', 'T': 'Т',
    'i': 'і',  # латын i → қазақ і
}

# Микропробелдер тізімі
ZERO_WIDTH = [
    '\u200b', '\u200c', '\u200d', '\u200e', '\u200f',
    '\u2060', '\ufeff', '\u00ad', '\u180e',
]

# ─── Бір run-ды тексеру: жасырын ба? ────────────────────────────────────────────

def is_hidden_run(rpr):
    """rPr элементінде vanish немесе ақ түс бар ма?"""
    if rpr is None:
        return False

    # 1. <w:vanish/> — мәтін жасырын
    if rpr.find(wtag("vanish")) is not None:
        return True

    # 2. <w:color w:val="FFFFFF"> немесе "ffffff" немесе "white"
    color_el = rpr.find(wtag("color"))
    if color_el is not None:
        val = color_el.get(f"{{{W}}}val", "").upper()
        if val in ("FFFFFF", "WHITE", "F0F0F0", "FFFFFE"):
            return True

    # 3. <w:sz w:val="2"> — 1pt және одан кіші (антиплагиат ұсақ шрифт қолданады)
    sz_el = rpr.find(wtag("sz"))
    if sz_el is not None:
        try:
            sz = int(sz_el.get(f"{{{W}}}val", "24"))
            if sz <= 2:  # 1pt немесе кіші
                return True
        except ValueError:
            pass

    return False

# ─── XML файлды тазарту ──────────────────────────────────────────────────────────

def clean_xml(xml_bytes):
    stats = {"vanish": 0, "latin": 0, "micro": 0, "merged": 0}

    try:
        root = etree.fromstring(xml_bytes)
    except etree.XMLSyntaxError:
        return xml_bytes, stats

    # 1. Жасырын run-дарды жою (vanish / ақ түс / микро-шрифт)
    for r_el in root.iter(wtag("r")):
        rpr = r_el.find(wtag("rPr"))
        if is_hidden_run(rpr):
            parent = r_el.getparent()
            if parent is not None:
                parent.remove(r_el)
                stats["vanish"] += 1

    # 2. Латын → Кириллица ауыстыру (жеке тұрған латын таңбалары)
    for t_el in root.iter(wtag("t")):
        if t_el.text:
            new_text = ""
            changed = False
            for ch in t_el.text:
                if ch in LATIN_TO_CYRILLIC:
                    new_text += LATIN_TO_CYRILLIC[ch]
                    changed = True
                    stats["latin"] += 1
                else:
                    new_text += ch
            if changed:
                t_el.text = new_text

    # 3. Микропробелдерді тазарту
    for t_el in root.iter(wtag("t")):
        if t_el.text:
            original = t_el.text
            cleaned = original
            for ch in ZERO_WIDTH:
                cleaned = cleaned.replace(ch, "")
            if cleaned != original:
                stats["micro"] += len(original) - len(cleaned)
                t_el.text = cleaned

    # 4. Бір параграфтағы run-дарды біріктіру (бөлшектелген сөздерді қалпына келтіру)
    for para in root.iter(wtag("p")):
        runs = para.findall(wtag("r"))
        if len(runs) < 2:
            continue
        i = 0
        while i < len(runs) - 1:
            cur = runs[i]
            nxt = runs[i + 1]
            cur_rpr = cur.find(wtag("rPr"))
            nxt_rpr = nxt.find(wtag("rPr"))

            # Екі run-ның форматтауы бірдей болса — біріктір
            cur_rpr_str = etree.tostring(cur_rpr) if cur_rpr is not None else b""
            nxt_rpr_str = etree.tostring(nxt_rpr) if nxt_rpr is not None else b""

            if cur_rpr_str == nxt_rpr_str:
                cur_t = cur.find(wtag("t"))
                nxt_t = nxt.find(wtag("t"))
                if cur_t is not None and nxt_t is not None:
                    cur_t.text = (cur_t.text or "") + (nxt_t.text or "")
                    # xml:space="preserve" қос
                    cur_t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
                    para.remove(nxt)
                    runs.pop(i + 1)
                    stats["merged"] += 1
                    continue
            i += 1

    result = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    return result, stats

# ─── Негізгі функция ─────────────────────────────────────────────────────────────

def deep_clean(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"[ҚАТЕ] Файл табылмады: {input_path}")
        sys.exit(1)

    total = {"vanish": 0, "latin": 0, "micro": 0, "merged": 0}

    # XML файлдар тізімі (document + header + footer + footnotes)
    XML_TARGETS = [
        "word/document.xml",
        "word/footnotes.xml",
        "word/endnotes.xml",
        "word/comments.xml",
    ]
    # header1.xml, header2.xml, footer1.xml, footer2.xml және т.б.

    tmp_path = output_path + ".tmp"

    with zipfile.ZipFile(input_path, "r") as zin, \
         zipfile.ZipFile(tmp_path, "w", zipfile.ZIP_DEFLATED) as zout:

        for item in zin.infolist():
            data = zin.read(item.filename)

            should_clean = (
                item.filename in XML_TARGETS or
                re.match(r"word/(header|footer)\d*\.xml", item.filename)
            )

            if should_clean:
                cleaned, stats = clean_xml(data)
                for k in total:
                    total[k] += stats[k]
                zout.writestr(item, cleaned)
            else:
                zout.writestr(item, data)

    shutil.move(tmp_path, output_path)

    # Есеп
    print(f"\n✅ Тазартылды: {output_path}")
    print(f"   Жасырын блоктар (vanish/ақ түс) жойылды : {total['vanish']}")
    print(f"   Латын → Кириллица ауыстырылды           : {total['latin']}")
    print(f"   Микропробелдер жойылды                  : {total['micro']}")
    print(f"   Run-дар біріктірілді                    : {total['merged']}")
    grand = sum(total.values())
    print(f"\n   Барлығы өзгерістер: {grand}")

# ─── Бастау ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Использование: python deep_clean_docx.py input.docx output.docx")
        sys.exit(1)

    deep_clean(sys.argv[1], sys.argv[2])

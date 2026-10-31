"""Fetch OJI font files from the official Google Fonts CSS endpoint."""
from pathlib import Path
import re
import urllib.request

root = Path(__file__).resolve().parents[1]
url = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400&display=swap'
css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode()
destination = root / 'public/fonts'
destination.mkdir(parents=True, exist_ok=True)
for url in set(re.findall(r'url\((https://[^)]+)\)', css)):
    filename = url.rsplit('/', 1)[1]
    data = urllib.request.urlopen(url).read()
    (destination / filename).write_bytes(data)
    css = css.replace(url, '/fonts/' + filename)
    print(filename, len(data), 'bytes')
(root / 'src/styles/fonts.css').write_text(css, encoding='utf-8')

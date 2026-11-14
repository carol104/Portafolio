import urllib.request
from pathlib import Path

target = Path('public/technology-logos')
target.mkdir(parents=True, exist_ok=True)

# Cisco: official blue
cisco_url = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg'
req = urllib.request.Request(cisco_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as r:
    cisco_svg = r.read().decode('utf-8')

if 'viewBox' not in cisco_svg:
    cisco_svg = cisco_svg.replace('<svg', '<svg viewBox="0 0 216 114"')

(target / 'cisco.svg').write_text(cisco_svg, encoding='utf-8')
print('Cisco logo saved.')

# Udemy: official mark with purple brand color #a435f0
udemy_url = 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/udemy.svg'
req = urllib.request.Request(udemy_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as r:
    udemy_svg = r.read().decode('utf-8')

if 'fill=' not in udemy_svg:
    udemy_svg = udemy_svg.replace('<path', '<path fill="#a435f0"')

(target / 'udemy.svg').write_text(udemy_svg, encoding='utf-8')
print('Udemy logo saved.')


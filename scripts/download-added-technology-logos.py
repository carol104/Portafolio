from pathlib import Path
from urllib.request import urlopen
for name in ['notion','n8n','cloudflare','firebase']:
    with urlopen('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/'+name+'.svg', timeout=30) as response:
        svg=response.read().decode()
    if '<svg' not in svg: raise ValueError(name)
    color={'notion':'ffffff','n8n':'EA4B71','cloudflare':'F38020','firebase':'DD2C00'}[name]
    svg=svg.replace('<svg ', '<svg fill="#'+color+'" ',1)
    Path('public/technology-logos/'+name+'.svg').write_text(svg,encoding='utf-8')
    print('Logo guardado:',name)

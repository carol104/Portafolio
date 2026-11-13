"""Vendor Devicon SVGs locally so the portfolio needs no external icon CDN."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen
import sys

icons={
 'mongodb':'mongodb/mongodb-original.svg','vite':'vitejs/vitejs-original.svg',
 'typescript':'typescript/typescript-original.svg','tailwind':'tailwindcss/tailwindcss-original.svg',
 'heroku':'heroku/heroku-original.svg','railway':'railway/railway-original.svg',
 'python':'python/python-original.svg','javascript':'javascript/javascript-original.svg',
 'java':'java/java-original.svg','spring':'spring/spring-original.svg',
 'sqlserver':'microsoftsqlserver/microsoftsqlserver-original.svg','oracle':'oracle/oracle-original.svg',
 'php':'php/php-original.svg','laravel':'laravel/laravel-original.svg',
 'csharp':'csharp/csharp-original.svg','aspnet':'dotnetcore/dotnetcore-original.svg',
 'react':'react/react-original.svg','express':'express/express-original.svg',
 'nodejs':'nodejs/nodejs-original.svg','postgresql':'postgresql/postgresql-original.svg',
 'docker':'docker/docker-original.svg','ionic':'ionic/ionic-original.svg',
 'angular':'angular/angular-original.svg',
 'jenkins':'jenkins/jenkins-original.svg','selenium':'selenium/selenium-original.svg',
 'playwright':'playwright/playwright-original.svg','pytest':'pytest/pytest-original.svg',
 'sonarqube':'sonarqube/sonarqube-original.svg','junit':'junit/junit-original.svg',
 'grafana':'grafana/grafana-original.svg',
}
target=Path('public/technology-logos');target.mkdir(parents=True,exist_ok=True)
def download(item):
 name,source=item
 url='https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/'+source
 with urlopen(url,timeout=30) as response:data=response.read()
 if b'<svg' not in data:raise ValueError('Invalid SVG: '+name)
 (target/(name+'.svg')).write_bytes(data)
 return name
with ThreadPoolExecutor(max_workers=6) as executor:
 selected={name:icons[name] for name in sys.argv[1:]} if len(sys.argv)>1 else icons
 for name in executor.map(download,selected.items()):print('Logo guardado:',name)
with urlopen('https://raw.githubusercontent.com/devicons/devicon/v2.17.0/LICENSE',timeout=30) as response:
 (target/'LICENSE.txt').write_bytes(response.read())

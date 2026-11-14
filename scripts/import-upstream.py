"""Import upstream reference code at resolved Git commits and preserve licenses."""
import json, pathlib, urllib.request, hashlib
root=pathlib.Path(__file__).resolve().parents[1]
repos=[('twbs/bootstrap','v5.3.8',['LICENSE','site/src/assets/examples/dashboard/index.astro','site/src/assets/examples/dashboard/dashboard.css']),('soldair/node-qrcode','v1.5.4',['license','README.md']),('chartjs/Chart.js','v4.5.1',['LICENSE.md','README.md']),('python-telegram-bot/python-telegram-bot','v22.5',['LICENSE','examples/echobot.py'])]
manifest=[]
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Tulpa-Cauca-Innova'}),timeout=60).read()
for repo,ref,files in repos:
    commit=json.loads(get(f'https://api.github.com/repos/{repo}/commits/{ref}'))['sha']
    entry={'repository':f'https://github.com/{repo}','ref':ref,'commit':commit,'files':[]}
    for name in files:
        try:
            data=get(f'https://raw.githubusercontent.com/{repo}/{commit}/{name}')
        except Exception as e:
            print(f'Skipped {repo}/{name}: {e}');continue
        path=root/'upstream'/repo/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
        entry['files'].append({'path':str(path.relative_to(root)),'sha256':hashlib.sha256(data).hexdigest()})
    manifest.append(entry)
    print(repo,commit,len(entry['files']))
(root/'upstream/manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')

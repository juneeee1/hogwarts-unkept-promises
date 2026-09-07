from pathlib import Path
import hashlib,json,shutil,sys,zipfile
root=Path.cwd(); linked=root/'outputs/linked-v3-preview'
media=json.loads((root/'outputs/art-v3/hosted-assets.json').read_text())
if '--prepare-linked' in sys.argv:
 if linked.exists():shutil.rmtree(linked)
 shutil.copytree(root/'dist-storvia',linked)
 urls={}
 for stem in ['kraft-paper','story-objects']:
  p=next((linked/'assets').glob(stem+'-*.webp'));urls[p.name]=next(item['url'] for item in media if stem in item['file']);p.unlink()
 p=next((linked/'assets').glob('hedwigs-theme-*.mp3'));urls[p.name]='https://cdn.storviai.com/images/John%20Williams%20-%20Hedwigs%20Theme.mp3';p.unlink()
 (linked/'sw.js').unlink()
 textFiles=[p for p in linked.rglob('*') if p.suffix in ['.js','.css','.html']]
 renamed={p.name:p.stem+'-linked'+p.suffix for p in textFiles if p.suffix in ['.js','.css']}
 for p in textFiles:
  s=p.read_text()
  for name,url in urls.items():s=s.replace('./'+name,url).replace(name,url)
  for old,new in renamed.items():s=s.replace(old,new)
  if p.suffix=='.html':s=s.replace('<head>','<head><meta name="game-media" content="hosted">')
  p.write_text(s)
 for p in textFiles:
  if p.name in renamed:p.rename(p.with_name(renamed[p.name]))
 print('Prepared linked version; face texture stays local; remote UI art and BGM; no offline claim')
 sys.exit()
reports=[]
for mode,folder in [('offline',root/'dist-storvia'),('linked',linked)]:
 target=root/'outputs'/('hogwarts-unkept-promises-art-v3-5lang-'+mode+'-20260907.zip')
 assert not target.exists(),'Release already exists: '+target.name
 files=sorted(p for p in folder.rglob('*') if p.is_file())
 with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in files:z.write(p,p.relative_to(folder))
 with zipfile.ZipFile(target) as z:
  assert z.testzip() is None;assert 'index.html' in z.namelist();assert ('sw.js' in z.namelist())==(mode=='offline')
 reports.append({'mode':mode,'file':target.name,'bytes':target.stat().st_size,'uncompressedBytes':sum(p.stat().st_size for p in files),'files':len(files),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'crc':'PASS'})
(root/'outputs/qa-polish-v3/package.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports,indent=2))

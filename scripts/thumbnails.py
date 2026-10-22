from PIL import Image, ImageOps
import json, os, io, base64
from concurrent.futures import ThreadPoolExecutor
rows=json.load(open('data/covers.json',encoding='utf-8'))
def one(row):
    if os.path.exists(row['target']): return None
    with Image.open(row['source']) as source:
        im=ImageOps.exif_transpose(source).convert('RGB'); im.thumbnail((480,480),Image.Resampling.LANCZOS)
        out=io.BytesIO(); im.save(out,'WEBP',quality=68,method=4)
        return json.dumps({'target':row['target'],'data':base64.b64encode(out.getvalue()).decode('ascii')})
with ThreadPoolExecutor(max_workers=4) as pool:
    for line in pool.map(one,rows):
        if line: print(line,flush=True)

"""Generate display derivatives without changing the source files or cropping watermarks."""
import io
import json
import os
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

with open('data/image-jobs.json', encoding='utf-8') as handle:
    jobs = json.load(handle)
os.makedirs('assets/optimized', exist_ok=True)

def convert(job):
    with Image.open(job['source']) as source:
        source.load()
        image = ImageOps.exif_transpose(source)
        image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
        for key, size, quality in [('display', 1280, 76), ('thumbnail', 480, 68)]:
            target = job[key]
            if os.path.exists(target):
                continue
            out = image.copy()
            out.thumbnail((size, size), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            out.save(buffer, 'WEBP', quality=quality, method=4)
            temporary = target + '.tmp'
            with open(temporary, 'wb') as handle:
                handle.write(buffer.getvalue())
            os.replace(temporary, target)

with ThreadPoolExecutor(max_workers=4) as pool:
    for index, _ in enumerate(pool.map(convert, jobs), 1):
        if index % 500 == 0:
            print(f'Prepared {index}/{len(jobs)} photos', flush=True)

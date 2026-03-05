import os
import requests
from io import BytesIO
try:
    from PIL import Image
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "requests"])
    from PIL import Image

urls = [
    "https://i.postimg.cc/P5PVzx4P/Whats-App-Image-2026-03-04-at-23-02-09.jpg",
    "https://i.postimg.cc/htfZbjrG/Whats-App-Image-2026-03-04-at-23-02-09-(1).jpg",
    "https://i.postimg.cc/8zjXB5Hc/Whats-App-Image-2026-03-04-at-23-02-10.jpg",
    "https://i.postimg.cc/K8RprzN4/Whats-App-Image-2026-03-04-at-23-02-10-(1).jpg",
    "https://i.postimg.cc/qvzDXRLJ/Whats-App-Image-2026-03-04-at-23-02-10-(2).jpg",
    "https://i.postimg.cc/GmHgJ2Qc/Whats-App-Image-2026-03-04-at-23-02-11.jpg",
    "https://i.postimg.cc/pLpcYTZV/Whats-App-Image-2026-03-04-at-23-02-11-(1).jpg",
    "https://i.postimg.cc/pLpcYTZP/Whats-App-Image-2026-03-04-at-23-02-12.jpg",
    "https://i.postimg.cc/526Kq031/Whats-App-Image-2026-03-04-at-23-02-12-(1).jpg",
    "https://i.postimg.cc/SxJ17sr4/Whats-App-Image-2026-03-04-at-23-02-12-(2).jpg",
    "https://i.postimg.cc/sgvH9XcC/Whats-App-Image-2026-03-04-at-23-12-38.jpg",
    "https://i.postimg.cc/CxzrH1NT/Whats-App-Image-2026-03-04-at-23-12-38-(1).jpg",
    "https://i.postimg.cc/Mpv3bTYh/Whats-App-Image-2026-03-04-at-23-12-39.jpg",
    "https://i.postimg.cc/wj74cvkZ/Whats-App-Image-2026-03-04-at-23-12-39-(1).jpg",
    "https://i.postimg.cc/RZNpQFT2/Whats-App-Image-2026-03-04-at-23-12-42.jpg",
    "https://i.postimg.cc/tCrmxPhX/Whats-App-Image-2026-03-04-at-23-12-42-(1).jpg",
    "https://i.postimg.cc/NfNPHT1Y/Whats-App-Image-2026-03-04-at-23-12-43.jpg",
    "https://i.postimg.cc/xTsFzHKQ/Whats-App-Image-2026-03-04-at-23-12-43-(1).jpg",
    "https://i.postimg.cc/jd8k7Nzb/Whats-App-Image-2026-03-04-at-23-12-44.jpg",
    "https://i.postimg.cc/gkMBZRvP/Whats-App-Image-2026-03-04-at-23-12-44-(1).jpg",
    "https://i.postimg.cc/65H1vRCD/Whats-App-Image-2026-03-04-at-23-12-44-(2).jpg",
    "https://i.postimg.cc/MKsrQR1C/Whats-App-Image-2026-03-04-at-23-12-45.jpg",
    "https://i.postimg.cc/YqXyWgQZ/Whats-App-Image-2026-03-04-at-23-12-45-(1).jpg",
    "https://i.postimg.cc/Kv9sMLtW/Whats-App-Image-2026-03-04-at-23-12-45-(2).jpg",
    "https://i.postimg.cc/65H1vRC1/Whats-App-Image-2026-03-04-at-23-12-46.jpg",
    "https://i.postimg.cc/gkMBZR3S/Whats-App-Image-2026-03-04-at-23-12-46-(1).jpg",
    "https://i.postimg.cc/NfNPHTRC/Whats-App-Image-2026-03-04-at-23-12-46-(2).jpg",
    "https://i.postimg.cc/pX01F8K0/Whats-App-Image-2026-03-04-at-23-12-47.jpg",
    "https://i.postimg.cc/X72DCF9L/Whats-App-Image-2026-03-04-at-23-12-47-(1).jpg",
    "https://i.postimg.cc/ncdwD7q1/Whats-App-Image-2026-03-04-at-23-12-47-(2).jpg",
    "https://i.postimg.cc/NfNPHTR7/Whats-App-Image-2026-03-04-at-23-12-47-(3).jpg",
    "https://i.postimg.cc/pX01F8KJ/Whats-App-Image-2026-03-04-at-23-44-57.jpg",
    "https://i.postimg.cc/4N8F9tp5/Whats-App-Image-2026-03-04-at-23-59-20.jpg",
]

public_dir = os.path.join(os.getcwd(), 'public')
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

generated_files = []

for i, url in enumerate(urls, 1):
    try:
        response = requests.get(url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        
        # Save as webp
        filename = f"cuadronew{i}.webp"
        filepath = os.path.join(public_dir, filename)
        img.save(filepath, "WEBP", quality=85)
        print(f"[{i}/{len(urls)}] Saved {filename}")
        generated_files.append(f"/{filename}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

print("Array of images:")
print(f"const PAINTING_IMAGES = {generated_files};")


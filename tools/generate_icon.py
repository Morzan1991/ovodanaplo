"""Generál egy ikont az OvodaNapló appnak — pasztell rózsaszín, óvodás stílus.
A 'sage' paletta szerint (HEX #FDF5F8 → #52273A) + mauve + terra.
"""
from PIL import Image, ImageDraw, ImageFont
import os, math

SIZE = 512  # nagy kanvász, ICO majd lekicsinyíti

# Pasztell paletta (a tailwind.config.js-ből)
BG_LIGHT = (253, 245, 248, 255)   # sage-50  #FDF5F8
PINK_SOFT = (244, 207, 222, 255)  # sage-200
PINK_MID = (232, 169, 197, 255)   # sage-400
PINK_DARK = (193, 110, 153, 255)  # sage-600
INK = (82, 39, 58, 255)           # sage-900  #52273A
MAUVE = (180, 137, 191, 255)
TERRA = (215, 156, 138, 255)
WHITE = (255, 255, 255, 255)
GOLD = (255, 207, 138, 255)

img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# 1. Háttér: lekerekített, gradient-szerű (több koncentrikus rect)
pad = 24
for i in range(8):
    p = pad + i * 4
    alpha = 255 - i * 8
    color = (PINK_MID[0], PINK_MID[1], PINK_MID[2], alpha if i > 0 else 255)
    d.rounded_rectangle((p, p, SIZE-p, SIZE-p), radius=70-i*2, fill=color if i == 0 else None,
                        outline=color if i > 0 else INK, width=2 if i > 0 else 4)

# Egyszerűbb: csak egy szilárd háttér, nyitott könyv ikon rajta
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# Háttér: lekerekített pasztell rózsaszín square
d.rounded_rectangle((20, 20, SIZE-20, SIZE-20), radius=80,
                     fill=PINK_SOFT, outline=INK, width=6)

# Belső dekoratív keret
d.rounded_rectangle((50, 50, SIZE-50, SIZE-50), radius=60,
                     fill=BG_LIGHT, outline=PINK_MID, width=3)

# Nyitott könyv (napló) — középen
cx, cy = SIZE // 2, SIZE // 2
book_w, book_h = 280, 200

# Bal oldal (lap)
left_pts = [
    (cx - book_w//2, cy - book_h//2 + 10),
    (cx - 6, cy - book_h//2 - 8),
    (cx - 6, cy + book_h//2 - 4),
    (cx - book_w//2, cy + book_h//2 + 10),
]
# Jobb oldal (lap)
right_pts = [
    (cx + 6, cy - book_h//2 - 8),
    (cx + book_w//2, cy - book_h//2 + 10),
    (cx + book_w//2, cy + book_h//2 + 10),
    (cx + 6, cy + book_h//2 - 4),
]
d.polygon(left_pts, fill=WHITE, outline=INK)
d.polygon(right_pts, fill=WHITE, outline=INK)

# Könyv-gerinc (a középvonal)
d.line([(cx, cy - book_h//2 - 6), (cx, cy + book_h//2 + 6)], fill=INK, width=5)

# Sorok a könyvön (5 sor mindkét oldalon)
for i in range(5):
    y = cy - 60 + i * 26
    line_len = 90 - (i * 5)  # kicsit fokozatosan rövidül
    # Bal oldal
    d.line([(cx - 110, y), (cx - 110 + line_len, y)],
           fill=PINK_MID if i % 2 == 0 else MAUVE, width=4)
    # Jobb oldal
    d.line([(cx + 20, y), (cx + 20 + line_len, y)],
           fill=PINK_MID if i % 2 == 0 else MAUVE, width=4)

# Dekoratív csillagok körül (óvodás)
def star(cx, cy, r, fill):
    pts = []
    for i in range(10):
        angle = math.pi / 2 + i * math.pi / 5
        radius = r if i % 2 == 0 else r // 2
        pts.append((cx + radius * math.cos(angle), cy - radius * math.sin(angle)))
    d.polygon(pts, fill=fill, outline=INK)

# 4 sarok-csillag
star(80, 80, 22, GOLD)
star(SIZE - 80, 80, 22, GOLD)
star(80, SIZE - 80, 22, TERRA)
star(SIZE - 80, SIZE - 80, 22, TERRA)

# "ON" monogram a könyv alján
try:
    font = ImageFont.truetype("arial.ttf", 48)
except:
    font = ImageFont.load_default()
text = "ON"
bbox = d.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
d.text((cx - tw // 2, SIZE - 130), text, font=font, fill=INK)

# Mentés: PNG (előnézet) + ICO (több méretben)
out_dir = os.path.dirname(os.path.abspath(__file__))
png_path = os.path.join(out_dir, '..', 'app', 'resources', 'icon.png')
ico_path = os.path.join(out_dir, '..', 'app', 'resources', 'icon.ico')

os.makedirs(os.path.dirname(png_path), exist_ok=True)
img.save(png_path, 'PNG')
img.save(ico_path, format='ICO',
         sizes=[(16,16), (24,24), (32,32), (48,48), (64,64), (128,128), (256,256)])
print(f'[OK] Ikon mentve: {ico_path}')
print(f'     Preview PNG: {png_path}')
print(f'     Meret: {os.path.getsize(ico_path)} bytes')

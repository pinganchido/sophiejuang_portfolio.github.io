"""
Convert a PNG image sequence to WebP frames named 0001.webp, 0002.webp, ...
for the home page buttons (script.js -> MENU_ITEMS -> anim).

Usage:
    python tools/png_to_webp.py <png folder> <output folder> [options]

Example:
    python tools/png_to_webp.py "D:/render/interactive" sources/anim/p1

Options:
    --quality 80     WebP quality 0-100 (default 80; higher = sharper but bigger)
    --width 800      resize to this width, keeping the aspect ratio (default: keep size)
    --lossless       lossless WebP (much bigger, only if you really need it)

Frames are sorted by the numbers in their file names (frame2 comes before frame10).
Old 0001.webp ... files in the output folder are deleted first, so no stale frames stay behind.
Requires Pillow:  pip install Pillow
"""

import argparse
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install Pillow")


def natural_key(path):
    # "frame10.png" -> ["frame", 10, ".png"] so numbers sort as numbers
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def main():
    parser = argparse.ArgumentParser(description="Convert a PNG sequence to 0001.webp, 0002.webp, ...")
    parser.add_argument("src", help="folder with the PNG frames")
    parser.add_argument("dst", help="output folder, e.g. sources/anim/p1")
    parser.add_argument("--quality", type=int, default=80, help="WebP quality 0-100 (default 80)")
    parser.add_argument("--width", type=int, default=0, help="resize to this width (default: keep size)")
    parser.add_argument("--lossless", action="store_true", help="lossless WebP")
    args = parser.parse_args()

    src = Path(args.src)
    dst = Path(args.dst)
    frames = sorted(src.glob("*.png"), key=natural_key)
    if not frames:
        sys.exit(f"No .png files found in {src}")

    dst.mkdir(parents=True, exist_ok=True)
    for old in dst.iterdir():
        if re.fullmatch(r"\d{4}\.webp", old.name):
            old.unlink()

    total = 0
    for i, frame in enumerate(frames, start=1):
        with Image.open(frame) as img:
            # Keep transparency if the PNG has it
            img = img.convert("RGBA" if "A" in img.getbands() or "transparency" in img.info else "RGB")
            if args.width and img.width != args.width:
                height = round(img.height * args.width / img.width)
                img = img.resize((args.width, height), Image.LANCZOS)
            out = dst / f"{i:04d}.webp"
            img.save(out, "WEBP", quality=args.quality, lossless=args.lossless, method=6)
        total += out.stat().st_size
        print(f"{frame.name} -> {out.name}")

    print()
    print(f"Done: {len(frames)} frames, {total / 1024 / 1024:.2f} MB total, saved to {dst}")
    print("In script.js (MENU_ITEMS), set this button's anim to:")
    print(f'    anim: {{ folder: "{dst.as_posix().rstrip("/")}/", count: {len(frames)}, fps: 12 }},')
    print("If you replaced older frames, also bump MENU_ANIM_VERSION.")


if __name__ == "__main__":
    main()

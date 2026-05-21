from PIL import Image
import os

def optimize_image(input_path, output_path, max_size=None, quality=90):
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
            elif img.mode != "RGB":
                img = img.convert("RGB")
            
            if max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            img.save(output_path, "WEBP", quality=quality)
            print(f"Optimized {input_path} -> {output_path}")
    except Exception as e:
        print(f"Failed to process {input_path}: {e}")

# Process Company Logos
logos_mapping = {
    "2.png": "bikbbi.webp",
    "3.png": "niceic.webp",
    "4.png": "gas-safe.webp",
    "5.png": "bsi.webp",
    "6.png": "environment-agency.webp",
    "7.png": "city-and-guilds.webp",
    "8.png": "liability-insurance.webp",
    "9.png": "labour-warranty.webp"
}

os.makedirs("images/optimized", exist_ok=True)

for old_name, new_name in logos_mapping.items():
    in_path = os.path.join("images/company-logos", old_name)
    out_path = os.path.join("images/optimized", new_name)
    if os.path.exists(in_path):
        optimize_image(in_path, out_path, max_size=200, quality=85)

# Process Bathroom Images
bathroom_mapping = {
    "IMG_1619.jpg": "hero-background.webp",
    "IMG_1634.jpg": "traditional-bathroom-east-london.webp",
    "IMG_1625.jpg": "marble-effect-tiling.webp",
    "IMG_1339.jpg": "contemporary-suite.webp",
    "IMG_1345.jpg": "freestanding-bath.webp",
    "IMG_1354.jpg": "walk-in-shower.webp",
    "IMG_1357.jpg": "feature-tiling.webp",
    "IMG_1362.jpg": "full-refurbishment.webp",
    "IMG_1368.jpg": "wet-room-north-london.webp",
    "IMG_1349.png": "en-suite-west-london.webp"
}

for old_name, new_name in bathroom_mapping.items():
    in_path = os.path.join("images/bathroom-images", old_name)
    out_path = os.path.join("images/optimized", new_name)
    if os.path.exists(in_path):
        optimize_image(in_path, out_path, max_size=1920, quality=85) # High quality, cap at 1920px
    else:
        print(f"Missing: {in_path}")

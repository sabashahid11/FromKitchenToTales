from base64 import b64decode, b64encode
import sys
from pathlib import Path
from io import BytesIO
sys.path.insert(0, str(Path(__file__).parent.parent))

from clients.supabaseClient import supabase
import random

def convert_to_jpeg(image_bytes: bytes) -> bytes:
    """Convert any image format to JPEG, handling transparency."""
    try:
        from PIL import Image
        img = Image.open(BytesIO(image_bytes))

        # Convert RGBA (with transparency) to RGB with white background
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create a white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Save as JPEG
        output = BytesIO()
        img.save(output, format='JPEG', quality=90)
        return output.getvalue()
    except ImportError:
        # PIL not available, return original bytes
        return image_bytes

def uploadJpgToStorage(base64_jpg):
    image_bytes = b64decode(base64_jpg)

    # Convert to JPEG if needed
    jpeg_bytes = convert_to_jpeg(image_bytes)

    filename = "public/image_" + str(random.randint(1000, 9999)) + ".jpg"
    response = supabase.storage.from_('food-images').upload(
        filename,
        jpeg_bytes,
        {"content-type": "image/jpeg"}
    )
    return supabase.storage.from_('food-images').get_public_url('') + response.path
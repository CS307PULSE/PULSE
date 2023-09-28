from PIL import Image
import io
import os

# Get directory
__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

#open image
image = Image.open(__location__ + r"\uncompressed_image.jpg")

minimum_quality = 50 
quality = 95      # initial quality
target = 256000   # 256 kb

#Scale image down to under 256 kb whiel retaining the aspect ratio
while True:
    output_buffer = io.BytesIO()    
    w, h = image.size
    image = image.resize((int(w/2), int(h/2)))
    image.save(output_buffer, "JPEG", quality=quality)

    file_size = output_buffer.tell()

    if file_size <= target or quality <= minimum_quality:
        output_buffer.close()
        break
    else:
        quality -= 5

image.save(__location__ + r"\compressed_image.jpg", "JPEG", quality=quality)




from PIL import Image
import io
import os

# Get directory
__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

#open image named uncompressed_image.jpg
image = Image.open(__location__ + r"\uncompressed_image.jpg")

quality = 95      # initial quality
target = 8000   # 8 kb

#Scale image down to under 8 kb while retaining the aspect ratio
while True:
    output_buffer = io.BytesIO()    
    w, h = image.size
    image = image.resize((int(w * .75), int(h*.75)))
    image.save(output_buffer, "JPEG", quality=quality)

    file_size = output_buffer.tell()

    if file_size <= target:
        output_buffer.close()
        print(quality)
        break
    
#save image locally
image.save(__location__ + r"\compressed_image.jpg", "JPEG", quality=quality)




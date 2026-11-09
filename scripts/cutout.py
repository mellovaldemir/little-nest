from rembg import remove
from PIL import Image
im=Image.open('mascot-logo-orig.jpg').convert('RGB')
mascot=im.crop((150,40,780,690))
out=remove(mascot)
bb=out.getbbox(); out=out.crop(bb)
out.thumbnail((600,600)); out.save('../img/brand/mascot.png',optimize=True)
print('ok',out.size)

import cv2, numpy as np
cfg={1:565,2:515,3:455}
for i,xmax in cfg.items():
    im=cv2.imread(f'slide{i}-orig.jpg')
    h,w=im.shape[:2]; sx=w/1024
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    v=hsv[...,2].astype(int); s=hsv[...,1].astype(int)
    bright=((v>200)&(s<70)).astype(np.uint8)*255
    region=np.zeros_like(bright); region[int(60*sx):int(520*sx), int(30*sx):int(xmax*sx)]=255
    dots=np.zeros_like(bright); dots[int(515*sx):int(555*sx), int(460*sx):int(560*sx)]=255
    m=cv2.bitwise_and(bright,cv2.bitwise_or(region,dots))
    # fill pill/button interiors: close then dilate
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((25,25),np.uint8))
    m=cv2.dilate(m,np.ones((9,9),np.uint8))
    out=cv2.inpaint(im,m,12,cv2.INPAINT_TELEA)
    # smooth inpainted area
    blur=cv2.GaussianBlur(out,(0,0),18)
    mm=cv2.GaussianBlur(cv2.dilate(m,np.ones((31,31),np.uint8)),(0,0),10).astype(float)[...,None]/255
    out=(out*(1-mm)+blur*mm).astype(np.uint8)
    cv2.imwrite(f'../img/slides/slide{i}.jpg',out,[cv2.IMWRITE_JPEG_QUALITY,86])
    print(i,out.shape)

# Placeholder app icons in ShoreList brand colors (teal #0A4D5C, coral #E96645, cream #F5E8CB).
# Replace icons/*.png with the real brand mark when available.
from PIL import Image, ImageDraw
TEAL=(10,77,92); CORAL=(233,102,69); CREAM=(245,232,203)
def make(size, maskable=False):
    S=size*4
    im=Image.new('RGBA',(S,S),TEAL+(255,))
    d=ImageDraw.Draw(im)
    # safe zone: maskable keeps art inside the central 60%
    scale=0.60 if maskable else 0.74
    r=int(S*scale/2); c=S//2
    d.ellipse([c-r,c-r,c+r,c+r],fill=CORAL)
    # checkmark
    w=int(S*0.055 if not maskable else S*0.045)
    pts=[(c-r*0.48,c+r*0.02),(c-r*0.12,c+r*0.38),(c+r*0.52,c-r*0.34)]
    d.line(pts,fill=CREAM,width=w,joint='curve')
    for (x,y) in (pts[0],pts[2]):
        d.ellipse([x-w/2,y-w/2,x+w/2,y+w/2],fill=CREAM)
    return im.resize((size,size),Image.LANCZOS)
make(192).save('icons/icon-192.png',optimize=True)
make(512).save('icons/icon-512.png',optimize=True)
make(512,True).save('icons/icon-maskable-512.png',optimize=True)
make(180).save('icons/apple-touch-icon.png',optimize=True)
print('icons ok')

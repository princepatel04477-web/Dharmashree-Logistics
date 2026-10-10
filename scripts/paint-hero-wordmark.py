"""Paints the DHARMASHREE wordmark onto the home hero truck photographs.

The client asked for the company name on the hero truck. AI image tools spell
text unreliably, so the word is set in a bold face and perspective-warped onto
the container (or cab-roof deflector) of the existing originals, picking up the
panel's shading so it reads as paint. Run once per original; it overwrites the
output path given.

  python scripts/paint-hero-wordmark.py <in.png> <out.png> "[[TL,TR,BR,BL], ...]"

Quads used (pixel coordinates in the originals):
  hero/highway-golden-hour.png  [(874,276),(1030,266),(1030,300),(874,308)]  header board
                                [(1050,322),(1144,360),(1144,392),(1050,374)] container side
  hero/highway-portrait.png     [(396,607),(578,607),(578,633),(396,633)]   roof deflector
Then `npm run images`.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT = "C:/Windows/Fonts/ariblk.ttf"
TEXT = "DHARMASHREE"

def coeffs(dst, src):
    # PIL perspective: maps output (dst) coords to input (src) coords
    A=[];B=[]
    for (x,y),(u,v) in zip(dst,src):
        A.append([x,y,1,0,0,0,-u*x,-u*y]); B.append(u)
        A.append([0,0,0,x,y,1,-v*x,-v*y]); B.append(v)
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()

def wordmark(scale=8):
    f=ImageFont.truetype(FONT, 100*scale)
    l,t,r,b=f.getbbox(TEXT)
    pad=6*scale
    im=Image.new("L",(r-l+2*pad,b-t+2*pad),0)
    ImageDraw.Draw(im).text((pad-l,pad-t),TEXT,font=f,fill=255)
    return im

def paint(base, quad, opacity=0.95, blur=0.5):
    """quad = TL,TR,BR,BL in base pixels; text stretched to fill it."""
    W,H=base.size
    mark=wordmark()
    w,h=mark.size
    src=[(0,0),(w,0),(w,h),(0,h)]
    c=coeffs(quad,src)
    alpha=mark.transform((W,H),Image.PERSPECTIVE,c,Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    a=np.asarray(alpha,float)/255*opacity
    rgb=np.asarray(base.convert("RGB"),float)
    lum=rgb.mean(axis=2,keepdims=True)
    # painted white picks up the panel's ribbing and the warm light
    shade=0.78+0.22*np.clip(lum/ (lum[a[...,None].squeeze()>0.5].mean() if (a>0.5).any() else 1),0,1.3)
    paintc=np.array([250,246,238],float)*np.clip(shade,0,1.05)
    out=rgb*(1-a[...,None])+paintc*a[...,None]
    return Image.fromarray(np.clip(out,0,255).astype(np.uint8))

if __name__=="__main__":
    src,dst=sys.argv[1],sys.argv[2]
    quads=eval(sys.argv[3])
    im=Image.open(src).convert("RGB")
    for q in quads: im=paint(im,q)
    im.save(dst)

"""Paints the white DharmaShree logo onto the home hero truck photographs.

The client asked for the company logo on the hero truck. The originals were
first cleaned of lettering with the agy CLI (image edit, plain panels), then the
white logo (`public/brand/dharmashree-logo-light.png`, the one the footer uses)
is perspective-warped onto the container (or cab-roof deflector), picking up
the panel's shading so it reads as paint. Run once per original; it overwrites
the output path given.

  python scripts/paint-hero-logo.py <in.png> <out.png> "[[TL,TR,BR,BL], ...]"

Quads used (pixel coordinates in the originals):
  hero/highway-golden-hour.png  [(876,275),(1024,267),(1024,300),(876,308)]  container front
                                [(1052,334),(1142,371),(1142,397),(1052,366)] container side
  hero/highway-portrait.png     [(427,563),(547,563),(547,589),(427,589)]   roof deflector
Then `npm run images`.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

LOGO = "public/brand/dharmashree-logo-light.png"

def coeffs(dst, src):
    # PIL perspective: maps output (dst) coords to input (src) coords
    A=[];B=[]
    for (x,y),(u,v) in zip(dst,src):
        A.append([x,y,1,0,0,0,-u*x,-u*y]); B.append(u)
        A.append([0,0,0,x,y,1,-v*x,-v*y]); B.append(v)
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()

def logo_alpha(width):
    # thicken the hairline strokes a touch, then shrink with antialiasing to
    # about twice the painted width so the warp does not alias them away
    a=Image.open(LOGO).convert("RGBA").getchannel("A").filter(ImageFilter.MaxFilter(5))
    w=max(int(width*2),8)
    return a.resize((w,max(round(a.height*w/a.width),2)),Image.LANCZOS)

def paint(base, quad, opacity=0.95, blur=0.4):
    """quad = TL,TR,BR,BL in base pixels; logo stretched to fill it."""
    W,H=base.size
    mark=logo_alpha(max(abs(quad[1][0]-quad[0][0]),abs(quad[2][0]-quad[3][0])))
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

#!/usr/bin/env python3
"""DEAD ROAD 404: original, reproducible low-poly GLB models.
No third-party model imports. Uses trimesh/Pillow/numpy only at AUTHORING time.
Coordinates match the v0.15 game collision/interaction anchors.
"""
from __future__ import annotations
import math, random
from pathlib import Path
import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'/'models'; OUT.mkdir(parents=True, exist_ok=True)
TEX=ROOT/'public'/'textures'; TEX.mkdir(parents=True,exist_ok=True)
RNG=random.Random(1992)
COL={
 'body':(19,23,32,255),'steel':(85,78,78,255),'chrome':(168,159,139,255),'gold':(194,147,74,255),
 'tire':(22,23,29,255),'glass':(63,98,107,255),'leather':(61,42,43,255),'interior':(39,35,38,255),
 'light':(254,200,123,255),'red':(154,38,48,255),'amber':(218,131,62,255),
 'plaster':(158,132,111,255),'concrete':(90,84,80,255),'rust':(123,63,54,255),
 'petrol':(113,46,51,255),'roof':(65,45,56,255),'dark':(31,31,38,255),
 'sage':(85,104,93,255),'beige':(181,161,134,255),'motel':(132,89,95,255),
}

def create_material(name, image=None, rough=.8,metal=.0,alpha='OPAQUE'):
 return PBRMaterial(name=name,baseColorFactor=[255,255,255,255],baseColorTexture=image,roughnessFactor=rough,metallicFactor=metal,alphaMode=alpha,doubleSided=True)
M={k:create_material(k, rough=.24 if k in ('body','glass') else .65 if k in ('steel','chrome','gold') else .9,metal=.75 if k in ('chrome','steel') else .4 if k=='gold' else .35 if k=='body' else 0) for k in COL}

def tinted(mesh,key):
 mesh.visual.vertex_colors=np.tile(np.array(COL[key],dtype=np.uint8), (len(mesh.vertices),1))
 return mesh

def box(size,center,key):
 m=trimesh.creation.box(extents=size); m.apply_translation(center);return tinted(m,key)

def cylinder(radius,height,center,key,sections=16,axis='y'):
 m=trimesh.creation.cylinder(radius=radius,height=height,sections=sections)
 if axis=='y':m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
 if axis=='x':m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
 m.apply_translation(center);return tinted(m,key)

def quad(p,key):
 vertices=np.asarray(p,dtype=float);mesh=trimesh.Trimesh(vertices=vertices,faces=[[0,1,2],[0,2,3]],process=False)
 return tinted(mesh,key)

def tapered(stations,key):
 # stations are (z, half_width, bottom_y, flank_y, top_y)
 verts=[];face=[]
 for z,w,low,side,top in stations:
  verts += [[-w,low,z],[-w,side,z],[-w*.82,top,z],[w*.82,top,z],[w,side,z],[w,low,z]]
 for i in range(len(stations)-1):
  for j in range(5):
   a=i*6+j;b=i*6+j+1;c=(i+1)*6+j;d=(i+1)*6+j+1
   face.extend([[a,c,d],[a,d,b]])
  face.extend([[i*6,(i+1)*6,(i+1)*6+5],[i*6,(i+1)*6+5,i*6+5]])
 face += [[0,5,4],[0,4,3],[0,3,2],[0,2,1]]
 j=(len(stations)-1)*6
 face += [[j,j+1,j+2],[j,j+2,j+3],[j,j+3,j+4],[j,j+4,j+5]]
 return tinted(trimesh.Trimesh(vertices=verts,faces=face,process=False),key)

class Asset:
 def __init__(self):self.groups={};self.textures=[];self.nodes=[]
 def add(self,mesh,key):self.groups.setdefault(key,[]).append(mesh)
 def b(self,size,center,key):self.add(box(size,center,key),key)
 def c(self,r,h,center,key,seg=16,axis='y'):self.add(cylinder(r,h,center,key,seg,axis),key)
 def q(self,points,key):self.add(quad(points,key),key)
 def textured(self,image,center,size,name,front=True,pbr=False):
  x,y,z=center;w,h=size
  pts=[[x-w/2,y-h/2,z],[x+w/2,y-h/2,z],[x+w/2,y+h/2,z],[x-w/2,y+h/2,z]]
  mesh=trimesh.Trimesh(vertices=pts,faces=[[0,1,2],[0,2,3]],process=False)
  mesh.visual=TextureVisuals(uv=np.array([[0,0],[1,0],[1,1],[0,1]],dtype=float),material=pbr_surface_material(image,name,rough=.91) if pbr else create_material(name,image,rough=.82))
  self.textures.append((mesh,name))
 def textured_xz(self,image,center,size,name,alpha='BLEND'):
  x,y,z=center;w,d=size
  points=np.array([[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2]])
  mesh=trimesh.Trimesh(vertices=points,faces=[[0,2,1],[0,3,2]],process=False)
  mesh.visual=TextureVisuals(uv=np.array([[0,0],[1,0],[1,1],[0,1]],dtype=float),material=create_material(name,image,rough=.40,metal=.45,alpha=alpha))
  self.textures.append((mesh,name))
 def addnode(self,mesh,name,transform):self.nodes.append((mesh,name,transform))
 def save(self,name):
  scene=trimesh.Scene()
  for key, meshes in self.groups.items():
   combined=trimesh.util.concatenate(meshes)
   scene.add_geometry(combined,geom_name=f'{name}_{key}',node_name=f'{name}_{key}',metadata={'role':key})
  for mesh,n in self.textures:
   scene.add_geometry(mesh,geom_name=n,node_name=n)
  for mesh,n,t in self.nodes:
   scene.add_geometry(mesh,geom_name=n,node_name=n,transform=t)
  path=OUT/f'{name}.glb';path.write_bytes(scene.export(file_type='glb'))
  print(name,path.stat().st_size,'bytes',sum(len(m.faces) for m in scene.geometry.values()),'triangles',len(scene.geometry),'mesh nodes')
  return path

def font(sz=60):
 for name in ['/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf']:
  if Path(name).exists():return ImageFont.truetype(name,sz)
 return ImageFont.load_default()

def sign(title,subtitle,fg,bg,width=1024,height=256):
 im=Image.new('RGB',(width,height),bg);d=ImageDraw.Draw(im)
 d.rectangle((14,14,width-14,height-14),outline=fg,width=8)
 d.rectangle((24,24,width-24,height-24),outline='#514247',width=2)
 # retain periods, era-appropriate simple signwork with large typography
 d.text((width//2,height*.43),title,font=font(int(height*.30)),anchor='mm',fill=fg,stroke_width=1,stroke_fill='#2b1822')
 d.text((width//2,height*.78),subtitle,font=font(int(height*.095)),anchor='mm',fill='#e6caa0')
 for i in range(80):
  x=RNG.randrange(width);y=RNG.randrange(height)
  d.line((x,y,x+RNG.randrange(3,15),y),fill='#3b2833',width=RNG.choice([1,1,2]))
 return im

def texture_tile(kind,w=512,h=512):
 pal={'plaster':('#857363','#c0ad90','#524c47'),'asphalt':('#28262d','#756661','#131b22'),
 'motel':('#6b4d52','#b78d7e','#392f3e'),'carpaint':('#171c24','#3f444b','#070a11')}
 bg,hi,lo=pal[kind];im=Image.new('RGB',(w,h),bg);d=ImageDraw.Draw(im)
 for i in range(1000):
  x=RNG.randrange(w);y=RNG.randrange(h);r=RNG.randrange(1,6)
  d.line((x,y,x+RNG.randrange(3,27),y+RNG.randrange(-2,3)),fill=hi if i%5==0 else lo,width=1)
 if kind in ('plaster','motel'):
  for k in range(15):
   x=RNG.randrange(w);y=RNG.randrange(h)
   d.line((x,y,x+RNG.randrange(-30,45),y+RNG.randrange(10,90)),fill=lo,width=RNG.choice([1,2]))
 elif kind=='asphalt':
  for k in range(18):
   x=RNG.randrange(w);y=RNG.randrange(h)
   d.line((x,y,x+RNG.randrange(-30,50),y+RNG.randrange(15,90)),fill='#101219',width=2)
 return im

from phase17_detail import add_firebird_detail, add_station_detail, add_motel_detail, pbr_surface_material

def create_firebird():
 a=Asset()
 body=[(-2.58,1.07,.48,.76,.92),(-2.28,1.25,.43,.81,1.02),(-1.55,1.29,.42,.85,1.07),(-.86,1.30,.43,.86,1.10),(.15,1.25,.44,.88,1.12),(1.05,1.28,.43,.86,1.06),(1.86,1.25,.42,.83,.99),(2.42,1.17,.48,.78,.90),(2.62,1.04,.51,.73,.83)]
 a.add(tapered(body,'body'),'body')
 # Cabin has visibly sloped windscreen, framed side glass, long sloping rear hatch.
 a.add(tapered([(-.96,1.11,1.06,1.19,1.22),(-.58,1.06,1.09,1.60,1.73),(-.19,1.02,1.10,1.82,1.94),(.73,1.00,1.10,1.81,1.91),(1.55,1.08,1.02,1.16,1.19)],'body'),'body')
 a.q([[-.97,1.56,-.63],[.97,1.56,-.63],[.86,1.89,-.2],[-.86,1.89,-.2]],'glass')
 a.q([[-.98,1.52,.82],[.98,1.52,.82],[.96,1.13,1.57],[-.96,1.13,1.57]],'glass')
 for side in [-1,1]:
  a.q([[side*1.085,1.15,-.55],[side*1.105,1.66,-.26],[side*1.08,1.73,.72],[side*1.12,1.15,.72]],'glass')
  # gold pin stripes & chrome rocker sills
  a.b([.035,.05,4.3],[side*1.26,.68,-.02],'gold')
  a.b([.06,.025,2.7],[side*1.29,1.02,-.25],'chrome')
  a.b([.19,.11,.065],[side*1.26,1.0,-.30],'chrome')
  a.b([.13,.2,.4],[side*1.17,1.27,-.7],'body')
  # angular fenders, door seams defined by contrasting crisp trim
  for z in [-1.64,1.72]:
   for p in range(7):
    t=p/6;ang=math.pi*t
    a.b([.045,.045,.1],[side*1.29,.51+math.sin(ang)*.44,z+math.cos(ang)*.46],'gold')
  a.b([.34,.11,.10],[side*.94,.72,-2.55],'light')
  a.b([.63,.17,.08],[side*.72,.72,2.59],'red')
  a.b([.87,.19,.09],[side*.55,.57,-2.63],'dark')
  for i in range(6):a.b([.032,.125,.12],[side*(.25+i*.118),.57,-2.7],'chrome')
  # front marker lamps and tail chrome
  a.b([.22,.075,.08],[side*1.12,.72,-2.63],'amber')
  a.b([.45,.12,.08],[side*.98,.67,2.68],'chrome')
  # single small dual exhaust behind
  a.c(.095,.52,[side*.80,.41,2.75],'chrome',12,axis='x')
 # wider tapered bumpers
 a.b([2.36,.14,.15],[0,.52,-2.68],'chrome')
 a.b([2.40,.14,.16],[0,.53,2.68],'chrome')
 # Original abstract fire-hawk hood decal, an authored transparent texture.
 # Do not copy the real Pontiac/Trans Am trademarked bird artwork.
 hood=Image.new('RGBA',(512,512),(0,0,0,0));p=ImageDraw.Draw(hood)
 for side in [-1,1]:
  for k in range(7):
   anchor=256+side*(18+k*24);outer=256+side*(35+k*27)
   p.polygon([(anchor,244-k*12),(outer,142+k*9),(256+side*(18+k*14),296+k*11)],fill=(196,133+5*k,59+5*k,220))
  p.line([(256,277),(256+side*32,309),(256+side*60,385)],fill=(233,166,72,210),width=7)
 p.polygon([(232,240),(256,190),(280,240),(256,320)],fill=(239,182,80,240))
 hood.save(TEX/'firebird-hood-404.png')
 a.textured_xz(hood,[0,1.135,-1.65],[1.78,1.24],'Firebird_Hood_Original',alpha='BLEND')
 # T-top roof brace strips
 a.b([2.05,.055,.09],[0,1.945,.19],'gold')
 a.b([.085,.055,1.15],[0,1.95,.23],'gold')
 # bonnet scoop and symmetric thunderbird motif in triangular facets
 a.b([.62,.14,.85],[0,1.14,-1.15],'body')
 for side in [-1,1]:
  for i in range(5):
   x=side*(.16+i*.145);z=-1.8+i*.075
   a.q([[x,1.152,z],[x+side*.17,1.154,z+.12],[x+side*.27,1.154,z+.43],[x+side*.04,1.152,z+.25]],'gold')
 # dashboard (cockpit works with unchanged cockpit camera location)
 a.b([2.05,.24,.60],[0,1.25,-.84],'leather')
 a.b([1.95,.065,.22],[0,1.43,-.72],'chrome')
 for x in [-.54,.54]:
  a.b([.85,.2,.85],[x,1.12,.67],'leather');a.b([.8,.8,.18],[x,1.56,.98],'leather')
  a.b([.42,.18,.21],[x,1.83,1.0],'leather')
 a.b([.33,.38,1.0],[0,1.02,.31],'leather')
 a.b([.41,.20,.08],[.39,1.35,-1.12],'amber')
 # gauge housings with needles rendered as geometry
 for x in [-.72,-.35]:
  a.c(.145,.04,[x,1.39,-1.18],'chrome',24,axis='x')
  a.b([.028,.14,.012],[x,1.42,-1.21],'light')
 # create visible circular steering ring using tubes around local XY plane, three spokes
 theta=np.linspace(0,2*math.pi,24)
 sx,sy,sz=-.54,1.50,-.49
 for t in range(len(theta)-1):
  x1=sx+math.cos(theta[t])*.29;y1=sy+math.sin(theta[t])*.29
  x2=sx+math.cos(theta[t+1])*.29;y2=sy+math.sin(theta[t+1])*.29
  length=math.hypot(x2-x1,y2-y1)
  m=box([.045,length+.01,.045],[(x1+x2)/2,(y1+y2)/2,sz],'dark')
  m.apply_transform(trimesh.transformations.rotation_matrix(math.atan2(x2-x1,y2-y1),[0,0,1],point=[(x1+x2)/2,(y1+y2)/2,sz]));a.add(m,'dark')
 a.b([.20,.055,.055],[-.54,1.5,-.49],'chrome')
 # independent wheel nodes, with local wheels rotated around X by JS
 for side in [-1,1]:
  for z,front in [(-1.55,True),(1.61,False)]:
   parts=[cylinder(.485,.30,[0,0,0],'tire',20,axis='x'),cylinder(.30,.325,[0,0,0],'chrome',18,axis='x'),
          cylinder(.19,.35,[0,0,0],'dark',16,axis='x'),cylinder(.055,.36,[0,0,0],'gold',12,axis='x')]
   for k in range(8):
    ang=k*math.pi/4
    parts.append(box([.35,.055,.055],[0,math.sin(ang)*.22,math.cos(ang)*.22],'chrome'))
   wheel=trimesh.util.concatenate(parts)
   label=('F' if front else 'R')+('L' if side<0 else 'R')
   t=trimesh.transformations.translation_matrix([side*1.25,.48,z]);a.addnode(wheel,'Wheel_'+label,t)
 # plate with original fictional branding (textured) on rear face
 plate=sign('404','NIGHT DRIVE','#edc68e','#332b38',512,128)
 a.textured(plate,[0,.59,2.705],[.87,.23],'Firebird_Plate')
 add_firebird_detail(a)
 return a.save('firebird_77')

def props_station(a):
 # shell follows existing x8..22, z-11..1, open middle of +Z storefront
 a.b([14,.20,12],[15,-.05,-5],'concrete')
 a.b([14,.4,12],[15,5.13,-5],'roof')
 a.b([14,4.96,.36],[15,2.48,-10.82],'plaster')
 for x in [8.18,21.82]:a.b([.36,5,12],[x,2.50,-5],'plaster')
 for x,w in [(10.99,5.48),(19.01,5.48)]:
  a.b([w,1.0,.28],[x,4.47,1.1],'plaster')
  a.b([w,.93,.22],[x,.53,1.1],'concrete')
  a.b([w,.11,.12],[x,3.36,1.23],'chrome')
  a.b([w,.13,.15],[x,1.04,1.26],'rust')
 # Free gap x 13.73..16.27 from y .0..3.2
 for x in [13.7,16.3]:a.b([.18,3.2,.22],[x,1.6,1.19],'chrome')
 a.b([2.9,.2,.22],[15,3.23,1.19],'gold')
 # windowpanes not across gap
 for x in [10.99,19.01]:
  a.b([4.45,2.03,.07],[x,2.13,1.26],'glass')
  for xx in [x-1.48,x,x+1.48]:a.b([.09,2.14,.16],[xx,2.15,1.30],'chrome')
 # canopy cladding and raised spine
 a.b([17,.40,7.2],[15,4.54,6.35],'roof')
 a.b([17,1.05,.26],[15,4.85,9.90],'petrol')
 a.b([17,.35,.3],[15,4.30,2.78],'gold')
 a.b([17,.09,7.2],[15,4.31,6.35],'beige')
 for x in [9.15,20.85]:
  for z in [3.25,9.32]:
   a.c(.20,4.24,[x,2.12,z],'chrome',12)
   a.b([.45,.24,.45],[x,.08,z],'concrete')
 # pumps / hoses / labels
 for x in [12,18]:
  a.b([1.40,2.18,1.15],[x,1.12,6.38],'petrol')
  a.b([1.16,.43,.12],[x,1.83,6.99],'dark')
  a.b([.63,.28,.045],[x,1.84,7.055],'amber')
  a.b([.30,.34,.18],[x+.42,.88,7.04],'dark')
  # hose: short dark cylinders; geometry cables segmented
  for i in range(9):
   t=i/8;y=1.55-.8*math.sin(math.pi*t)
   a.b([.05,.10,.05],[x+.66+.14*math.sin(t*math.pi),y,6.85-.55*t],'tire')
  a.b([2.2,.15,2.15],[x,.10,6.3],'concrete')
 # Roadside architecture: roofline cap, storm gutters, vent stacks,
 # varied fascia and period-correct service-bay cladding.
 for yy in [3.72,4.14,4.55]:
  a.b([14.4,.055,.13],[15,yy,1.48],'chrome')
 for x in [8.25,21.75]:
  a.b([.18,5.30,.18],[x,2.65,1.27],'rust')
  a.b([.28,.28,.28],[x,5.30,1.26],'gold')
 for x,z in [(10.65,-7.4),(19.8,-7.1)]:
  a.b([2.20,.75,1.4],[x,5.78,z],'steel')
  a.c(.34,.22,[x,6.27,z],'chrome',12)
  for j in range(5):a.b([.05,.42,.16],[x-.73+j*.33,5.88,z+.75],'dark')
 for j in range(12):
  # copper weathering on canopy fascia, varied segments rather than flat paint
  xx=7.2+j*1.45
  a.b([.6,.045,.04],[xx,5.19,9.98],'gold')
 for xx in [9.3,20.7]:
  a.b([.20,.12,7.10],[xx,4.20,6.35],'chrome')
  a.b([.40,.19,.4],[xx,2.0,6.32],'steel')
 # side service door gives depth without blocking the main entrance
 a.b([.07,2.55,1.7],[21.99,1.40,-6.15],'steel')
 for yy in [1.1,1.5,1.9,2.3]:a.b([.09,.05,1.50],[22.05,yy,-6.15],'rust')
 # decor and store interior, keep walkway center x 13.7..16.3
 for x in [10.0,20.0]:
  for z in [-7.75,-5.5]:
   a.b([2.55,2.32,.60],[x,1.21,z],'steel')
   for h in range(3):
    a.b([2.5,.10,.71],[x,.49+.73*h,z],'chrome')
    for j in range(4):
     a.b([.32,.35,.26],[x-.9+.56*j,.74+.73*h,z],'red' if j%2 else 'sage')
 a.b([4.05,1.25,1.30],[15,.68,-2.41],'rust')
 a.b([4.26,.14,1.45],[15,1.32,-2.41],'chrome')
 for i in range(3):
  x=18.5+i*.85
  a.b([.8,2.45,.94],[x,1.3,-8.92],'steel')
  a.b([.68,1.69,.035],[x,1.4,-8.38],'glass')
 a.b([.5,.34,.43],[14.4,1.56,-2.39],'dark') # radio remains at interactive anchor
 # illuminated signage and door opening
 a.b([9.4,1.4,.19],[15,4.38,1.51],'dark')
 a.textured(sign('SUNSPUR','FUEL  •  SERVICE  •  OPEN 24 HOURS','#f7ae65','#30212c'),[15,4.38,1.64],[9.1,1.27],'Station_SUNSPUR_FUEL')
 a.textured(sign('SUNSPUR','FUEL  •  1992  •  OPEN ALL NIGHT','#f4b86d','#602b32'),[15,4.86,10.054],[11.9,.81],'Station_Canopy_Sign')
 for x in [11,19]:
  a.textured(sign('SODA','DUSTLINE COLA','#efaf87','#63323d',512,512),[x,2.2,1.342],[1.7,1.58],f'Store_Poster_{x}')
 # fluorescent lamps on ceiling
 for x in [11.3,18.7]:
  for z in [-5,6.6]:
   a.b([2.3,.12,.35],[x,4.85 if z<0 else 4.25,z],'light')
 # dumpster / telephone booth still in americana1992.group
 # ribbed metal shutter partial on back wall
 for i in range(12):a.b([4.1,.045,.06],[15,1.15+i*.21,-10.55],'steel')
 # smaller environmental wall posters and faded tile surface
 wall_tex=texture_tile('plaster');wall_tex.save(TEX/'sunspur-plaster.png')
 a.textured(wall_tex,[15,3.10,-10.51],[10.9,1.8],'Sunspur_Backwall_Texture')
 add_station_detail(a)
 return a.save('sunspur_station')

def props_motel(a):
 x=-20
 a.b([8,.15,8],[x,-.02,-45],'concrete')
 a.b([8,.35,8],[x,3.27,-45],'roof')
 a.b([.40,3.05,8],[-23.82,1.55,-45],'motel')
 a.b([.40,3.05,8],[-16.18,1.55,-45],'motel')
 a.b([8,3.1,.36],[x,1.55,-48.84],'motel')
 # Entry +Z with gap x -21.45 .. -18.55
 for xx in [-22.71,-17.29]:a.b([2.58,3.04,.36],[xx,1.55,-41.16],'motel')
 a.b([9.20,.18,2.58],[x,.04,-39.81],'concrete')
 a.b([9.4,.24,1.9],[x,3.26,-40.38],'roof')
 a.b([9.40,.10,.16],[x,3.02,-39.40],'gold')
 for xx in [-23.5,-16.5]:a.b([.18,3,.20],[xx,1.54,-39.8],'chrome')
 # Exterior art-deco / mouldings
 for i in range(8):
  a.b([.10,.13,1.82],[-23.38+i*.96,.21,-39.80],'rust')
 for xx in [-22.55,-17.45]:
  a.b([1.72,1.48,.05],[xx,2.2,-40.93],'glass')
  a.b([1.90,.095,.16],[xx,2.99,-40.84],'chrome')
  a.b([1.90,.095,.16],[xx,1.42,-40.84],'chrome')
 a.b([6.1,1.10,.2],[x,4.10,-40.37],'dark')
 a.textured(sign('MILE 404','MOTEL   •   NO VACANCY','#f08d9a','#271f2b'),[x,4.10,-40.20],[5.9,.96],'Motel_404_Billboard')
 # Beds and bedside area, respect existing collision footprint
 a.b([2.50,.4,2.50],[-22,.48,-46.5],'leather')
 a.b([2.4,.20,1.07],[-22,.79,-47.10],'beige')
 a.b([1.50,.59,1.75],[-17.6,.38,-46],'leather')
 a.b([2.65,.025,3.75],[-20,.13,-45],'red')
 a.b([.8,.84,.66],[-21,.47,-48],'steel')
 a.b([1.2,.65,.5],[-17.65,.85,-48.04],'dark')
 a.b([.92,.52,.035],[-17.65,.88,-47.76],'sage')
 a.b([.40,.08,.30],[-20,.85,-45],'interior') # interactive tape position
 a.b([.40,.33,.40],[-20,1.38,-48.1],'light')
 # Different window heights, pipes and rainwater gutters break flat walls.
 for zz in [-47.9,-45.7,-43.5]:
  a.b([.08,.095,1.2],[-23.88,2.53,zz],'gold')
  a.b([.08,.10,1.20],[-16.12,2.48,zz],'gold')
 a.c(.10,3.05,[-23.82,1.54,-40.9],'chrome',10)
 a.c(.10,3.05,[-16.18,1.54,-40.9],'chrome',10)
 a.b([.43,.63,.14],[-22.4,2.55,-40.84],'amber')
 a.b([.43,.63,.14],[-17.6,2.55,-40.84],'amber')
 # Wall-mounted AC and a metal fire alarm cabinet
 a.b([1.02,.67,.44],[-16.0,2.65,-44.3],'steel')
 for i in range(6):a.b([.06,.42,.08],[-15.74,2.65,-44.55+i*.08],'dark')
 a.b([.58,.95,.19],[-23.72,1.45,-43.5],'rust')
 # Aluminium motel-number plates close to the doorway
 a.b([.45,.28,.08],[-21.68,2.62,-40.91],'gold')
 a.b([.45,.28,.08],[-18.32,2.62,-40.91],'gold')
 # wallpaper texture plane at back
 tx=texture_tile('motel');tx.save(TEX/'motel-wallpaper.png')
 a.textured(tx,[-20,1.8,-48.63],[7.35,2.45],'Motel_Wallpaper')
 # radio, CRT and period posters
 a.textured(sign('ROOM 04','CHECK OUT: NEVER','#e8ba87','#573440',512,256),[-20,2.28,-48.52],[2.20,.72],'Room04_Poster')
 for xx in [-23.7,-16.3]:
  a.b([.27,.13,7.7],[xx,2.92,-45],'chrome')
 add_motel_detail(a)
 return a.save('mile404_motel')

if __name__=='__main__':
 create_firebird();props_station(Asset());props_motel(Asset());

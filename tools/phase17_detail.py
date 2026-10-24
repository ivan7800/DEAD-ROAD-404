"""Original Fase 17 decorative modeling & PBR-ready authored texture maps.
Passes source-owned Asset instance; no downloaded imagery or third-party meshes.
"""
import math, random
from pathlib import Path
import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from trimesh.visual.texture import TextureVisuals
from trimesh.visual.material import PBRMaterial
R = Path(__file__).resolve().parents[1]
TEXTURES = R/'public'/'textures'
TEXTURES.mkdir(parents=True, exist_ok=True)
rng=random.Random(17041992)

def ft(size):
 for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf']:
  if Path(f).exists(): return ImageFont.truetype(f,size)
 return ImageFont.load_default()

def noise_texture(name, base, speck, dark, seed, size=512, overlay=None):
 rand=random.Random(seed)
 im=Image.new('RGB',(size,size),base);d=ImageDraw.Draw(im)
 for i in range(3400):
  x,y=rand.randrange(size),rand.randrange(size)
  z=rand.choice((1,1,1,2,3,4,8))
  d.ellipse((x,y,x+z,y+z),fill=speck if i%3==0 else dark)
 for i in range(25):
  x,y=rand.randrange(size),rand.randrange(size)
  d.line((x,y,x+rand.randrange(-18,22),y+rand.randrange(12,72)),fill=dark,width=rand.choice((1,2,3)))
 if overlay:overlay(d,size,rand)
 im.save(TEXTURES/f'{name}.png',optimize=True)
 return im

def logo(lines,w=1024,h=384,base='#291f2b',ink='#f5c18d',accent='#c86264',seed=1992):
 rr=random.Random(seed);im=Image.new('RGB',(w,h),base);d=ImageDraw.Draw(im)
 d.rounded_rectangle((16,16,w-17,h-17),radius=24,outline=accent,width=11)
 d.rectangle((34,34,w-34,h-34),outline='#77635d',width=3)
 # 80s / 90s storefront typography, no copyrighted logos.
 y=(h-65*len(lines))/2
 for idx,line in enumerate(lines):
  sz=int(min(112 if idx==0 else 51,w/max(1,len(line))*(1.4 if idx==0 else 1.13)))
  f=ft(max(15,sz))
  d.text((w/2,y+sz*.5),line,anchor='mm',font=f,fill=ink if idx==0 else '#e8b1a0',stroke_width=2,stroke_fill='#3c2934')
  y+=max(67,sz*1.15)
 for i in range(310):
  xx,yy=rr.randrange(w),rr.randrange(h)
  d.line((xx,yy,xx+rr.randint(1,8),yy),fill='#352733',width=rr.choice((1,1,2)))
 return im

def yz_image(a,image,x,y,z,w,h,name):
 # Mesh faces toward ±X. Textured plane improves side facades without blocking a door.
 p=np.asarray([[x,y-h/2,z-w/2],[x,y-h/2,z+w/2],[x,y+h/2,z+w/2],[x,y+h/2,z-w/2]],float)
 mesh=trimesh.Trimesh(vertices=p,faces=[[0,1,2],[0,2,3]],process=False)
 material=pbr_surface_material(image,name,rough=.90,metal=.02)
 mesh.visual=TextureVisuals(uv=np.asarray([[0,0],[1,0],[1,1],[0,1]]),material=material)
 a.textures.append((mesh,name))

def diag(a,p0,p1,thickness,key):
 # Straight beam between endpoints, using orienting quaternion/transform.
 p0=np.asarray(p0,float);p1=np.asarray(p1,float)
 vec=p1-p0;length=float(np.linalg.norm(vec))
 if length<1e-4:return
 m=trimesh.creation.box(extents=[thickness,thickness,length])
 mat=trimesh.geometry.align_vectors([0,0,1],vec/length)
 if mat is not None:m.apply_transform(mat)
 m.apply_translation((p0+p1)/2)
 col={'chrome':(164,159,151,255),'gold':(194,147,74,255),'dark':(31,31,38,255),'rust':(123,63,54,255),'steel':(85,78,78,255)}
 m.visual.vertex_colors=np.tile(np.array(col[key],dtype=np.uint8),(len(m.vertices),1))
 a.add(m,key)

def add_firebird_detail(a):
 # 1977 fastback with long hood, era-specific detailing rather than generic rectangular shapes.
 for side in (-1,1):
  # Pronounced nose spoiler, wheel-sculpting pinstripes and fastback C pillar.
  a.b([.94,.095,.32],[side*.78,.385,-2.47],'body')
  a.b([.38,.055,.085],[side*.94,.955,-2.47],'gold')
  a.b([.24,.13,.12],[side*1.13,.84,-2.48],'amber')
  a.b([.056,.09,1.7],[side*1.265,.95,.34],'chrome')
  a.b([.17,.035,.95],[side*1.23,1.16,1.44],'body')
  for j in range(4):
   a.b([.035,.016,.36],[side*1.27,.58,-.26+j*.47],'gold')
  # Individually articulated mirror shell and stem.
  diag(a,(side*1.09,1.2,-.76),(side*1.37,1.30,-.78),.065,'chrome')
  a.b([.30,.17,.21],[side*1.41,1.34,-.78],'body')
  # Door seam and weather strip at beltline.
  a.b([.026,.22,.035],[side*1.272,.88,.75],'dark')
  a.b([.026,.18,.035],[side*1.273,.88,-.77],'dark')
  # Tire treads / wheel bolts are on root, do not obscure wheel node names.
  for z in (-1.55,1.61):
   a.b([.035,.025,.80],[side*1.27,.27,z],'dark')
 # Hood crease and windshield washer/wiper arms.
 for side in (-1,1):
  a.b([.014,.025,1.48],[side*.85,1.145,-1.55],'gold')
  diag(a,(side*.72,1.52,-.57),(side*.12,1.53,-.52),.025,'dark')
  a.b([.30,.05,.22],[side*.95,.94,-2.51],'dark')
 # Rear spoiler low-profile, fastback louvers; not a copy of trademarked design.
 a.b([2.32,.095,.42],[0,1.01,2.32],'body')
 for zz in (1.22,1.39,1.56):
  a.b([1.65,.025,.036],[0,1.16+(1.56-zz)*.18,zz],'dark')
 # Cockpit: black vinyl with glowing analog instruments, stereo and gauge bezels.
 a.b([.68,.21,.14],[.48,1.30,-1.04],'dark')
 a.b([.40,.11,.17],[.48,1.30,-1.13],'chrome')
 for i in range(6):
  a.b([.034,.034,.015],[.31+i*.063,1.32,-1.236],'amber')
 for xx in (-.73,-.35):
  a.c(.125,.032,[xx,1.41,-1.20],'dark',18,axis='x')
  for i in range(8):
   ang=math.pi*i/7
   a.b([.025,.025,.018],[xx+.08*math.sin(ang),1.41+.075*math.cos(ang),-1.226],'light')
 # Faux leather stitching and cassette storage between seats.
 for side in (-1,1):
  for j in range(7):a.b([.016,.017,.085],[side*.55,1.235,.34+j*.092],'gold')
 a.b([.31,.05,.24],[0,1.24,.22],'dark')
 # High-res original graphic blends into the surface; no Pontiac logo.
 bird=Image.new('RGBA',(768,1024),(0,0,0,0));d=ImageDraw.Draw(bird)
 for side in (-1,1):
  for k in range(9):
   x=384+side*(32+k*27)
   d.polygon([(x,360+k*30),(x+side*(105+k*9),145+k*16),(x+side*(84+k*4),590+k*16),(384+side*18,545+k*7)],fill=(199,145+min(90,k*8),66,220))
  d.line([(384,500),(384+side*90,650),(384+side*150,900)],fill=(239,180,94,215),width=18)
 d.ellipse((343,357,425,430),fill=(229,175,91,250));d.polygon([(375,383),(410,383),(394,440)],fill=(36,29,30,250))
 bird.save(TEXTURES/'night-hawk-hood.png',optimize=True)
 a.textured_xz(bird,(0,1.157,-1.84),(1.72,1.42),'Night_Hawk_Hood_Artwork')
 # Fictional rear-plate as crisp PBR map.
 plate=logo(['DR 404','1992'],512,256,base='#2b2830',seed=77)
 a.textured(plate,(0,.72,2.742),(.92,.31),'Firebird_1992_Rear_Plate')

def add_station_detail(a):
 stucco=noise_texture('sunspur-stucco-1992','#9f806d','#c4aa8d','#6d5957',173)
 concrete=noise_texture('sunspur-cinderblock-1992','#777173','#aaa098','#4e4143',311,overlay=lambda d,s,r:[d.line((0,y,s,y),fill='#413e41',width=2) for y in range(0,s,64)])
 dirty=noise_texture('sunspur-awning-1992','#64313b','#b37e68','#391c30',101)
 a.textured(stucco,(15,3.82,1.39),(12.90,.65),'Sunspur_Front_Weathered_Stucco',pbr=True)
 a.textured(concrete,(15,3.07,-10.46),(13.10,1.15),'Sunspur_Backwall_Cinder',pbr=True)
 a.textured(dirty,(15,4.78,10.19),(16.1,.39),'Sunspur_Weathered_Canopy',pbr=True)
 # Oil stained gas forecourt and painted parking-bay markings.
 oil=Image.new('RGBA',(512,512),(0,0,0,0));od=ImageDraw.Draw(oil)
 for i in range(45):
  x,y=rng.randrange(512),rng.randrange(512);rr=rng.randrange(5,48)
  od.ellipse((x-rr,y-rr/3,x+rr,y+rr/3),fill=(29,25,32,rng.randrange(40,110)))
 oil=oil.filter(ImageFilter.GaussianBlur(3))
 a.textured_xz(oil,(15,.014,6.0),(16,7),'Sunspur_Oil_Stains')
 # Neon tube arrangement, rain gutters, segmented cladding, service vents.
 for side in (-1,1):
  x=15+side*6.86
  for zz in (-9,-6.3,-3.6,-.9):
   a.b([.11,4.70,.065],[x,2.40,zz],'gold')
  yz_image(a,concrete,22.08 if side==1 else 7.92,2.45,-5,11.5,4.0,'Sunspur_West_East_Plasters'+str(side))
 for x in (8.1,21.9):
  a.b([.12,.20,11.4],[x,5.32,-5],'chrome')
  a.b([.18,.09,3.1],[x,4.31,6.0],'gold')
 # Cafe/service sign from 1992, original typography.
 a.textured(logo(['SUNSPUR FUEL','LAST PUMP FOR 96 MILES'],1024,350,base='#38232e',ink='#f4bb80'),(15,4.44,1.76),(9.35,1.25),'F17_Original_Sunspur_Fascia')
 a.textured(logo(['NO CASH','AFTER MIDNIGHT'],512,256,base='#3c2836'),(20.10,2.9,1.35),(2.5,1.15),'Sunspur_Pay_Window_Poster')
 # Deep portal: recessed lintel, glass doors held open, wire handles.
 for side in (-1,1):
  x=15+side*1.42
  a.b([.045,2.8,.46],[x,1.65,1.05],'steel')
  a.b([.045,.85,.18],[x,1.45,1.41],'gold')
 a.b([3.00,.12,.34],[15,3.30,1.05],'chrome')
 # Vent system, diagonal bracing of canopy and varied detailed pumps.
 for side in (-1,1):
  xx=15+side*5.9
  diag(a,(xx,3.6,9.5),(xx,4.15,7.10),.11,'steel')
 for xx in (12,18):
  a.b([.86,.50,.15],[xx,1.74,7.11],'dark')
  a.b([.60,.24,.045],[xx,1.8,7.20],'light')
  for yy in (1.05,1.20):
   a.b([.74,.033,.075],[xx,yy,7.12],'chrome')
  a.b([.17,.20,.18],[xx+.40,.97,7.12],'dark')
  for yy in (.27,.44):a.b([1.44,.10,1.2],[xx,yy,6.35],'rust')
 # Retro Coke-like fictional vending branding and weathered store notices.
 a.textured(logo(['DUSTLINE','COLA'],512,640,base='#6d2d3c',ink='#fff0c5'),(9.95,1.96,-7.38),(1.78,2.11),'Dustline_Vending_Ad')
 # Roof edge geometry: alternating weathered trim.
 for i in range(14):
  x=8.25+i*1.03;a.b([.75,.055,.12],[x,5.41,1.21],'gold' if i%4 else 'rust')

def add_motel_detail(a):
 wall=noise_texture('mile404-rose-stucco','#8a6264','#bd8c81','#593e4e',404)
 carpet=noise_texture('mile404-carpet','#443943','#665057','#292331',448)
 wallpaper=noise_texture('mile404-wallpaper-1992','#a28874','#ceb99c','#624c5b',454,overlay=lambda d,s,r:[d.line((x,0,x,s),fill='#735761',width=2) for x in range(0,s,52)])
 a.textured(wall,(-22.70,2.25,-40.945),(2.11,1.42),'Mile404_East_Facade',pbr=True)
 a.textured(wall,(-17.30,2.25,-40.945),(2.11,1.42),'Mile404_West_Facade',pbr=True)
 a.textured(wall,(-20,2.53,-48.53),(7.20,.76),'Mile404_Rear_Wall',pbr=True)
 a.textured_xz(carpet,(-20,.17,-45.15),(6.9,6.0),'Mile404_Room_Worn_Carpet',alpha='OPAQUE')
 yz_image(a,wall,-23.56,2,-45,7.05,2.32,'Mile404_Side_Wall_Texture')
 yz_image(a,wall,-16.44,2,-45,7.05,2.32,'Mile404_Opposite_Wall_Texture')
 for x in (-23.46,-16.54):
  for z in (-48.15,-46.4,-44.65,-42.9):
   a.b([.13,.11,.85],[x,3.31,z],'gold')
 # Layered soffits, art deco entry, exterior boards and roof drainage.
 for side in (-1,1):
  xx=-20+side*3.40
  a.b([.23,.35,1.4],[xx,3.12,-39.66],'rust')
  a.b([.28,.18,1.0],[xx,3.38,-39.56],'chrome')
  a.b([.20,2.4,.20],[xx,1.24,-39.58],'gold')
  a.b([.31,.11,1.16],[xx,2.77,-39.60],'gold')
 for xx in (-22.65,-17.35):
  a.b([1.90,.06,.12],[xx,2.68,-40.86],'chrome')
  a.b([1.95,.06,.12],[xx,1.56,-40.86],'chrome')
  for side in (-1,1):a.b([.055,1.18,.1],[xx+side*.96,2.12,-40.86],'chrome')
  a.b([.065,1.17,.12],[xx,2.13,-40.85],'gold')
 # Recess doorway stays free of model geometry; threshold below player's capsule.
 a.b([2.82,.09,.61],[-20,.018,-40.62],'concrete')
 a.textured(logo(['MILE 404','ROOMS  -  ICE  -  TV'],1024,300,base='#3c2634',ink='#f3b28f',accent='#b95763'),(-20,4.15,-40.08),(6.28,1.09),'Mile404_Script_Lit_Sign')
 a.textured(logo(['VACANCY','?'],512,512,base='#292632',accent='#b35669'),(-16.82,2.65,-40.91),(1.25,.70),'Mile404_Vacancy_Side')
 # Furniture: lampshades, classic CRT, bedside sockets, phone cable.
 a.b([1.29,.16,.71],[-17.66,1.25,-48.03],'steel')
 a.b([.87,.49,.05],[-17.66,.91,-47.71],'dark')
 a.b([.78,.38,.045],[-17.66,.92,-47.65],'sage')
 for side in (-1,1):
  a.b([.17,.04,.06],[-17.66+side*.36,.64,-47.66],'gold')
 a.c(.21,.075,[-20.75,1.26,-47.75],'steel',12)
 a.b([.41,.07,.20],[-20.75,1.33,-47.75],'dark')
 a.c(.22,.47,[-21,1.56,-47.75],'light',12)
 # Distressed wallpaper framed by dark oak wainscot trim, no new collision.
 a.textured(wallpaper,(-20,2.12,-48.48),(7.15,1.33),'Mile404_Back_Original_Wallpaper',pbr=True)
 a.b([7.23,.13,.085],[-20,1.35,-48.40],'rust')
 # Extra corridor fixtures; x outside the open door's usable gap.
 for xx in (-22.80,-17.20):
  a.b([.27,.07,.15],[xx,2.86,-40.61],'gold')
  a.b([.11,.47,.1],[xx,2.57,-40.63],'light')

def pbr_surface_material(image,name,rough=.91,metal=.02):
 """Physically based color / tangent-space normal / glTF ORM maps from authored pixels."""
 image=image.convert('RGB'); im=image.resize((256,256));a=np.asarray(im,dtype=np.float32)/255
 luminance=.2126*a[:,:,0]+.7152*a[:,:,1]+.0722*a[:,:,2]
 dy,dx=np.gradient(luminance)
 bump=.5;nx=-dx*bump;ny=-dy*bump;nz=np.ones_like(nx)
 m=np.stack([nx,ny,nz],axis=-1);m/=np.linalg.norm(m,axis=-1,keepdims=True)
 normal=Image.fromarray((np.clip(m*.5+.5,0,1)*255).astype('uint8'),'RGB')
 orm=np.empty((256,256,3),dtype=np.uint8)
 orm[:,:,0]=255 # occlusion channel handled as neutral, with NO occlusionTexture assigned
 orm[:,:,1]=np.clip((rough-.07*luminance)*255,0,255).astype('uint8')
 orm[:,:,2]=int(255*metal)
 rough_map=Image.fromarray(orm,'RGB')
 # Source maps kept editable; they are embedded in GLB on export.
 normal.save(TEXTURES/(name+'-normal.png'),optimize=True)
 rough_map.save(TEXTURES/(name+'-metalrough.png'),optimize=True)
 return PBRMaterial(name=name,baseColorTexture=image,normalTexture=normal,metallicRoughnessTexture=rough_map,
                    metallicFactor=1,roughnessFactor=1,baseColorFactor=[255,255,255,255],doubleSided=True,alphaMode='OPAQUE')

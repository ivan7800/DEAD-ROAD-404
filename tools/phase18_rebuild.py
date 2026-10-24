#!/usr/bin/env python3
"""FASE 18: source-owned topology/UV art pass. No Blender or game-runtime dependency.

Rebuilds all three GLBs; never edits the F17 reference directory.
Requires trimesh, numpy and Pillow for *authoring only*.
Coordinates and anchor names are contractually compatible with F17 game code.
"""
from __future__ import annotations
import math, random, sys
from pathlib import Path
import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals
from generate_art_assets import ROOT, OUT, TEX, Asset, box, cylinder, tinted, sign, font, create_material

R = random.Random(19920404)

def rgba(rgb): return np.asarray((*rgb,255),dtype=np.uint8)
def shape(vertices, faces, rgb=(44,48,55)):
    m=trimesh.Trimesh(vertices=np.asarray(vertices,float),faces=np.asarray(faces,int),process=False)
    m.visual.vertex_colors=np.tile(rgba(rgb),(len(m.vertices),1))
    return m

def material_mesh(vertices,faces,uv,image,name,metal=.0,rough=.86,alpha="OPAQUE"):
    m=trimesh.Trimesh(vertices=np.asarray(vertices,float),faces=np.asarray(faces,int),process=False)
    pbr=PBRMaterial(name=name,baseColorTexture=image,metallicFactor=metal,roughnessFactor=rough,
                    baseColorFactor=[255,255,255,255],doubleSided=True,alphaMode=alpha)
    m.visual=TextureVisuals(uv=np.asarray(uv,float),material=pbr)
    return m

def beam(a,b,rgb=(138,118,103),width=.06,depth=.06):
    """Straight beam along arbitrary 3D edge with a bounded quaternion transform."""
    start,end=np.asarray(a,float),np.asarray(b,float)
    direction=end-start
    size=float(np.linalg.norm(direction)); assert size>.00001
    mesh=trimesh.creation.box(extents=[width,size,depth]);
    q=trimesh.geometry.align_vectors([0,1,0],direction/size)
    mesh.apply_transform(q);mesh.apply_translation((start+end)*.5)
    return tinted(mesh,'chrome') if False else with_color(mesh,rgb)

def with_color(mesh,rgb):
    mesh.visual.vertex_colors=np.tile(rgba(rgb),(len(mesh.vertices),1));return mesh

def add(scene,mesh,name):
    scene.add_geometry(mesh,geom_name=name,node_name=name)

def make_paint_texture():
    w=h=1024
    y,x=np.mgrid[0:h,0:w]
    # Original 1992 worn black lacquer, in UV projection, not an external car asset.
    noise=np.random.default_rng(404).normal(0,2.5,(h,w))
    bands=(np.sin(y/52)*1.6 +np.cos(x/125)*1.8)
    base=np.zeros((h,w,3),np.uint8)
    for i,t in enumerate([38,44,55]):base[:,:,i]=np.clip(t+noise+bands,0,255).astype(np.uint8)
    im=Image.fromarray(base,'RGB').convert('RGBA');d=ImageDraw.Draw(im,'RGBA')
    for side in [0,1]:
        # Warm pinstripe borders painted into body UV rather than loose meshes.
        x0=47 if side==0 else 978
        d.line([(x0,70),(x0,930)],fill=(195,141,70,220),width=5)
        d.line([(x0+(8 if side==0 else -8),70),(x0+(8 if side==0 else -8),930)],fill=(85,64,43,150),width=2)
    # subtle orange and gunmetal scratches
    for _ in range(90):
        sx=R.randrange(50,975);sy=R.randrange(60,965)
        d.line((sx,sy,sx+R.randrange(3,34),sy+R.randrange(-2,3)),fill=R.choice([(118,97,80,46),(205,174,130,24),(11,12,15,42)]),width=1)
    im.save(TEX/'f18-firebird-paint-uv.png');return im

def make_hood_decal():
    im=Image.new('RGBA',(768,768),(0,0,0,0));d=ImageDraw.Draw(im,'RGBA')
    # Original desert-firebird abstract wings; avoids marque logos/third-party assets.
    for side in [-1,1]:
        for i in range(7):
            yy=305+i*25
            d.polygon([(384+side*(10+i*7),260+i*7),
                       (384+side*(165+i*16),170+i*32),
                       (384+side*(107+i*10),322+i*17)],fill=(216,158+i*8,74+i*3,220-i*12))
        d.line([(384,390),(384+side*55,430),(384+side*125,540)],fill=(226,167,87,205),width=11)
    d.polygon([(384,188),(418,279),(384,345),(350,279)],fill=(242,188,96,232))
    im.save(TEX/'f18-hood-original.png');return im

def car_loft():
    # Nine sculpted cross-section coordinates per station: curved shoulders and hood.
    stations=[(-2.65,1.01,.79,.97),(-2.38,1.17,.81,1.00),(-1.78,1.25,.84,1.07),
              (-1.00,1.28,.86,1.14),(-.35,1.25,.85,1.14),(.65,1.24,.84,1.12),
              (1.36,1.30,.85,1.11),(2.02,1.30,.82,1.05),(2.56,1.10,.72,.87),(2.70,.95,.67,.78)]
    # top surface is one continuous cross-section spanning both shoulders
    vertices=[];uv=[]
    for z,w,side,top in stations:
        xs=[-w,-w*.975,-w*.86,-w*.58,-w*.30,0,w*.30,w*.58,w*.86,w*.975,w]
        ys=[side*.89,side+.065,top-.03,top+.018,top+.046,top+.058,
            top+.046,top+.018,top-.03,side+.065,side*.89]
        for x,y in zip(xs,ys):
            vertices.append([x,y,z]);uv.append([(x+1.44)/2.88,(z+2.75)/5.5])
    faces=[];n=11
    for s in range(len(stations)-1):
        for j in range(n-1):
            p=s*n+j;q=(s+1)*n+j
            faces += [[p,q,p+1],[q,q+1,p+1]]
    return vertices,faces,uv

def build_firebird():
    scene=trimesh.Scene()
    black=(24,28,35); gold=(194,145,75);gild=(153,113,65);chrome=(137,132,123)
    glass=(50,82,91);rear=(115,28,36);rubber=(24,24,28)
    paint=make_paint_texture();hood=make_hood_decal()
    v,f,uv=car_loft();add(scene,material_mesh(v,f,uv,paint,'F18_UV_Paint_SculptedShell',metal=.42,rough=.31),'F18_SculptedBody_UV')
    # Slightly tapered lower sill: pronounced wheel recesses, no massive slab over tires.
    add(scene,box([2.13,.18,4.55],[0,.56,-.02],'dark'),'F18_Underbody')
    for side in [-1,1]:
        # side rocker only between axles; arch exposure now visible in side elevation
        add(scene,box([.11,.25,2.0],[side*1.15,.65,-.04],'body'),f'SideRocker_{side}')
        for z in [-2.34,2.30]:
            add(scene,box([1.92,.22,.23],[0,.62,z],'body'),f'BumperValance_{side}_{z}')
        # sculpted outward shoulders around front and rear wheels
        for az in [-1.56,1.62]:
            angles=np.linspace(.10,math.pi-.10,15)
            inner=[];outer=[]
            for t in angles:
                inner.append([side*1.205,.50+.49*math.sin(t),az+.49*math.cos(t)])
                outer.append([side*1.252,.50+.57*math.sin(t),az+.57*math.cos(t)])
            ring=[];faces=[]
            for a,b in zip(inner,outer):ring.extend([a,b])
            for k in range(len(angles)-1):faces += [[2*k,2*k+2,2*k+1],[2*k+1,2*k+2,2*k+3]]
            add(scene,shape(ring,faces,gild),f'WheelArch_{side}_{az}')
        # side character line following a mostly horizontal shoulder
        for z1,z2 in [(-2.2,-1.98),(-1.0,.90),(2.17,2.35)]:
            add(scene,beam((side*1.266,1.008,z1),(side*1.258,.993,z2),gold,.028,.028),f'GoldSideLine_{side}_{z1}')
        add(scene,box([.055,.068,.24],[side*1.275,1.03,.12],'chrome'),f'DoorHandle_{side}')
        add(scene,box([.12,.30,.28],[side*1.12,1.36,-.76],'body'),f'WingMirror_{side}')
        add(scene,box([.02,.21,.24],[side*1.195,1.375,-.73],'glass'),f'MirrorGlass_{side}')
        # Rear triangular quarter-panel gill detail
        for i in range(3):add(scene,box([.035,.028,.32],[side*1.25,.84+i*.07,1.97],'chrome'),f'RearGills_{side}_{i}')
        # Dual rectangular sealed headlights, recessed grille: 1970s design language
        for x in [.48,.92]:
            add(scene,box([.34,.18,.045],[side*x,.78,-2.70],'light'),f'Headlight_{side}_{x}')
            add(scene,box([.41,.24,.050],[side*x,.78,-2.731],'dark'),f'HeadlightBezel_{side}_{x}')
            add(scene,box([.32,.14,.063],[side*x,.78,-2.765],'light'),f'HeadlightGlass_{side}_{x}')
        add(scene,box([.21,.12,.1],[side*1.10,.71,-2.73],'amber'),f'FrontMarker_{side}')
        add(scene,box([.99,.16,.07],[side*.63,.72,2.695],'red'),f'RearLamp_{side}')
    add(scene,box([2.20,.105,.15],[0,.46,-2.74],'chrome'),'FrontBumper')
    add(scene,box([2.29,.12,.16],[0,.45,2.77],'chrome'),'RearBumper')
    for j in range(12):add(scene,box([.037,.18,.065],[-.73+j*.13,.64,-2.75],'steel'),f'GrilleLouver_{j:02d}')
    # Fastback cabin: not a rectangular box; windshield slope and roof transitions are explicit meshes
    roof_section=[(-.97,1.12,1.17),(-.52,1.06,1.72),(-.27,.91,1.86),(.62,.91,1.86),(.91,.93,1.73),(1.58,1.17,1.10)]
    cabin_v=[];cabin_f=[]
    for z,w,y in roof_section:
        for x in [-w,-w*.88,0,w*.88,w]:cabin_v.append([x,y,z])
    for i in range(len(roof_section)-1):
        for k in range(4):
            p=i*5+k;q=(i+1)*5+k;cabin_f += [[p,q,p+1],[q,q+1,p+1]]
    add(scene,shape(cabin_v,cabin_f,black),'F18_Fastback_Roof_Sculpted')
    # Glass panels triangulated on sloped corners, with genuinely transparent named meshes.
    def panel(points,name):add(scene,shape(points,[[0,1,2],[0,2,3]],glass),name)
    panel([[-.91,1.16,-.974],[.91,1.16,-.974],[.80,1.72,-.514],[-.80,1.72,-.514]],'F18_Glass_Windshield')
    panel([[-.83,1.76,.80],[.83,1.76,.80],[1.05,1.12,1.564],[-1.05,1.12,1.564]],'F18_Glass_Rear_Hatch')
    for side in [-1,1]:
        panel([[side*1.14,1.17,-.76],[side*.94,1.77,-.32],[side*.94,1.78,.65],[side*1.11,1.17,.65]],f'F18_Glass_Side_{side}')
        for a,b in [((side*1.15,1.16,-.76),(side*.94,1.79,-.32)),
                    ((side*.94,1.79,-.32),(side*.94,1.79,.73)),
                    ((side*.94,1.79,.73),(side*1.13,1.17,1.36))]:
            add(scene,beam(a,b,black,.05,.045),f'F18_A_Pillar_{side}_{len(scene.geometry)}')
    add(scene,beam((-.93,1.82,.07),(.93,1.82,.07),gild,.07,.045),'TTop_CrossBrace')
    add(scene,beam((0,1.84,-.20),(0,1.84,.80),gild,.09,.03),'TTop_CentralBrace')
    # Hood scoop transitions with aggressive raised shoulder and open inlet
    sco_v=[[-.36,1.16,-1.78],[.36,1.16,-1.78],[.31,1.36,-1.42],[-.31,1.36,-1.42],
           [-.30,1.32,-.87],[.30,1.32,-.87]]
    sco_f=[[0,1,2],[0,2,3],[3,2,5],[3,5,4],[0,3,4],[1,5,2]]
    add(scene,shape(sco_v,sco_f,black),'F18_Shaker_Scoop_Profile')
    add(scene,box([.50,.08,.025],[0,1.303,-1.794],'dark'),'Shaker_Intake')
    # UV hood graphic: segmented mesh floats 2cm above sloped top; graphic original.
    z_vals=np.linspace(-2.22,-.87,10);x_vals=np.linspace(-.65,.65,10)
    de_v=[];de_uv=[];de_f=[]
    for zi,z in enumerate(z_vals):
        for xi,x in enumerate(x_vals):
            # Varies with hood curvature from front to back. Decal gently follows surface.
            h=1.037 +.105*(z+2.22)/(1.35) +.008*(1-(x/.75)**2)
            # Keep the scoop clean via a clipped center decal near scoop area.
            if -.41<x<.41 and z> -1.79: h=1.395
            de_v.append([x,h,z]);de_uv.append([xi/9,zi/9])
    for k in range(9):
        for j in range(9):
            p=k*10+j;q=(k+1)*10+j;de_f.extend([[p,q,p+1],[p+1,q,q+1]])
    add(scene,material_mesh(de_v,de_f,de_uv,hood,'F18_Original_Hood_Graphic',rough=.56,alpha='BLEND'), 'F18_Hood_Original_UV')
    # Cockpit retains in-game camera position (-.51,1.71,.23).
    add(scene,box([2.0,.15,.47],[0,1.29,-.82],'interior'),'DashLeather')
    add(scene,box([2.06,.11,.20],[0,1.37,-1.01],'chrome'),'DashChrome')
    for side in [-1,1]:
        x=side*.56
        add(scene,box([.76,.17,.83],[x,1.13,.63],'leather'),f'SeatBase_{side}')
        seat=box([.75,.58,.17],[x,1.32,.98],'leather')
        seat.apply_transform(trimesh.transformations.rotation_matrix(-.12,[1,0,0],point=[x,1.32,.98]));add(scene,seat,f'SeatBack_{side}')
        add(scene,box([.44,.14,.16],[x,1.61,1.02],'leather'),f'Headrest_{side}')
    for x in [-.69,-.33]:
        add(scene,cylinder(.15,.055,[x,1.37,-1.04],'chrome',28,axis='x'),f'Gauge_{x}')
        add(scene,box([.012,.075,.05],[x,1.40,-1.09],'amber'),f'GaugeNeedle_{x}')
    # Pilot's steering rim: torus oriented to face the occupant
    ring=trimesh.creation.annulus(r_min=.267,r_max=.311,height=.05,sections=24)
    ring.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]));ring.apply_translation([-.54,1.51,-.55])
    add(scene,with_color(ring,black),'Steering_Wheel_3D')
    add(scene,box([.40,.18,.06],[.44,1.29,-1.115],'steel'),'TapeDeck_Analog')
    add(scene,box([.31,.065,.026],[.44,1.34,-1.155],'amber'),'TapeDeck_Display')
    # Four independent wheel nodes retain exact animation contract.
    for side in [-1,1]:
        for z,isfront in [(-1.56,True),(1.62,False)]:
            parts=[cylinder(.48,.28,[0,0,0],'tire',32,axis='x'),
                   cylinder(.32,.295,[0,0,0],'chrome',32,axis='x'),
                   cylinder(.21,.305,[0,0,0],'dark',24,axis='x')]
            for k in range(10):
                angle=k*math.tau/10
                parts.append(box([.30,.05,.062],[0,.24*math.cos(angle),.24*math.sin(angle)],'gold'))
            wheel=trimesh.util.concatenate(parts)
            transform=trimesh.transformations.translation_matrix([side*1.27,.48,z])
            id=('F' if isfront else 'R')+('L' if side<0 else 'R')
            scene.add_geometry(wheel,geom_name='F18_Wheel_Mesh_'+id,node_name='Wheel_'+id,transform=transform)
    out=OUT/'firebird_77.glb';out.write_bytes(scene.export('glb'))
    return out

# Original high-detail UV work on station / motel without altering the walkable opening.
def make_brick_texture(name,ground,accent,mortar,seed=404):
    w=h=1024;im=Image.new('RGB',(w,h),ground);d=ImageDraw.Draw(im)
    rng=random.Random(seed)
    bw,bh=155,77
    for row,y in enumerate(range(-bh,h+bh,bh)):
        off=(row%2)*bw//2
        for x in range(-bw,w+bw,bw):
            ax=x+off
            sh=rng.randint(-19,19)
            c=tuple(max(0,min(255,v+sh)) for v in accent)
            d.rectangle((ax+3,y+3,ax+bw-3,y+bh-4),fill=c)
            for k in range(5):
                xx=ax+rng.randint(10,bw-11);yy=y+rng.randint(9,bh-9)
                d.line((xx,yy,xx+rng.randint(3,28),yy),fill=ground,width=1)
    for k in range(90):
        x=rng.randrange(w);y=rng.randrange(h)
        d.line((x,y,x+rng.randint(-20,30),y+rng.randint(5,60)),fill=mortar,width=rng.choice([1,1,2]))
    im.save(TEX/name);return im

def make_roof_texture(name,seed):
    im=Image.new('RGB',(512,512),(66,52,58));d=ImageDraw.Draw(im);rng=random.Random(seed)
    for x in range(0,512,25):
        d.line((x,0,x,512),fill=(119,89,82),width=3)
        d.line((x+4,0,x+4,512),fill=(33,35,39),width=2)
    for i in range(120):
        x=rng.randint(0,511);y=rng.randint(0,511)
        d.line((x,y,x+rng.randint(3,21),y),fill=(145,108,81),width=1)
    im.save(TEX/name);return im

def plane_uv(points,img,name,metal=0,rough=.92,uv=None):
    return material_mesh(points,[[0,1,2],[0,2,3]],uv or [(0,0),(1,0),(1,1),(0,1)],img,name,metal,rough)

def extra_station_geometry():
    scene=trimesh.load_scene(OUT/'sunspur_station.glb',process=False)
    bricks=make_brick_texture('f18-sunspur-ceramic-bricks-uv.png',(55,43,44),(132,86,72),(37,32,36),922)
    roof=make_roof_texture('f18-sunspur-corrugated-roof-uv.png',993)
    # Face is split around open doorway x=13.72..16.28; full walkable gap remains.
    for xlo,xhi,i in [(8.5,13.66,1),(16.34,21.5,2)]:
        points=[[xlo,1.03,1.39],[xhi,1.03,1.39],[xhi,3.41,1.39],[xlo,3.41,1.39]]
        add(scene,plane_uv(points,bricks,f'F18_Ceramic_Facade_UV_{i}'),f'F18_Ceramic_Facade_UV_{i}')
        for x in np.linspace(xlo+.3,xhi-.3,4):
            add(scene,box([.047,2.28,.12],[x,2.18,1.435],'chrome'),f'Facade_AluminiumMullion_{i}_{x:.2f}')
    # Ribbed fascia: not only blocks — shallow slanted rafters, profiles and support beams
    points=[[6.62,5.17,10.05],[23.38,5.17,10.05],[23.38,5.17,2.75],[6.62,5.17,2.75]]
    add(scene,plane_uv(points,roof,'F18_Canopy_Weathered_Roof_UV'), 'F18_Canopy_Weathered_Roof_UV')
    for xx in [7.4,10.6,19.4,22.5]:
        add(scene,beam((xx,4.29,2.97),(xx,3.78,4.4),(120,101,91),.12,.12),f'AngledAwningBrace_{xx}')
    for x in [8.45,21.55]:
        for z in [-10.15,-7.0,-3.6,-.35]:
            # exposed rainwater piping with brackets and downspouts
            add(scene,cylinder(.07,4.13,[x,2.07,z],'chrome',10),f'GutterDownspout_{x}_{z}')
    # Hand-modeled AC vent caps and shop signage shadow-depth
    for j,x in enumerate([10.0,20.0]):
        for z in [-4.7,-7.3]:
            add(scene,box([1.25,.085,.5],[x,2.7,z],'chrome'),f'ShelfAccent_{j}_{z}')
    # Monumental roadside sign creates a memorable building silhouette, as in 1980s US stations.
    # Supported outside playable doors; original signage, not real-world brand artwork.
    sx=20.65
    for h in [5.5,7.1,8.5]:
        add(scene,box([.22,.82,.25],[sx,h,1.57],'chrome'),f'F18_SignMast_{h}')
    add(scene,box([3.72,2.18,.27],[sx,8.65,1.57],'gold'),'F18_Sunspur_Road_Pylon_Frame')
    add(scene,box([3.52,1.97,.33],[sx,8.65,1.72],'dark'),'F18_Sunspur_Road_Pylon_Dark')
    pylon=sign('SUNSPUR','GAS • ICE • 24H','#ffc280','#54262f',width=1024,height=512)
    add(scene,plane_uv([[sx-1.71,7.68,1.913],[sx+1.71,7.68,1.913],[sx+1.71,9.62,1.913],[sx-1.71,9.62,1.913]],
        pylon,'F18_Sunspur_Pylon_Neon_UV'),'F18_Sunspur_Pylon_Neon_UV')
    # Slate bevels and retail shutters with UV material depth and fixed geometry.
    for xx in [9.0,21.0]:
        add(scene,beam((xx,5.27,1.52),(xx+(.48 if xx==9 else -.48),5.47,-.2),(140,99,85),.12,.16),f'F18_Awning_Cantilever_{xx}')
    for xx in [9.8,20.2]:
        for yy in [1.15,3.5]:
            add(scene,box([1.75,.13,.16],[xx,yy,1.48],'rust'),f'F18_WindowHorizontalFrame_{xx}_{yy}')
    # Dynamic-looking neon signage bulbs (geometry only, runtime illumination remains inexpensive)
    for i,x in enumerate(np.linspace(11.5,18.5,16)):
        add(scene,cylinder(.037,.048,[x,4.88,10.12],'light',8,axis='x'),f'FasciaNeonLamp_{i:02d}')
    (OUT/'sunspur_station.glb').write_bytes(scene.export('glb'))

def extra_motel_geometry():
    scene=trimesh.load_scene(OUT/'mile404_motel.glb',process=False)
    wall=make_brick_texture('f18-mile404-masonry-uv.png',(53,37,48),(129,85,90),(49,36,45),404)
    roof=make_roof_texture('f18-mile404-corrugated-roof-uv.png',1404)
    # Two facade panels alongside the entrance. No full-width wall over x=-21.45..-18.55.
    for left,right,i in [(-23.60,-21.55,1),(-18.45,-16.40,2)]:
        pts=[[left,.2,-40.91],[right,.2,-40.91],[right,3.03,-40.91],[left,3.03,-40.91]]
        add(scene,plane_uv(pts,wall,f'F18_Motel_Rose_Brick_UV_{i}'),f'F18_Motel_Rose_Brick_UV_{i}')
        for xx in [left+.16,right-.16]:
            add(scene,box([.07,2.89,.16],[xx,1.6,-40.84],'gold'),f'MotelColumnFrame_{i}_{xx}')
    # Roof trims in a stair-step silhouette (a shallow art-deco pediment)
    for ext,y,width in [(0,3.62,7.88),(.22,3.89,6.28),(.41,4.18,3.84)]:
        add(scene,box([width,.32,.38],[-20,y,-40.99+ext],'roof'),f'F18_Motel_Parapet_{y}')
    pts=[[-23.5,3.462,-40.0],[-16.5,3.462,-40.0],[-16.5,3.462,-41.55],[-23.5,3.462,-41.55]]
    add(scene,plane_uv(pts,roof,'F18_Motel_Awning_UV'),'F18_Motel_Awning_UV')
    # Diagonal structural portico bracing, all outside central x entrance.
    for side in [-1,1]:
        x=-20+side*3.5
        add(scene,beam((x,2.5,-40.7),(x,3.28,-39.75),(129,99,93),.11,.085),f'F18_Motel_AwningBrace_{side}')
        for y in [1.32,2.88]:
            add(scene,beam((x-.72,y,-40.78),(x+.72,y,-40.78),(188,151,108),.055,.065),f'F18_WindowTrim_{side}_{y}')
    # Side tower with stacked motel signage breaks the single-box silhouette.
    # It is safely outside walkable entry/interaction zones.
    pylon_x=-25.14
    add(scene,box([.21,6.7,.22],[pylon_x,3.42,-39.2],'chrome'),'F18_MotelTowerSupport')
    add(scene,box([2.07,2.78,.26],[pylon_x,6.06,-39.14],'gold'),'F18_MotelTowerFrame')
    add(scene,box([1.90,2.58,.30],[pylon_x,6.06,-38.94],'dark'),'F18_MotelTowerPanel')
    stack=sign('MILE','404 • VACANCY','#f2a9ae','#392535',512,640)
    add(scene,plane_uv([[pylon_x-.91,4.80,-38.76],[pylon_x+.91,4.80,-38.76],
              [pylon_x+.91,7.32,-38.76],[pylon_x-.91,7.32,-38.76]],stack,'F18_Motel_Roadside_Neon_UV'),
              'F18_Motel_Roadside_Neon_UV')
    # Raised motel vacancy sign bracket / grained light panels
    for x in [-22.62,-17.38]:
        add(scene,beam((x,3.38,-40.55),(x,4.5,-40.55),(148,133,131),.12,.12),f'MotelSignSupport_{x}')
    # Architraves physically frame the door opening without occluding its center.
    for x in [-21.49,-18.51]:
        add(scene,box([.13,2.73,.17],[x,1.38,-40.97],'chrome'),f'MotelDoorJamb_{x}')
    add(scene,box([3.13,.14,.18],[-20,2.81,-40.95],'gold'),'MotelDoorHeader')
    # Interior analogue TV housing deliberately clearer in first-person camera.
    add(scene,box([1.15,.93,.72],[-17.7,1.07,-47.5],'dark'),'F18_RetroCRT_Cabinet')
    add(scene,box([.93,.67,.024],[-17.7,1.14,-47.115],'sage'),'F18_RetroCRT_Screen')
    for i in range(5):add(scene,box([.035,.50,.025],[-18.08+i*.19,1.14,-47.099],'chrome'),f'F18_CRT_Scanline_{i}')
    (OUT/'mile404_motel.glb').write_bytes(scene.export('glb'))

if __name__=='__main__':
    assert (OUT/'sunspur_station.glb').exists() and (OUT/'mile404_motel.glb').exists(), 'First run generate_art_assets.py'
    paths=[build_firebird()]
    extra_station_geometry();extra_motel_geometry()
    for file in ['firebird_77.glb','sunspur_station.glb','mile404_motel.glb']:
        sc=trimesh.load_scene(OUT/file,process=False)
        print(file,'vertices',sum(len(g.vertices) for g in sc.geometry.values()),'tris',sum(len(g.faces) for g in sc.geometry.values()),'bytes',(OUT/file).stat().st_size)

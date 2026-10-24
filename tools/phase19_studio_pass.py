#!/usr/bin/env python3
"""DEAD ROAD 404 | F19 author-owned 3D refinement.

Requires numpy, pillow, trimesh at AUTHORING time. This script modifies only the
three models in the *current* checkout; always work on a copy of the F18 project.
No assets are extracted from games or commercial model libraries.
"""
from __future__ import annotations
import math
from pathlib import Path
import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from trimesh.visual.texture import TextureVisuals
from trimesh.visual.material import PBRMaterial
from phase18_rebuild import (OUT, TEX, add, box, cylinder, beam, shape, with_color,
                             rgba, sign, material_mesh)

F19 = 'F19_'

def tex_mat(image, name, metallic=0.0, roughness=.82, alpha='OPAQUE'):
    return PBRMaterial(name=name, baseColorTexture=image, baseColorFactor=[255]*4,
                       metallicFactor=metallic, roughnessFactor=roughness,
                       alphaMode=alpha, doubleSided=True)

def smoothstep(t):
    t=max(0.,min(1.,t)); return t*t*(3-2*t)

def interp(stations,z,col):
    if z<=stations[0][0]:return stations[0][col]
    if z>=stations[-1][0]:return stations[-1][col]
    for i in range(len(stations)-1):
        za,zb=stations[i][0],stations[i+1][0]
        if za<=z<=zb:
            t=smoothstep((z-za)/(zb-za))
            return stations[i][col]*(1-t)+stations[i+1][col]*t
    raise ValueError(z)

def auto_paint():
    """Period paint with low-frequency clear-coat variation, not noise soup."""
    sz=1024
    yy,xx=np.mgrid[0:sz,0:sz]
    rng=np.random.default_rng(1992)
    haze=2.8*np.sin(xx/113)+2*np.sin(yy/77)+rng.normal(0,1.15,(sz,sz))
    img=np.zeros((sz,sz,3),dtype=np.uint8)
    for k,v in enumerate((25,30,39)):
        img[:,:,k]=np.clip(v+haze+(xx/sz)*3,0,255).astype('uint8')
    im=Image.fromarray(img,'RGB');d=ImageDraw.Draw(im,'RGB')
    # Thin twin gold beltline, under clearcoat; weathered dust is painted on bottom.
    for c in (91,932):
        d.line((c,15,c,1009),fill=(168,119,62),width=4)
        d.line((c+7,20,c+7,1004),fill=(81,69,60),width=2)
    rng2=np.random.default_rng(707)
    for _ in range(115):
        x=int(rng2.integers(0,sz)); y=int(rng2.integers(0,sz))
        length=int(rng2.integers(4,41))
        c=int(rng2.integers(39,83))
        d.line((x,y,x+length,y-1),fill=(c,c-3,c-4),width=1)
    im.save(TEX/'f19-clearcoat-black-gold.png')
    return im

def make_window_texture(name,kind):
    w,h=640,512; rng=np.random.default_rng(sum(ord(c) for c in name))
    im=Image.new('RGB',(w,h),(37,62,64) if kind=='shop' else (57,39,53));d=ImageDraw.Draw(im)
    d.rectangle([0,0,w-1,h-1],outline=(167,122,72),width=18)
    # Behind-glass silhouette composition (shelves, product cartons, lamps), no photography.
    if kind=='shop':
        for y in [138,285,415]:
            d.rectangle([28,y,w-28,y+15],fill=(99,91,86))
            for x in range(37,w-50,53):
                k=int(rng.integers(0,4));colors=[(123,32,38),(147,118,60),(55,94,92),(113,78,104)]
                d.rectangle([x,y-75+7*k,x+34,y-6],fill=colors[k])
                d.rectangle([x+5,y-65+7*k,x+28,y-55+7*k],fill=(202,177,126))
        d.ellipse([402,15,530,110],fill=(211,170,95))
    else:
        d.rectangle([20,75,620,460],fill=(38,29,40))
        d.rectangle([95,126,385,425],fill=(105,67,68))
        d.rectangle([105,140,375,410],fill=(134,99,87))
        d.rectangle([450,110,560,324],fill=(70,78,84))
        d.ellipse([462,22,562,122],fill=(196,150,94))
    im=im.filter(ImageFilter.GaussianBlur(.35)); im.save(TEX/name)
    return im

def sheet_metal_texture():
    w,h=1024,512; im=Image.new('RGB',(w,h),(70,62,67)); d=ImageDraw.Draw(im)
    for x in range(0,w,32):
        d.rectangle((x,0,x+4,h),fill=(119,94,78))
        d.line((x+10,0,x+10,h),fill=(37,40,46),width=2)
    rng=np.random.default_rng(710)
    for _ in range(230):
        x,y=int(rng.integers(0,w)),int(rng.integers(0,h));
        d.line((x,y,x+int(rng.integers(2,30)),y+3),fill=(152,104,73),width=1)
    im.save(TEX/'f19-roof-corrugation.png'); return im

def road_sign_texture():
    im=Image.new('RGB',(1024,512),(36,34,48));d=ImageDraw.Draw(im)
    d.rectangle((14,14,1010,498),outline=(234,179,100),width=22)
    d.rectangle((38,38,986,472),outline=(78,46,57),width=11)
    fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'
    try:
        big=ImageFont.truetype(fontpath,152);small=ImageFont.truetype(fontpath,54)
    except OSError:big=small=ImageFont.load_default()
    d.text((512,186),'SUNSPUR',anchor='mm',font=big,fill=(237,189,121),stroke_width=2,stroke_fill=(104,49,52))
    d.text((512,363),'FUEL  •  ICE  •  24H',anchor='mm',font=small,fill=(188,142,104))
    im.save(TEX/'f19-sunspur-road-sign.png');return im

def uv_quad(points,img,name,metal=0,rough=.82,alpha='OPAQUE',uv=None):
    return material_mesh(points,[[0,1,2],[0,2,3]],uv or [(0,0),(1,0),(1,1),(0,1)],img,name,metal,rough,alpha)

def curved_shell(stations, paint):
    """Continuous, fully 3D roofline + shoulders with 21 smooth longitudinal bands.
    Front is -Z, cabin above the body has its own roof and glazing meshes.
    """
    verts=[];uv=[]
    xunit=[-1,-.995,-.96,-.91,-.84,-.72,-.52,-.28,0,.28,.52,.72,.84,.91,.96,.995,1]
    for z in np.linspace(-2.67,2.68,53):
        w=interp(stations,z,1)
        yy=interp(stations,z,2)
        upper=interp(stations,z,3)
        for x in xunit:
            # Continuous quarter panel curvature to central hood / rear deck.
            shoulder=max(0.,1-abs(x))
            roof=upper+.085*math.sin(math.pi*shoulder/1.0)**.7
            y=yy+(roof-yy)*max(0., 1-abs(x)**3)**.9
            verts.append([x*w,y,z]);uv.append(((x+1)*.5,(z+2.7)/5.4))
    tris=[];N=len(xunit)
    for row in range(52):
        for j in range(N-1):
            a=row*N+j;b=a+N
            tris.extend(((a,b,a+1),(a+1,b,b+1)))
    return material_mesh(verts,tris,uv,paint,'F19_Firebird_Painted_Shell',.62,.37)

def glass_mesh(points,name, opacity=.62):
    # glTF transparent factor and material name both tell renderer to blend.
    mesh=shape(points,[[0,1,2],[0,2,3]],(50,83,95))
    mesh.visual=TextureVisuals(material=PBRMaterial(name=name,baseColorFactor=[107,149,160,int(opacity*255)],
                                 metallicFactor=.24,roughnessFactor=.13,
                                 alphaMode='BLEND',doubleSided=True))
    return mesh

def remove(scene,prefixes):
    for name in list(scene.geometry.keys()):
        if any(name==p or name.startswith(p) for p in prefixes):
            # Deleting the geometry alone can leave an empty glTF node, which
            # bloats model diagnostics and may confuse asset authoring.
            scene.delete_geometry(name)
            if name in scene.graph.transforms.nodes:
                scene.graph.transforms.remove_node(name)

def car():
    path=OUT/'firebird_77.glb';s=trimesh.load_scene(path,process=False)
    remove(s,['F19_','F18_SculptedBody_UV','F18_Fastback_Roof_Sculpted','F18_Glass_','F18_Hood_Original_UV',
              'F18_A_Pillar_','TTop_CrossBrace','TTop_CentralBrace','Shaker_Intake',
              'F18_Shaker_Scoop_Profile'])
    paint=auto_paint()
    st=[(-2.67,1.08,.70,.82),(-2.39,1.18,.75,.89),(-1.85,1.29,.77,1.055),(-1.2,1.31,.80,1.11),
        (-.55,1.29,.84,1.13),(.30,1.27,.84,1.12),(1.08,1.29,.82,1.12),
        (1.70,1.30,.78,1.07),(2.34,1.23,.72,.97),(2.68,1.04,.67,.81)]
    add(s,curved_shell(st,paint),'F19_CurvedBody_53x17_UV')
    # Fenders: tuned raised lips follow wheel arch profiles but don't obscure tire sidewalls.
    for side in (-1,1):
        for wheel_z in (-1.56,1.62):
            p=[];f=[]
            for k,ang in enumerate(np.linspace(.11,math.pi-.11,26)):
                z=wheel_z+math.cos(ang)*.57;y=.51+math.sin(ang)*.55
                p.extend([[side*1.235,y,z],[side*1.293,y+.017,z]])
                if k<25:
                    t=k*2;f.extend([[t,t+1,t+3],[t,t+3,t+2]])
            add(s,shape(p,f,(175,124,67)),f'F19_RolledFender_{side}_{wheel_z}')
    # Pitched windscreen and fastback silhouettes. Fixed camera (-.51,1.71,.23) retained.
    # Outer roof frame is narrow, showing true window gap beneath; no huge roof box.
    rear=-.49;front=.79
    roof_sections=[(-.52,.77,1.82),(-.30,.91,1.882),(.53,.91,1.88),(.82,.87,1.70)]
    for i in range(len(roof_sections)-1):
        z0,w0,h0=roof_sections[i];z1,w1,h1=roof_sections[i+1]
        add(s,shape([[-w0,h0,z0],[w0,h0,z0],[w1,h1,z1],[-w1,h1,z1]],[[0,1,2],[0,2,3]],(21,25,30)),f'F19_RoofPanel_{i}')
    add(s,glass_mesh([[-1.01,1.14,-1.02],[1.01,1.14,-1.02],[.83,1.815,-.495],[-.83,1.815,-.495]],'F19_GLASS_Windshield'),'F19_GLASS_Windshield')
    add(s,glass_mesh([[-.91,1.82,.795],[.91,1.82,.795],[1.12,1.11,1.65],[-1.12,1.11,1.65]],'F19_GLASS_RearHatch'),'F19_GLASS_RearHatch')
    for side in [-1,1]:
        def P(x,y,z):return (side*x,y,z)
        add(s,glass_mesh([P(1.10,1.16,-.87),P(.91,1.80,-.38),P(.91,1.79,.73),P(1.11,1.15,.96)],f'F19_GLASS_Door_{side}'),f'F19_GLASS_Door_{side}')
        for i,(a,b) in enumerate([(P(1.13,1.13,-.96),P(.84,1.85,-.50)),
                  (P(.85,1.85,-.49),P(.91,1.85,.78)),
                  (P(.91,1.85,.78),P(1.13,1.13,1.62))]):
            add(s,beam(a,b,(142,103,66),.052,.052),f'F19_CabinPillar_{side}_{i}')
        # Sculpted side door indentation / gold coachline runs uninterrupted through side.
        add(s,beam(P(1.307,.965,-1.00),P(1.307,.961,1.10),(177,129,72),.025,.030),f'F19_SideCoachline_{side}')
        add(s,box([.21,.068,.07],[side*1.29,1.04,-.17],'chrome'),f'F19_DoorHandle_{side}')
        # Three-dimensional mirror stalk/cap, mirror faces outward.
        add(s,beam(P(1.06,1.18,-.78),P(1.29,1.32,-.77),(65,61,62),.055,.055),f'F19_MirrorStalk_{side}')
    # Sculpted hood intake (tapered, open front; visually not an awkward solid cuboid).
    pts=[[-.35,1.165,-1.70],[.35,1.165,-1.70],[.30,1.32,-1.31],[-.30,1.32,-1.31],
         [-.25,1.295,-.99],[.25,1.295,-.99]]
    add(s,shape(pts,[[0,1,2],[0,2,3],[3,2,5],[3,5,4],[0,3,4],[1,5,2]],(32,35,40)),'F19_ShakerIntake')
    add(s,box([.49,.085,.028],[0,1.21,-1.705],'dark'),'F19_ShakerMouth')
    # Original spread-wing sunset graphic, NOT Pontiac trademark artwork.
    hoodart=Image.new('RGBA',(768,768),(0,0,0,0));hd=ImageDraw.Draw(hoodart,'RGBA')
    for side in [-1,1]:
        for k in range(7):
            hd.polygon([(384+side*(12+k*9),210+k*20),
                        (384+side*(145+k*19),139+k*19),
                        (384+side*(68+k*13),333+k*19)],
                       fill=(213,129+k*8,57+k*4,210-k*9))
    hd.polygon([(384,180),(419,257),(384,349),(349,257)],fill=(232,177,87,240))
    hoodart.save(TEX/'f19-original-desert-bird.png')
    # Follow sculpted bonnet: avoids floating decals over the geometry.
    dv,du,df=[],[],[]
    for iz,z in enumerate(np.linspace(-2.36,-1.76,11)):
        for ix,x in enumerate(np.linspace(-.78,.78,17)):
            bodywidth=interp(st,z,1); yy=interp(st,z,2); upper=interp(st,z,3)
            rel=min(1,abs(x/bodywidth))
            h=yy+(upper+.085*math.sin(math.pi*max(0,1-rel))**.7-yy)*max(0,1-rel**3)**.9
            dv.append([x,h+.013,z]);du.append([ix/16,iz/10])
    for iz in range(10):
        for ix in range(16):
            a=iz*17+ix;b=a+17;df.extend([[a,b,a+1],[a+1,b,b+1]])
    add(s,material_mesh(dv,df,du,hoodart,'F19_Original_Wings_Decal',metal=.1,rough=.67,alpha='BLEND'),
        'F19_Original_Desert_Bird_UV')
    # Analog dash retro cues, a tactile cabin. Camera and wheel pivots unchanged.
    for x in (-.97,.97):
        add(s,box([.037,.19,.68],[x,1.20,-.84],'chrome'),f'F19_DashVentBorder_{x}')
    for i,x in enumerate(np.linspace(.24,.62,4)):
        add(s,box([.035,.02,.01],[x,1.36,-1.166],'amber'),f'F19_RadioLed_{i}')
    add(s,box([.11,.07,.12],[0,1.12,-.60],'steel'),'F19_GearSelector')
    # Distinctive horizontal tail reflector panel and fin-like exhaust edge.
    for x in (-.92,.92):
        add(s,box([.42,.13,.08],[x,.82,2.745],'red'),f'F19_TailReflector_{x}')
    path.write_bytes(s.export('glb'))
    return s

def station():
    path=OUT/'sunspur_station.glb';s=trimesh.load_scene(path,process=False)
    remove(s,['F19_'])
    roof=sheet_metal_texture();glass=make_window_texture('f19-sunspur-interior-windows.png','shop');signimg=road_sign_texture()
    # Full shop windows display a stocked interior; respect central doorway opening.
    for x0,x1,i in [(9.30,13.35,1),(16.65,20.70,2)]:
        z=1.555
        add(s,uv_quad([[x0,1.10,z],[x1,1.10,z],[x1,3.28,z],[x0,3.28,z]],glass,
                      f'F19_Sunspur_DepthWindow_{i}',rough=.16),f'F19_Sunspur_DepthWindow_{i}')
        for x in [x0,x1]:add(s,box([.095,2.3,.13],[x,2.20,z+.04],'steel'),f'F19_MetalWindowFrame_{i}_{x:.2f}')
        add(s,box([x1-x0,.08,.14],[(x0+x1)/2,3.33,z+.03],'gold'),f'F19_WindowLintel_{i}')
    # Distinctive 80s zig-zag folded-roof canopy silhouette; not a flat cube.
    for j, x0 in enumerate(np.linspace(7.0,22.4,13)):
        z0,z1=2.85,10.35
        slant=(j%2)*.08
        panel=uv_quad([[x0,4.94,z0],[x0+1.28,4.94+slant,z0],
                      [x0+1.28,5.24+slant,z1],[x0,5.24,z1]],roof,f'F19_Canopy_Fold_{j}',rough=.91)
        add(s,panel,f'F19_Canopy_Fold_{j}')
    for x in (7.62,22.36):
        for z in (3.40,9.45):
            add(s,beam((x,0.13,z),(x,4.84,z),(116,101,93),.21,.21),f'F19_CanopyColumn_{x}_{z}')
            add(s,beam((x,3.28,z),(x,4.94,z+1.05),(194,145,77),.09,.09),f'F19_CanopyBrace_{x}_{z}')
    # Centered luminous letterbox fascia facing road, its own original company identity.
    add(s,uv_quad([[11.02,4.30,10.42],[18.98,4.30,10.42],[18.98,5.03,10.42],[11.02,5.03,10.42]],
                  signimg,'F19_Sunspur_Fascia',rough=.55), 'F19_Sunspur_Fascia')
    # Three-dimensional shelf-like pump heads with glass/hoses.
    for px in [12,18]:
        add(s,box([1.34,.26,1.1],[px,2.04,6.3],'petrol'),f'F19_PumpCrown_{px}')
        add(s,box([.92,.48,.056],[px,1.43,6.90],'dark'),f'F19_PumpFace_{px}')
        add(s,box([.49,.18,.065],[px,1.65,6.942],'sage'),f'F19_PumpPrice_{px}')
        # Curved fuel hose via a short sweep, tube has actual 3D shape.
        pts=[[px+.59,1.66,6.52],[px+.82,1.55,6.60],[px+1.0,1.06,6.75],
             [px+.91,.60,6.74],[px+.66,.63,6.68]]
        for i in range(len(pts)-1):
            add(s,beam(pts[i],pts[i+1],(22,23,26),.055,.055),f'F19_Hose_{px}_{i}')
        add(s,box([.16,.36,.09],[px+.67,.65,6.68],'steel'),f'F19_PumpNozzle_{px}')
    # Warm pavement pools via artwork, physically fixed, no large interactive occlusions.
    stains=Image.new('RGBA',(512,512),(0,0,0,0));d=ImageDraw.Draw(stains,'RGBA')
    for j in range(19):
        t=(j*137)%450; d.ellipse([t,30+(j*67)%400,t+63,90+(j*67)%400], fill=(38,34,37,22))
    stains=stains.filter(ImageFilter.GaussianBlur(8))
    stains.save(TEX/'f19-sunspur-worn-forecourt.png')
    add(s,uv_quad([[7.5,.082,2.6],[22.5,.082,2.6],[22.5,.082,10.3],[7.5,.082,10.3]],stains,
                  'F19_Transparent_Forecourt',rough=.98,alpha='BLEND'),'F19_Transparent_Forecourt')
    path.write_bytes(s.export('glb'));return s

def motel():
    path=OUT/'mile404_motel.glb';s=trimesh.load_scene(path,process=False)
    remove(s,['F19_'])
    roo=sheet_metal_texture();glass=make_window_texture('f19-mile404-room-windows.png','motel')
    # A shallow gabled porte-cochere over the motel, stronger silhouette than stacked cubes.
    # Entrance remains between x -21.5 and -18.5, at y=0..2.75.
    tri_top=5.36
    for j,(xa,xb) in enumerate([(-23.60,-20.00),(-20.00,-16.40)]):
        mid=(xa+xb)*.5
        # Pitched roof strips, above existing fascia.
        v=[[xa,4.30,-41.3],[xb,4.30,-41.3],[xb,5.05,-43.0],[xa,5.05,-43.0]]
        add(s,uv_quad(v,roo,f'F19_Motel_PitchedAwning_{j}',rough=.87),f'F19_Motel_PitchedAwning_{j}')
    for x in [-23.31,-16.69]:
        for z in [-41.5,-39.7]:
            add(s,beam((x,.20,z),(x,4.30,z),(147,123,107),.16,.16),f'F19_MotelPorchPost_{x}_{z}')
    # Original 1992 illuminated room windows: darker inner life behind the panes.
    for i,(x0,x1) in enumerate([(-23.38,-21.75),(-18.25,-16.63)]):
        add(s,uv_quad([[x0,1.30,-40.66],[x1,1.30,-40.66],[x1,2.63,-40.66],[x0,2.63,-40.66]],
                     glass,f'F19_Motel_InteriorWindow_{i}',rough=.27),f'F19_Motel_InteriorWindow_{i}')
        for y in [1.26,2.68]:add(s,box([x1-x0+.15,.08,.12],[(x0+x1)/2,y,-40.60],'gold'),f'F19_MotelWindowTrim_{i}_{y}')
    # Raised 404 serif-free retro fascia, clearly visible at playable distance.
    msign=sign('MILE 404','NO VACANCY  •  LAST STOP','#f3b3ad','#372535',width=1024,height=384)
    add(s,uv_quad([[-22.4,3.48,-40.71],[-17.6,3.48,-40.71],[-17.6,4.43,-40.71],[-22.4,4.43,-40.71]],
        msign,'F19_Mile404_GlowSign',rough=.7),'F19_Mile404_GlowSign')
    # Gritty oversized vending machine outside (placed away from central entry).
    add(s,box([.87,1.81,.65],[-16.13,.98,-41.33],'petrol'),'F19_MotelCokeMachine')
    add(s,box([.68,.78,.055],[-16.13,1.39,-40.96],'sage'),'F19_MotelCokeWindow')
    for i in range(4):
        add(s,box([.11,.26,.074],[-16.34+i*.14,1.34,-40.924],'red'),f'F19_MotelCokeProduct_{i}')
    # Room lighting fixtures and deep overhang piers.
    for x in [-22.6,-17.4]:
        add(s,box([.23,.13,.28],[x,2.9,-40.58],'light'),f'F19_PorchLight_{x}')
    path.write_bytes(s.export('glb'));return s

def checks():
    names=['firebird_77','sunspur_station','mile404_motel']
    for name in names:
        sc=trimesh.load_scene(OUT/f'{name}.glb',process=False)
        invalid=[k for k,g in sc.geometry.items() if not np.isfinite(g.vertices).all()]
        assert not invalid,(name,invalid)
        count=sum(len(g.faces) for g in sc.geometry.values())
        assert count < 45000,(name,count)
        print(f'{name}: {len(sc.geometry)} meshes, {count} tris, {(OUT/f"{name}.glb").stat().st_size:,} bytes')
        if name=='firebird_77':
            for k in ['Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR']:
                assert k in sc.graph.nodes_geometry,(name,k)
        elif name=='sunspur_station':
            # Added objects must not obstruct the x=15,z=1.5 shop door passage.
            for key in sc.geometry:
                if key.startswith(F19):
                    b=sc.geometry[key].bounds
                    # transforms usually identity for new props, but report coords consistently.
                    if np.all(b[0] < [15,2.6,1.57]) and np.all(b[1] > [15,1.0,1.1]):
                        print('WARN station overlap candidate',key)
        else:
            assert all('Door' not in k for k in [] )

if __name__=='__main__':
    car();station();motel();checks()

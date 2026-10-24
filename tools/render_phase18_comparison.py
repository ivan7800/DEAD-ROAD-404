#!/usr/bin/env python3
"""Offline review: same VTK cameras for F17/F18. NOT Three.js screenshots."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import vtk
ROOT=Path(__file__).resolve().parents[1]
PREV=ROOT/'previews';PREV.mkdir(exist_ok=True)
F17=ROOT.parent/'dead-road-404-f17'/'public/models'
CAMS={
 'firebird_77':((5.8,3.2,-7.5),(0,1,0),30),
 'sunspur_station':((31,11.5,23.5),(15,3,-2.5),35),
 'mile404_motel':((-8,8,-22),(-20,2,-42),34),
}
def render(file,camera,target,fov,out):
 rw=vtk.vtkRenderWindow();rw.SetOffScreenRendering(True);rw.SetSize(1120,620)
 ren=vtk.vtkRenderer();ren.SetBackground(.07,.08,.115);ren.SetBackground2(.27,.19,.22);ren.GradientBackgroundOn();rw.AddRenderer(ren)
 imp=vtk.vtkGLTFImporter();imp.SetFileName(str(file));imp.SetRenderWindow(rw);imp.Update()
 c=ren.GetActiveCamera();c.SetPosition(*camera);c.SetFocalPoint(*target);c.SetViewUp(0,1,0);c.SetViewAngle(fov)
 ren.ResetCameraClippingRange()
 actors=ren.GetActors();actors.InitTraversal()
 while True:
  actor=actors.GetNextActor()
  if actor is None:break
  prop=actor.GetProperty();prop.SetAmbient(.38);prop.SetDiffuse(.78);prop.SetSpecular(.16)
 l=vtk.vtkLight();l.SetLightTypeToSceneLight();l.SetPosition(target[0]+4,20,target[2]+13);l.SetFocalPoint(*target);l.SetIntensity(1.15);ren.AddLight(l)
 rw.Render();win=vtk.vtkWindowToImageFilter();win.SetInput(rw);win.Update()
 w=vtk.vtkPNGWriter();w.SetFileName(str(out));w.SetInputConnection(win.GetOutputPort());w.Write()
 return out
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font=ImageFont.truetype(font_path,34)
small=ImageFont.truetype(font_path,23)
for name,(cam,target,fov) in CAMS.items():
 before=render(F17/(name+'.glb'),cam,target,fov,PREV/f'{name}-FASE17.png')
 after=render(ROOT/'public/models'/(name+'.glb'),cam,target,fov,PREV/f'{name}-FASE18.png')
 image=Image.new('RGB',(2240,720),'#161720');d=ImageDraw.Draw(image)
 image.paste(Image.open(before).convert('RGB'),(0,70));image.paste(Image.open(after).convert('RGB'),(1120,70))
 d.text((32,14),name.replace('_',' ').upper()+' | FASE 17',font=font,fill='#e1ba82')
 d.text((1152,14),name.replace('_',' ').upper()+' | FASE 18',font=font,fill='#e1ba82')
 d.text((28,682),'Renders VTK fuera del juego · mismas cámaras · no es una captura WebGL',font=small,fill='#a5a4ae')
 image.save(PREV/f'COMPARATIVA-{name}-F17-F18.jpg',quality=91)
 print('COMPARATIVA',name)

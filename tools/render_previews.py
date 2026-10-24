#!/usr/bin/env python3
"""Offline QA renders of source-owned GLBs with VTK (NOT Three.js screenshots)."""
from pathlib import Path
import vtk
R=Path(__file__).resolve().parents[1]
settings={
'firebird_77.glb':((8,4,-10),(0,1,0)),
'sunspur_station.glb':((35,14,30),(15,2,-3.5)),
'mile404_motel.glb':((-7,10,-23),(-20,2,-44)),
}
for name,(cam,target) in settings.items():
 rw=vtk.vtkRenderWindow();rw.SetOffScreenRendering(True);rw.SetSize(1200,700)
 ren=vtk.vtkRenderer();ren.SetBackground(.085,.10,.14);ren.SetBackground2(.20,.15,.19);ren.GradientBackgroundOn();rw.AddRenderer(ren)
 imp=vtk.vtkGLTFImporter();imp.SetFileName(str(R/'public/models'/name));imp.SetRenderWindow(rw);imp.Update()
 camera=ren.GetActiveCamera();camera.SetPosition(*cam);camera.SetFocalPoint(*target);camera.SetViewUp(0,1,0);camera.SetViewAngle(30)
 ren.ResetCameraClippingRange()
 actors=ren.GetActors();actors.InitTraversal()
 while True:
  actor=actors.GetNextActor()
  if actor is None:break
  prop=actor.GetProperty();prop.SetAmbient(.36);prop.SetDiffuse(.75);prop.SetSpecular(.12)
 light=vtk.vtkLight();light.SetLightTypeToSceneLight();light.SetPosition(target[0]+4,25,target[2]+12);light.SetFocalPoint(*target);light.SetIntensity(1.0);ren.AddLight(light)
 rw.Render();cap=vtk.vtkWindowToImageFilter();cap.SetInput(rw);cap.Update();writer=vtk.vtkPNGWriter()
 f=R/'previews'/f'{Path(name).stem}.png';f.parent.mkdir(exist_ok=True)
 writer.SetFileName(str(f));writer.SetInputConnection(cap.GetOutputPort());writer.Write()
 print(name,ren.GetActors().GetNumberOfItems(),'meshes rendered to',f)

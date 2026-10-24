"""Standalone VTK preview of combined F19 GLBs, NOT an in-game screenshot."""
from pathlib import Path
import numpy as np,trimesh,vtk
ROOT=Path(__file__).resolve().parents[1]
scene=trimesh.Scene()
def add_file(path,shift):
 model=trimesh.load_scene(ROOT/'public/models'/path,process=False)
 for i,mesh in enumerate(model.dump()):
  transform=trimesh.transformations.translation_matrix(shift)
  scene.add_geometry(mesh,geom_name=f'{path}-{i}',node_name=f'{path}-{i}',transform=transform)
add_file('firebird_77.glb',(0,.15,19))
add_file('sunspur_station.glb',(0,0,0))
add_file('mile404_motel.glb',(0,0,0))
road=trimesh.creation.box(extents=(9,.08,135));road.apply_translation((0,-.12,-22))
road.visual.vertex_colors=np.tile(np.array([36,34,41,255],dtype=np.uint8),(len(road.vertices),1))
scene.add_geometry(road)
for i,z in enumerate(range(-80,35,10)):
 lane=trimesh.creation.box(extents=(.12,.02,3));lane.apply_translation((0,-.065,z))
 lane.visual.vertex_colors=np.tile(np.array([195,160,117,255],dtype=np.uint8),(len(lane.vertices),1))
 scene.add_geometry(lane)
tmp=ROOT/'previews'/'scene-qa-temporary.glb';tmp.write_bytes(scene.export('glb'))
try:
 rw=vtk.vtkRenderWindow();rw.SetOffScreenRendering(True);rw.SetSize(1600,900)
 ren=vtk.vtkRenderer();ren.SetBackground(.045,.06,.11);ren.SetBackground2(.26,.18,.21);ren.GradientBackgroundOn();rw.AddRenderer(ren)
 imp=vtk.vtkGLTFImporter();imp.SetFileName(str(tmp));imp.SetRenderWindow(rw);imp.Update()
 camera=ren.GetActiveCamera();camera.SetPosition(45,27,49);camera.SetFocalPoint(3,1,-15);camera.SetViewUp(0,1,0);camera.SetViewAngle(36)
 ren.ResetCameraClippingRange()
 ambient=vtk.vtkLight();ambient.SetLightTypeToSceneLight();ambient.SetPosition(17,20,14);ambient.SetFocalPoint(12,0,-9);ambient.SetIntensity(1.0);ren.AddLight(ambient)
 rw.Render();cap=vtk.vtkWindowToImageFilter();cap.SetInput(rw);cap.Update();writer=vtk.vtkPNGWriter();writer.SetFileName(str(ROOT/'previews'/'ESCENA-COMBINADA-FASE-19.png'));writer.SetInputConnection(cap.GetOutputPort());writer.Write()
 print('Scene preview rendered:',ren.GetActors().GetNumberOfItems(),'meshes')
finally:
 tmp.unlink(missing_ok=True)

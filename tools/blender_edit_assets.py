"""Blender 4.x+ script. Import original GLBs for manual refinement without altering the originals.
Usage: blender --background --python tools/blender_edit_assets.py -- --all
No Blender is bundled; this script runs only in a Blender installation on your PC.
"""
import bpy,sys,argparse
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--all',action='store_true')
parser.add_argument('--asset',choices=['firebird_77','sunspur_station','mile404_motel'])
parser.add_argument('--export',action='store_true',help='Exports a SEPARATE adjusted GLB, does not overwrite game files')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
root=Path(__file__).resolve().parents[1]
work=root/'blender-work';work.mkdir(exist_ok=True)
assets=['firebird_77','sunspur_station','mile404_motel'] if args.all else [args.asset or 'firebird_77']
for name in assets:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(root/'public/models'/f'{name}.glb'))
 meshes=[ob for ob in bpy.context.scene.objects if ob.type=='MESH']
 for ob in meshes:
  # Reflections and smooth shading where appropriate. No indiscriminate bevels:
  # major material-group meshes are merged and beveling them would damage gameplay geometry.
  for poly in ob.data.polygons:poly.use_smooth = not any(x in ob.name.lower() for x in ('motel','station','poster','sign','wallpaper'))
  ob.display_type='TEXTURED'
  for mat in ob.data.materials:
   if not mat or not mat.use_nodes:continue
   for node in mat.node_tree.nodes:
    if node.type=='BSDF_PRINCIPLED':
     if 'Coat Weight' in node.inputs and 'firebird' in name:
      node.inputs['Coat Weight'].default_value=0.22
     if 'Coat Roughness' in node.inputs and 'firebird' in name:
      node.inputs['Coat Roughness'].default_value=0.26
 # Reference lights/camera marked clearly and hidden from GLB export.
 coll=bpy.data.collections.new('F19_AUTHORING_REFERENCE_ONLY');bpy.context.scene.collection.children.link(coll)
 bpy.ops.object.camera_add(location=(9,5,11) if name=='firebird_77' else (37,16,35))
 camera=bpy.context.object;camera.name='EDITOR_REFERENCE_CAMERA';camera.rotation_euler=(0.94,0,2.48)
 for previous in list(camera.users_collection):previous.objects.unlink(camera)
 coll.objects.link(camera);bpy.context.scene.camera=camera
 bpy.ops.object.light_add(type='AREA',location=(4,9,2) if name=='firebird_77' else (25,12,12))
 lamp=bpy.context.object;lamp.name='EDITOR_REFERENCE_SOFTBOX';lamp.data.energy=950;lamp.data.shape='DISK';lamp.data.size=7
 for previous in list(lamp.users_collection):previous.objects.unlink(lamp)
 coll.objects.link(lamp)
 bpy.ops.wm.save_as_mainfile(filepath=str(work/f'{name}-EDITABLE.blend'))
 if args.export:
  # Explicitly avoid overwriting the project's verified GLB originals.
  bpy.ops.export_scene.gltf(filepath=str(work/f'{name}-BLENDER-EXPORTED.glb'),export_format='GLB',use_selection=False,
    export_cameras=False,export_lights=False)
 print('READY',name,'meshes',len(meshes),'blend',work/f'{name}-EDITABLE.blend')

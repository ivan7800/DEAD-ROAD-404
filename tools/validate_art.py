#!/usr/bin/env python3
"""Structural checks for hand-authored GLB geometry and critical walkable gaps."""
import json,struct
from pathlib import Path
import numpy as np,trimesh
ROOT=Path(__file__).resolve().parents[1]
records={}
for key,name in [('firebird','firebird_77'),('station','sunspur_station'),('motel','mile404_motel')]:
 path=ROOT/'public/models'/f'{name}.glb'
 scene=trimesh.load_scene(path,process=False)
 meshes=[g for g in scene.geometry.values() if isinstance(g,trimesh.Trimesh)]
 assert meshes and all(np.isfinite(g.vertices).all() for g in meshes)
 triangles=sum(len(g.faces) for g in meshes)
 assert triangles<10000,(key,triangles)
 assert len(meshes)>=10
 records[key]={'meshes':len(meshes),'triangles':triangles,'bytes':path.stat().st_size,'bounds':scene.bounds.tolist()}
 if key=='firebird':
  nodes=set(scene.graph.nodes_geometry)
  for wheel in ['Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR']:assert wheel in nodes,wheel
 # Sample free space at center of original playable doors.
 if key in ('station','motel'):
  mesh=scene.to_mesh()
  triangles_xyz=mesh.vertices[mesh.faces]
  cx,cz=(15,1.1) if key=='station' else (-20,-41.1)
  xyz_min=triangles_xyz.min(axis=1); xyz_max=triangles_xyz.max(axis=1)
  # object collision in player capsule: x +/- 0.28, y [0.6,2.2], z +/-0.18
  overlap=(xyz_min[:,0]<cx+.28)&(xyz_max[:,0]>cx-.28)&(xyz_min[:,1]<2.20)&(xyz_max[:,1]>.60)&(xyz_min[:,2]<cz+.15)&(xyz_max[:,2]>cz-.15)
  assert not overlap.any(),(key,'door occupied by',int(overlap.sum()),'triangles')
print(json.dumps(records,indent=2))

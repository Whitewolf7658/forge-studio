import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import './styles/main.css';

const $ = (selector) => document.querySelector(selector);
const app = $('#app');
app.innerHTML = `
<div class="studio">
  <header class="topbar"><div class="brand"><span class="brand-mark">F</span><div><strong>FORGE</strong><span>STUDIO</span></div><span class="version">BETA 0.5</span></div>
    <nav class="main-menus"><button data-action="menu-file">File</button><button data-action="menu-edit">Edit</button><button data-action="menu-add">Add</button><button data-action="menu-view">View</button></nav><div class="top-actions"><button data-action="new" title="New scene">New</button><button data-action="save" title="Download project">Save project</button><button data-action="load" title="Load project">Open project</button><span class="separator"></span><button data-action="undo" title="Undo (Ctrl+Z)">↶</button><button data-action="redo" title="Redo (Ctrl+Shift+Z)">↷</button><span class="separator"></span><button class="primary" data-action="export">Export GLB ↗</button></div>
  </header>
  <div id="menu-popover" class="menu-popover hidden"></div><div class="workspace">
    <aside class="rail"><button class="tool active" data-mode="translate" title="Move (G)">✥<small>Move</small></button><button class="tool" data-mode="rotate" title="Rotate (R)">⟳<small>Rotate</small></button><button class="tool" data-mode="scale" title="Scale (S)">⤢<small>Scale</small></button><div class="rail-line"></div><button class="tool" data-action="edit-mode" title="Face editing (Tab)">▱<small>Faces</small></button><button class="tool" data-action="extrude-face" title="Extrude selected face (E)">⇧<small>Extrude</small></button><button class="tool" data-action="inset-face" title="Inset selected face (I)">◇<small>Inset</small></button><button class="tool" data-action="frame" title="Frame selection (F)">◎<small>Focus</small></button><button class="tool" data-action="delete" title="Delete selection">⌫<small>Delete</small></button></aside>
    <section class="viewport-shell"><div class="viewport-header"><div class="crumb">SCENE <span>/</span> <strong id="view-name">Perspective</strong></div><div class="view-chips"><button class="chip" data-action="toggle-grid">Grid</button><button class="chip" data-action="toggle-wire">Wireframe</button><button class="chip" data-action="toggle-projection">Perspective / Ortho</button></div></div><div id="viewport"></div><div class="viewport-hint" id="viewport-hint">LMB select · RMB orbit · Tab face mode · E extrude · I inset</div><div class="edit-tip hidden" id="edit-tip"><strong>EDIT MODE</strong><span>Click a triangle to select it. Drag a selected triangle to extrude with your mouse. Shift+drag to move its surface. E extrude · I inset · Tab exit</span></div><div class="axes"><span class="axis x">X</span><span class="axis y">Y</span><span class="axis z">Z</span></div><div class="viewport-bottom"><span id="selection-status">No selection</span><span>1 unit = 1 stud</span></div></section>
    <aside class="sidebar"><div class="panel scene-panel"><div class="panel-head"><div><span class="eyebrow">WORKSPACE</span><h2>Scene hierarchy</h2></div><button class="icon-button" data-action="add-menu" title="Add object">＋</button></div><div class="object-toolbar"><input id="object-search" placeholder="Search objects..." autocomplete="off"/><span id="object-count">0 objects</span></div><div id="hierarchy" class="hierarchy"></div><div class="add-wrap"><button id="add-object" class="add-button">＋ Add object <span>▾</span></button><div id="add-menu" class="add-menu hidden"><button data-add="Box">▣ Cube</button><button data-add="Sphere">◉ Sphere</button><button data-add="Cylinder">▤ Cylinder</button><button data-add="Cone">△ Cone</button><button data-add="Torus">◎ Torus</button><button data-add="Plane">▱ Plane</button></div></div></div>
      <div class="panel inspector-panel"><div class="panel-head"><div><span class="eyebrow">OBJECT</span><h2>Inspector</h2></div><span class="inspector-icon">⚙</span></div><div id="inspector-empty" class="empty-state"><div class="empty-symbol">◇</div><strong>Nothing selected</strong><p>Select an object in the viewport or hierarchy to edit it.</p></div><div id="inspector" class="hidden"><label class="field-label">NAME</label><input id="object-name" class="name-input"/><div class="section-title">TRANSFORM</div><div id="transform-fields"></div><div class="section-title">APPEARANCE</div><div class="appearance-row"><span>Base color</span><input id="object-color" type="color" value="#8096b6"/></div><div class="appearance-row"><span>Metalness</span><input id="metalness" type="range" min="0" max="1" step="0.01" value="0.1"/></div><div class="appearance-row"><span>Roughness</span><input id="roughness" type="range" min="0" max="1" step="0.01" value="0.7"/></div><div class="inspector-actions"><button data-action="duplicate">Duplicate</button><button data-action="delete">Delete</button></div></div></div>
    </aside>
  </div><footer class="statusbar"><div><span class="status-light"></span> READY <span class="footer-divider">|</span> WEBGL 3D EDITOR</div><div><span id="stats">0 objects</span><span class="footer-divider">|</span> FORGE STUDIO</div></footer>
</div><input type="file" id="file-picker" accept=".json,application/json" hidden />`;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#171c25');
scene.fog = new THREE.Fog('#171c25', 28, 90);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
camera.position.set(7, 6, 9);
const viewport = $('#viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
viewport.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.minDistance = 1;
orbit.maxDistance = 100;
orbit.target.set(0, 0.8, 0);
orbit.mouseButtons.LEFT = THREE.MOUSE.PAN;
orbit.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
orbit.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
orbit.update();
const hemi = new THREE.HemisphereLight('#d9e8ff', '#454b58', 2.2); scene.add(hemi);
const key = new THREE.DirectionalLight('#ffffff', 3); key.position.set(7, 12, 6); scene.add(key);
const fill = new THREE.DirectionalLight('#80aaff', 1.2); fill.position.set(-7, 5, -4); scene.add(fill);
const grid = new THREE.GridHelper(100, 100, '#455365', '#303946'); grid.material.transparent = true; grid.material.opacity = 0.58; scene.add(grid);
const axes = new THREE.AxesHelper(1.4); axes.position.set(-0.01, 0.012, -0.01); scene.add(axes);
const transform = new TransformControls(camera, renderer.domElement);
scene.add(transform.getHelper());
transform.addEventListener('dragging-changed', (event) => { orbit.enabled = !event.value; if (!event.value) { commitChange(); syncInspector(); } });
transform.addEventListener('objectChange', () => syncInspector());
const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
let editMode = false; let faceIndex = -1; let faceHighlight = null; let dragFace = null; let wireframe = false; let activeMeshTool = 'select'; let faceGroup = null; let faceHandle = null;
const objects = []; let selected = null; let history = []; let historyIndex = -1; let restoring = false; let idCounter = 1;
const types = ['Box', 'Sphere', 'Cylinder', 'Cone', 'Torus', 'Plane'];
function geometryFor(type) {
  switch (type) {
    case 'Sphere': return new THREE.SphereGeometry(0.9, 48, 32);
    case 'Cylinder': return new THREE.CylinderGeometry(0.8, 0.8, 1.8, 48);
    case 'Cone': return new THREE.ConeGeometry(0.9, 1.8, 48);
    case 'Torus': return new THREE.TorusGeometry(0.75, 0.25, 20, 64);
    case 'Plane': return new THREE.PlaneGeometry(2, 2);
    default: return new THREE.BoxGeometry(1.8, 1.8, 1.8);
  }
}
function makeObject(type, props = {}) {
  const material = new THREE.MeshStandardMaterial({ color: props.color || '#879bb7', metalness: props.metalness ?? 0.12, roughness: props.roughness ?? 0.56, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometryFor(type), material);
  mesh.material.wireframe = wireframe;
  if (props.geometry?.positions && Array.isArray(props.geometry.positions)) { mesh.geometry.dispose(); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(props.geometry.positions, 3)); g.computeVertexNormals(); mesh.geometry = g; }
  mesh.userData.edited = !!props.geometry;
  mesh.userData.type = type;
  mesh.userData.id = props.id || idCounter++;
  idCounter = Math.max(idCounter, mesh.userData.id + 1);
  mesh.name = props.name || `${type === 'Box' ? 'Cube' : type} ${String(mesh.userData.id).padStart(2, '0')}`;
  mesh.position.fromArray(props.position || [0, type === 'Plane' ? 0.01 : 1, 0]);
  mesh.rotation.set(...(props.rotation || [0, 0, 0]));
  mesh.scale.fromArray(props.scale || [1, 1, 1]);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh); objects.push(mesh); return mesh;
}
function serialize() { return { version: 2, objects: objects.map(o => ({ id: o.userData.id, type: o.userData.type, name: o.name, position: o.position.toArray(), rotation: [o.rotation.x, o.rotation.y, o.rotation.z], scale: o.scale.toArray(), color: `#${o.material.color.getHexString()}`, metalness: o.material.metalness, roughness: o.material.roughness, ...(o.userData.edited ? { geometry: { positions: Array.from(o.geometry.getAttribute('position').array) } } : {}) })) }; }
function clearObjects() { clearFace(); select(null); for (const obj of objects) { scene.remove(obj); obj.geometry.dispose(); obj.material.dispose(); } objects.length = 0; }
function restore(data, preferredId = null) { if (!data || !Array.isArray(data.objects) || data.objects.length > 2000) throw Error('Invalid project'); restoring = true; clearObjects(); for (const item of data.objects) if (types.includes(item.type)) makeObject(item.type, item); select(objects.find(o => o.userData.id === preferredId) || null); renderHierarchy(); restoring = false; }
function commitChange() { if (restoring) return; const snapshot = JSON.stringify(serialize()); if (history[historyIndex] === snapshot) return; history = history.slice(0, historyIndex + 1); history.push(snapshot); if (history.length > 80) history.shift(); historyIndex = history.length - 1; }
function undo() { if (historyIndex > 0) { const id = selected?.userData.id; restore(JSON.parse(history[--historyIndex]), id); } }
function redo() { if (historyIndex < history.length - 1) { const id = selected?.userData.id; restore(JSON.parse(history[++historyIndex]), id); } }
function select(obj) { clearFace(); selected = obj; transform.detach(); if (obj) transform.attach(obj); $('#inspector').classList.toggle('hidden', !obj); $('#inspector-empty').classList.toggle('hidden', !!obj); $('#selection-status').textContent = obj ? `◈ ${obj.name}` : 'No selection'; renderHierarchy(); syncInspector(); }
function renderHierarchy() { const search = ($('#object-search').value || '').toLowerCase(); $('#hierarchy').innerHTML = ''; for (const obj of objects.filter(o => o.name.toLowerCase().includes(search))) { const row = document.createElement('button'); row.className = `object-row ${obj === selected ? 'selected' : ''}`; row.innerHTML = `<span class="object-symbol">${({ Box: '▣', Sphere: '◉', Cylinder: '▤', Cone: '△', Torus: '◎', Plane: '▱' })[obj.userData.type]}</span><span class="object-title"></span><span class="object-type">${obj.userData.type}</span>`; row.querySelector('.object-title').textContent = obj.name; row.onclick = () => select(obj); $('#hierarchy').appendChild(row); } $('#object-count').textContent = `${objects.length} objects`; $('#stats').textContent = `${objects.length} objects · ${objects.reduce((n, o) => n + o.geometry.attributes.position.count, 0).toLocaleString()} vertices`; }
const groups = [{ key: 'position', title: 'Position', labels: ['X', 'Y', 'Z'], colors: ['x', 'y', 'z'] }, { key: 'rotation', title: 'Rotation', labels: ['X', 'Y', 'Z'], colors: ['x', 'y', 'z'] }, { key: 'scale', title: 'Scale', labels: ['X', 'Y', 'Z'], colors: ['x', 'y', 'z'] }];
$('#transform-fields').innerHTML = groups.map(group => `<div class="transform-group"><label>${group.title}</label><div class="triple">${group.labels.map((label, index) => `<div class="axis-input"><span class="${group.colors[index]}">${label}</span><input type="number" step="0.1" data-field="${group.key}" data-axis="${index}" /></div>`).join('')}</div></div>`).join('');
function syncInspector() { if (!selected) return; $('#object-name').value = selected.name; for (const input of document.querySelectorAll('[data-field]')) { const field = input.dataset.field; const index = Number(input.dataset.axis); const value = field === 'rotation' ? THREE.MathUtils.radToDeg(selected.rotation[['x', 'y', 'z'][index]]) : selected[field].getComponent(index); if (document.activeElement !== input) input.value = Number(value.toFixed(3)); } if (document.activeElement !== $('#object-color')) $('#object-color').value = `#${selected.material.color.getHexString()}`; $('#metalness').value = selected.material.metalness; $('#roughness').value = selected.material.roughness; }
function add(type) { const obj = makeObject(type); select(obj); commitChange(); $('#add-menu').classList.add('hidden'); }
function remove() { if (!selected) return; clearFace(); const obj = selected; select(null); scene.remove(obj); objects.splice(objects.indexOf(obj), 1); obj.geometry.dispose(); obj.material.dispose(); renderHierarchy(); commitChange(); }
function duplicate() { if (!selected) return; const data = serialize().objects.find(o => o.id === selected.userData.id); const clone = makeObject(data.type, { ...data, id: undefined, name: `${data.name} Copy`, geometry: data.geometry, position: [data.position[0] + 0.5, data.position[1], data.position[2] + 0.5] }); select(clone); commitChange(); }
function focus() { if (!selected) return; const box = new THREE.Box3().setFromObject(selected); const center = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3()).length(); orbit.target.copy(center); camera.position.copy(center).add(new THREE.Vector3(size * 1.3, size * 0.9, size * 1.3)); orbit.update(); }

function activateMeshTool(tool) {
  if (!selected) { alert('Select a mesh first.'); return; }
  if (!editMode) toggleEditMode(true);
  activeMeshTool = tool;
  document.querySelectorAll('[data-action="extrude-face"],[data-action="inset-face"]').forEach(b => b.classList.toggle('active', b.dataset.action === tool + '-face'));
  $('#selection-status').textContent = tool === 'extrude' ? 'EXTRUDE · Click and drag any surface, or drag the orange arrow' : 'INSET · Click a surface to inset';
}
function clearFace() {
  dragFace = null;
  faceIndex = -1;
  faceGroup = null;
  if (faceHandle) { scene.remove(faceHandle); faceHandle.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); faceHandle = null; }
  if (faceHighlight) {
    scene.remove(faceHighlight);
    faceHighlight.geometry.dispose();
    faceHighlight.material.dispose();
    faceHighlight = null;
  }
}
function toggleEditMode(force = null) {
  editMode = force == null ? !editMode : force;
  if (!editMode) activeMeshTool = 'select';
  clearFace();
  document.querySelector('[data-action="edit-mode"]').classList.toggle('active', editMode);
  transform.enabled = !editMode;
  transform.visible = !editMode;
  $('#edit-tip').classList.toggle('hidden', !editMode);
  $('#selection-status').textContent = editMode ? 'FACE MODE · Click a triangle · E extrude · I inset' : (selected?.name || 'No selection');
}
function faceRegion(mesh, index) {
  // Grow a connected coplanar region so a cube side behaves as a single quad.
  const geometry = mesh.geometry;
  const count = geometry.index ? geometry.index.count / 3 : geometry.getAttribute('position').count / 3;
  const faces = [];
  const origin = trianglePositions(mesh, index);
  const n = origin[1].clone().sub(origin[0]).cross(origin[2].clone().sub(origin[0])).normalize();
  const plane = n.dot(origin[0]);
  const key = v => v.toArray().map(x => Math.round(x * 10000)).join(',');
  const region = new Set([index]);
  const candidates = [];
  for (let i = 0; i < count; i++) {
    const t = trianglePositions(mesh, i);
    const normal = t[1].clone().sub(t[0]).cross(t[2].clone().sub(t[0])).normalize();
    if (normal.dot(n) > 0.999 && t.every(v => Math.abs(n.dot(v) - plane) < 0.0001)) candidates.push({ i, keys: t.map(key) });
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of candidates) {
      if (region.has(f.i)) continue;
      if ([...region].some(i => {
        const other = candidates.find(c => c.i === i);
        return other && f.keys.filter(k => other.keys.includes(k)).length >= 2;
      })) { region.add(f.i); changed = true; }
    }
  }
  const included = [...region].sort((a,b) => a-b);
  const edgeMap = new Map();
  for (const i of included) {
    const t = trianglePositions(mesh, i);
    for (let j = 0; j < 3; j++) {
      const a = t[j], b = t[(j+1)%3];
      const k1 = key(a), k2 = key(b);
      const id = [k1,k2].sort().join('|');
      if (edgeMap.has(id)) edgeMap.delete(id); else edgeMap.set(id, [a,b]);
    }
  }
  const edges = [...edgeMap.values()];
  const vertices = [];
  const seen = new Set();
  for (const [a,b] of edges) for (const v of [a,b]) if (!seen.has(key(v))) { vertices.push(v); seen.add(key(v)); }
  return { faces: included, edges, vertices, normal: n };
}
function trianglePositions(mesh, index) {
  const geometry = mesh.geometry;
  const attribute = geometry.getAttribute('position');
  const vertices = [];
  for (let i = 0; i < 3; i++) {
    const vertexIndex = geometry.index ? geometry.index.getX(index * 3 + i) : index * 3 + i;
    vertices.push(new THREE.Vector3().fromBufferAttribute(attribute, vertexIndex));
  }
  return vertices;
}
function markFace(index) {
  clearFace();
  if (!selected || index == null) return;
  faceIndex = index;
  faceGroup = faceRegion(selected, index);
  const positions = faceGroup.faces.flatMap(i => trianglePositions(selected, i).flatMap(v => v.toArray()));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  faceHighlight = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: 0x6caeff, transparent: true, opacity: 0.48, side: THREE.DoubleSide, depthTest: false
  }));
  faceHighlight.position.copy(selected.position);
  faceHighlight.quaternion.copy(selected.quaternion);
  faceHighlight.scale.copy(selected.scale);
  faceHighlight.renderOrder = 999;
  scene.add(faceHighlight);
  const center = faceGroup.vertices.reduce((a,v) => a.add(v), new THREE.Vector3()).multiplyScalar(1 / faceGroup.vertices.length);
  const world = selected.localToWorld(center.clone());
  const direction = faceGroup.normal.clone().transformDirection(selected.matrixWorld);
  faceHandle = new THREE.Group();
  const arrow = new THREE.ArrowHelper(direction, world, 0.85, 0xffb45c, 0.22, 0.13);
  arrow.userData.faceArrow = true;
  arrow.traverse(o => { o.userData.faceArrow = true; });
  faceHandle.add(arrow);
  scene.add(faceHandle);
  $('#selection-status').textContent = faceGroup.faces.length + ' triangles grouped as one surface · Drag to extrude';
}

function makeExtrusionBase(source, index, moveOnly) {
  const original = selected.geometry;
  const region = faceRegion(selected, index);
  const g = source.index ? source.toNonIndexed() : source.clone();
  const positions = Array.from(g.getAttribute('position').array);
  const topIndices = [];
  const vertexKey = v => v.toArray().map(x => Math.round(x*10000)).join(',');
  const keys = new Set(region.vertices.map(vertexKey));
  for (const face of region.faces) for (let j=0;j<3;j++) topIndices.push(face*3+j);
  if (!moveOnly) {
    // Each boundary edge becomes two side triangles. Shared interior edges are excluded.
    for (const [a,b] of region.edges) {
      const at = positions.length/3;
      positions.push(...a.toArray(),...b.toArray(),...b.toArray());
      positions.push(...a.toArray(),...b.toArray(),...a.toArray());
      topIndices.push(at+2, at+4);
    }
  }
  g.dispose();
  return { positions, normal: region.normal, topIndices };
}

function faceOperation(kind) {
  if (!editMode || !selected || faceIndex < 0) {
    alert('Select an object, turn on Faces (Tab), then click a triangle on its surface.');
    return;
  }
  const source = selected.geometry;
  const triangleCount = source.index ? source.index.count / 3 : source.getAttribute('position').count / 3;
  if (faceIndex >= triangleCount) return;
  const original = source.index ? source.toNonIndexed() : source.clone();
  const positions = Array.from(original.getAttribute('position').array);
  const triangle = trianglePositions(selected, faceIndex);
  const center = triangle[0].clone().add(triangle[1]).add(triangle[2]).multiplyScalar(1 / 3);
  const normal = triangle[1].clone().sub(triangle[0]).cross(triangle[2].clone().sub(triangle[0])).normalize();
  const top = kind === 'extrude'
    ? triangle.map(v => v.clone().addScaledVector(normal, 0.5))
    : triangle.map(v => center.clone().lerp(v, 0.65));
  const addTriangle = (a, b, c) => positions.push(...a.toArray(), ...b.toArray(), ...c.toArray());
  positions.splice(faceIndex * 9, 9);
  addTriangle(top[0], top[1], top[2]);
  for (let i = 0; i < 3; i++) {
    const next = (i + 1) % 3;
    addTriangle(triangle[i], triangle[next], top[next]);
    addTriangle(triangle[i], top[next], top[i]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  selected.geometry.dispose();
  selected.geometry = geometry;
  selected.userData.edited = true;
  original.dispose();
  clearFace();
  renderHierarchy();
  commitChange();
  $('#selection-status').textContent = kind === 'extrude' ? 'Face extruded · Select another triangle' : 'Face inset · Select another triangle';
}

function download(name, blob) { const a = document.createElement('a'); const url = URL.createObjectURL(blob); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
async function exportGLB() { const group = new THREE.Group(); for (const o of objects) group.add(o.clone()); if (!objects.length) return alert('Add an object before exporting.'); try { const buffer = await new GLTFExporter().parseAsync(group, { binary: true, onlyVisible: true }); download('forge-scene.glb', new Blob([buffer], { type: 'model/gltf-binary' })); } catch (error) { alert(`Export failed: ${error.message}`); } }
function action(name) { switch (name) { case 'new': if (objects.length && !confirm('Start a new scene? Download your project first if you want to keep it.')) return; clearObjects(); renderHierarchy(); commitChange(); break; case 'save': download('forge-project.json', new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' })); break; case 'load': $('#file-picker').click(); break; case 'export': exportGLB(); break; case 'undo': undo(); break; case 'redo': redo(); break; case 'delete': remove(); break; case 'duplicate': duplicate(); break; case 'frame': focus(); break; case 'edit-mode': toggleEditMode(); break; case 'extrude-face': activateMeshTool('extrude'); break; case 'inset-face': activateMeshTool('inset'); break; case 'add-menu': $('#add-menu').classList.toggle('hidden'); break; case 'toggle-grid': grid.visible = !grid.visible; axes.visible = grid.visible; break; case 'toggle-wire': wireframe = !wireframe; objects.forEach(o => o.material.wireframe = wireframe); break; case 'toggle-projection': camera.zoom = camera.zoom === 1 ? 1.7 : 1; camera.updateProjectionMatrix(); $('#view-name').textContent = camera.zoom === 1 ? 'Perspective' : 'Zoomed perspective'; break; case 'menu-file': showMenu('file'); break; case 'menu-edit': showMenu('edit'); break; case 'menu-add': showMenu('add'); break; case 'menu-view': showMenu('view'); break; } }
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => action(button.dataset.action)));
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { transform.setMode(button.dataset.mode); document.querySelectorAll('[data-mode]').forEach(el => el.classList.toggle('active', el === button)); }));
$('#add-object').onclick = () => action('add-menu');
document.querySelectorAll('[data-add]').forEach(button => button.onclick = () => add(button.dataset.add));
$('#object-search').oninput = renderHierarchy;
$('#object-name').addEventListener('change', event => { if (!selected) return; selected.name = event.target.value.trim() || selected.name; renderHierarchy(); syncInspector(); commitChange(); });
document.querySelectorAll('[data-field]').forEach(input => input.addEventListener('change', () => { if (!selected) return; const axis = ['x', 'y', 'z'][Number(input.dataset.axis)]; const value = Number(input.value); if (!Number.isFinite(value)) return; if (input.dataset.field === 'rotation') selected.rotation[axis] = THREE.MathUtils.degToRad(value); else selected[input.dataset.field][axis] = input.dataset.field === 'scale' ? Math.max(0.001, value) : value; syncInspector(); commitChange(); }));
$('#object-color').oninput = e => { if (selected) selected.material.color.set(e.target.value); };
$('#object-color').onchange = commitChange;
for (const field of ['metalness', 'roughness']) { $(`#${field}`).oninput = e => { if (selected) selected.material[field] = Number(e.target.value); }; $(`#${field}`).onchange = commitChange; }
$('#file-picker').onchange = async e => { const file = e.target.files[0]; if (!file) return; try { const data = JSON.parse(await file.text()); if (!data || !Array.isArray(data.objects)) throw Error('Not a Forge project'); restore(data); commitChange(); } catch (error) { alert(`Could not open project: ${error.message}`); } e.target.value = ''; };
const menuGroups = {
  file: [['New scene','new'],['Save project','save'],['Open project','load'],['Export GLB','export']],
  edit: [['Undo','undo'],['Redo','redo'],['Duplicate','duplicate'],['Delete','delete'],['Toggle face mode','edit-mode']],
  add: [['Cube','add:Box'],['Sphere','add:Sphere'],['Cylinder','add:Cylinder'],['Cone','add:Cone'],['Torus','add:Torus'],['Plane','add:Plane']],
  view: [['Frame selection','frame'],['Toggle grid','toggle-grid'],['Toggle wireframe','toggle-wire'],['Zoom view','toggle-projection']]
};
function showMenu(group) {
  const panel = $('#menu-popover');
  if (panel.dataset.group === group && !panel.classList.contains('hidden')) { panel.classList.add('hidden'); return; }
  panel.dataset.group = group;
  panel.innerHTML = '';
  for (const [label, command] of menuGroups[group]) {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = () => { panel.classList.add('hidden'); command.startsWith('add:') ? add(command.slice(4)) : action(command); };
    panel.appendChild(button);
  }
  panel.classList.remove('hidden');
}
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.main-menus, .menu-popover')) $('#menu-popover').classList.add('hidden');
});
let pointerDown = null;
renderer.domElement.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  pointerDown = { x: event.clientX, y: event.clientY };
  if (editMode && selected) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(selected, false);
    const handleHit = faceHandle && raycaster.intersectObjects(faceHandle.children, true).length > 0;
    const hitFace = hits[0]?.faceIndex;
    if (activeMeshTool === 'inset' && hitFace != null) { markFace(hitFace); faceOperation('inset'); pointerDown = null; return; }
    if ((activeMeshTool === 'extrude' && hitFace != null) || (handleHit && faceIndex >= 0)) {
      if (!handleHit) markFace(hitFace);
      dragFace = { startY: event.clientY, startX: event.clientX, started: false, shift: event.shiftKey, face: faceIndex, original: selected.geometry.clone(), base: null };
      renderer.domElement.setPointerCapture(event.pointerId);
    }
  }
});
renderer.domElement.addEventListener('pointermove', event => {
  if (!dragFace || !selected) return;
  const distance = Math.hypot(event.clientX - dragFace.startX, event.clientY - dragFace.startY);
  if (distance < 4 && !dragFace.started) return;
  if (!dragFace.started) {
    dragFace.started = true;
    dragFace.base = makeExtrusionBase(dragFace.original, dragFace.face, dragFace.shift);
  }
  const amount = Math.max(-8, Math.min(8, (dragFace.startY - event.clientY) * 0.018));
  const next = new Float32Array(dragFace.base.positions);
  for (const index of dragFace.base.topIndices) {
    const origin = index * 3;
    next[origin] += dragFace.base.normal.x * amount;
    next[origin + 1] += dragFace.base.normal.y * amount;
    next[origin + 2] += dragFace.base.normal.z * amount;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(next, 3));
  geometry.computeVertexNormals();
  selected.geometry.dispose(); selected.geometry = geometry;
  selected.userData.edited = true;
  if (faceHighlight) faceHighlight.visible = false;
  $('#selection-status').textContent = 'Drag extrusion · ' + amount.toFixed(2) + ' studs';
});
renderer.domElement.addEventListener('pointercancel', () => { if (dragFace) finishFaceDrag(); });
function finishFaceDrag() {
  if (!dragFace) return;
  const changed = dragFace.started;
  dragFace.original.dispose();
  dragFace = null;
  if (changed) { clearFace(); renderHierarchy(); commitChange(); $('#selection-status').textContent = 'Extrusion committed · Ctrl+Z to undo'; }
}
renderer.domElement.addEventListener('pointerup', () => { if (dragFace?.started) finishFaceDrag(); });
renderer.domElement.addEventListener('pointerup', event => { if (event.button !== 0 || !pointerDown || transform.dragging || dragFace?.started) { pointerDown = null; return; } const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y); pointerDown = null; if (distance > 5) return; const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const hits = raycaster.intersectObjects(objects, false); if (editMode && selected && hits[0]?.object === selected) markFace(hits[0].faceIndex); else select(hits.length ? hits[0].object : null); });
window.addEventListener('keydown', event => { const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName); if (typing) return; const modifier = event.ctrlKey || event.metaKey; if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); } else if (modifier && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); } else if (modifier && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicate(); } else if (event.key === 'Delete' || event.key === 'Backspace') remove(); else if (event.key === 'Tab') { event.preventDefault(); toggleEditMode(); } else if (editMode && event.key.toLowerCase() === 'e') faceOperation('extrude'); else if (editMode && event.key.toLowerCase() === 'i') faceOperation('inset'); else if (event.key.toLowerCase() === 'f') focus(); else if (['g', 'r', 's'].includes(event.key.toLowerCase())) { const mode = ({ g: 'translate', r: 'rotate', s: 'scale' })[event.key.toLowerCase()]; document.querySelector(`[data-mode="${mode}"]`).click(); } });
const resizeObserver = new ResizeObserver(() => { const w = viewport.clientWidth, h = viewport.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }); resizeObserver.observe(viewport);
makeObject('Box', { name: 'Starter Cube', position: [0, 0.9, 0], color: '#819fca' });
select(objects[0]); commitChange();
renderer.setAnimationLoop(() => { orbit.update(); renderer.render(scene, camera); });

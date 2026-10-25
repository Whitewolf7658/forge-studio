import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import './styles/main.css';

const $ = (selector) => document.querySelector(selector);
const app = $('#app');
app.innerHTML = `
<div class="studio">
  <header class="topbar"><div class="brand"><span class="brand-mark">F</span><div><strong>FORGE</strong><span>STUDIO</span></div><span class="version">BETA 0.3</span></div>
    <div class="top-actions"><button data-action="new" title="New scene">New</button><button data-action="save" title="Download project">Save project</button><button data-action="load" title="Load project">Open project</button><span class="separator"></span><button data-action="undo" title="Undo (Ctrl+Z)">↶</button><button data-action="redo" title="Redo (Ctrl+Shift+Z)">↷</button><span class="separator"></span><button class="primary" data-action="export">Export GLB ↗</button></div>
  </header>
  <div class="workspace">
    <aside class="rail"><button class="tool active" data-mode="translate" title="Move (G)">✥<small>Move</small></button><button class="tool" data-mode="rotate" title="Rotate (R)">⟳<small>Rotate</small></button><button class="tool" data-mode="scale" title="Scale (S)">⤢<small>Scale</small></button><div class="rail-line"></div><button class="tool" data-action="edit-mode" title="Face editing (Tab)">▱<small>Faces</small></button><button class="tool" data-action="extrude-face" title="Extrude selected face (E)">⇧<small>Extrude</small></button><button class="tool" data-action="inset-face" title="Inset selected face (I)">◇<small>Inset</small></button><button class="tool" data-action="frame" title="Frame selection (F)">◎<small>Focus</small></button><button class="tool" data-action="delete" title="Delete selection">⌫<small>Delete</small></button></aside>
    <section class="viewport-shell"><div class="viewport-header"><div class="crumb">SCENE <span>/</span> <strong>Perspective</strong></div><div class="view-chips"><span class="chip green-dot">●</span><span class="chip">SOLID</span><span class="chip">WORLD</span></div></div><div id="viewport"></div><div class="viewport-hint">LMB select · RMB orbit · Scroll zoom · Tab face mode</div><div class="axes"><span class="axis x">X</span><span class="axis y">Y</span><span class="axis z">Z</span></div><div class="viewport-bottom"><span id="selection-status">No selection</span><span>1 unit = 1 stud</span></div></section>
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
let editMode = false; let faceIndex = -1; let faceHighlight = null;
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

function clearFace() {
  faceIndex = -1;
  if (faceHighlight) {
    scene.remove(faceHighlight);
    faceHighlight.geometry.dispose();
    faceHighlight.material.dispose();
    faceHighlight = null;
  }
}
function toggleEditMode() {
  editMode = !editMode;
  clearFace();
  document.querySelector('[data-action="edit-mode"]').classList.toggle('active', editMode);
  transform.enabled = !editMode;
  transform.visible = !editMode;
  $('#selection-status').textContent = editMode ? 'FACE MODE · Click a triangle · E extrude · I inset' : (selected?.name || 'No selection');
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
  const vertices = trianglePositions(selected, index);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flatMap(v => v.toArray()), 3));
  geometry.computeVertexNormals();
  faceHighlight = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: 0x78b8ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthTest: false
  }));
  faceHighlight.position.copy(selected.position);
  faceHighlight.quaternion.copy(selected.quaternion);
  faceHighlight.scale.copy(selected.scale);
  faceHighlight.renderOrder = 999;
  scene.add(faceHighlight);
  $('#selection-status').textContent = 'Triangle ' + (index + 1) + ' selected · E extrude · I inset';
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
function action(name) { switch (name) { case 'new': if (objects.length && !confirm('Start a new scene? Download your project first if you want to keep it.')) return; clearObjects(); renderHierarchy(); commitChange(); break; case 'save': download('forge-project.json', new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' })); break; case 'load': $('#file-picker').click(); break; case 'export': exportGLB(); break; case 'undo': undo(); break; case 'redo': redo(); break; case 'delete': remove(); break; case 'duplicate': duplicate(); break; case 'frame': focus(); break; case 'edit-mode': toggleEditMode(); break; case 'extrude-face': faceOperation('extrude'); break; case 'inset-face': faceOperation('inset'); break; case 'add-menu': $('#add-menu').classList.toggle('hidden'); break; } }
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
let pointerDown = null;
renderer.domElement.addEventListener('pointerdown', event => { if (event.button === 0) pointerDown = { x: event.clientX, y: event.clientY }; });
renderer.domElement.addEventListener('pointerup', event => { if (event.button !== 0 || !pointerDown || transform.dragging) return; const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y); pointerDown = null; if (distance > 5) return; const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const hits = raycaster.intersectObjects(objects, false); if (editMode && selected && hits[0]?.object === selected) markFace(hits[0].faceIndex); else select(hits.length ? hits[0].object : null); });
window.addEventListener('keydown', event => { const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName); if (typing) return; const modifier = event.ctrlKey || event.metaKey; if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); } else if (modifier && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); } else if (modifier && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicate(); } else if (event.key === 'Delete' || event.key === 'Backspace') remove(); else if (event.key === 'Tab') { event.preventDefault(); toggleEditMode(); } else if (editMode && event.key.toLowerCase() === 'e') faceOperation('extrude'); else if (editMode && event.key.toLowerCase() === 'i') faceOperation('inset'); else if (event.key.toLowerCase() === 'f') focus(); else if (['g', 'r', 's'].includes(event.key.toLowerCase())) { const mode = ({ g: 'translate', r: 'rotate', s: 'scale' })[event.key.toLowerCase()]; document.querySelector(`[data-mode="${mode}"]`).click(); } });
const resizeObserver = new ResizeObserver(() => { const w = viewport.clientWidth, h = viewport.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }); resizeObserver.observe(viewport);
makeObject('Box', { name: 'Starter Cube', position: [0, 0.9, 0], color: '#819fca' });
select(objects[0]); commitChange();
renderer.setAnimationLoop(() => { orbit.update(); renderer.render(scene, camera); });

import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@<VERSION>/examples/jsm/webxr/ARButton.js';

let scene, camera, renderer;
let reticle, hitTestSource, localSpace;
let productModel;
const loader = new THREE.GLTFLoader();

function init() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    70, window.innerWidth / window.innerHeight, 0.01, 20
  );

  // Light
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // AR Button
  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test']
  });
  document.getElementById('ar-button-container').appendChild(arButton);

  // Reticle
  const geometry = new THREE.RingGeometry(0.1, 0.11, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial();
  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Listen for session events
  renderer.xr.addEventListener('sessionstart', onSessionStart);
  renderer.xr.addEventListener('sessionend', onSessionEnd);

  // Window resize handling
  window.addEventListener('resize', onWindowResize);

  // Animation loop
  renderer.setAnimationLoop(render);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function onSessionStart() {
  const session = renderer.xr.getSession();
  const viewerSpace = await session.requestReferenceSpace('viewer');
  localSpace = await session.requestReferenceSpace('local');
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  session.addEventListener('select', onSelect);
}

function onSessionEnd() {
  hitTestSource = null;
  localSpace = null;
}

function onSelect() {
  if (reticle.visible) {
    placeObject(reticle.matrix);
  }
}

function placeObject(matrix) {
  if (!productModel) {
    loader.load('models/ChairExport.glb', (gltf) => {
      productModel = gltf.scene;
      productModel.scale.set(0.2, 0.2, 0.2);
      setMatrixAndAdd(productModel, matrix);
    });
  } else {
    const clone = productModel.clone();
    setMatrixAndAdd(clone, matrix);
  }
}

function setMatrixAndAdd(object, matrix) {
  object.matrix.copy(matrix);
  object.matrix.decompose(object.position, object.quaternion, object.scale);
  scene.add(object);
}

function render(time, frame) {
  if (frame) {
    if (hitTestSource && localSpace) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(localSpace);

        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }
  renderer.render(scene, camera);
}

// Call init
init();

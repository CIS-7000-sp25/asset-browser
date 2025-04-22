import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type DisplayOptions = "window" | "fullscreen";

type ViewController = {
  switchTo: (display: DisplayOptions) => void;
};

function resizeRendererToDisplaySize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  force: boolean
) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;

  const width = Math.floor(canvas.clientWidth * pixelRatio);
  const height = Math.floor(canvas.clientHeight * pixelRatio);

  if (canvas.width !== width || canvas.height !== height || force) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

/**
 * Should only be called once.
 */
async function initModelViewers(
  windowCanvas: HTMLCanvasElement,
  fullscreenCanvas: HTMLCanvasElement,
  model: ArrayBuffer,
  callbackWhenFinished: () => void
) {
  const windowRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: windowCanvas });
  const fullscreenRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: fullscreenCanvas });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 2000);
  const controls = new OrbitControls(camera);

  controls.autoRotate = true;
  controls.enableDamping = true;

  const gltfLoader = new GLTFLoader();
  const gltf = await gltfLoader.parseAsync(model, "");
  const gltfScene = gltf.scene;

  // Get bounding box of model and its properties.
  // Thanks to https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js
  const bbox = new THREE.Box3().setFromObject(gltfScene);
  const size = bbox.getSize(new THREE.Vector3()).length();
  const center = bbox.getCenter(new THREE.Vector3());

  // Center model in the screen
  gltfScene.position.x -= center.x;
  gltfScene.position.y -= center.y;
  gltfScene.position.z -= center.z;

  // Set max distance that user can zoom out
  controls.maxDistance = size * 2;

  // Scale camera near and far values based on size of model
  camera.near = size / 100;
  camera.far = size * 100;
  camera.updateProjectionMatrix();

  // Make sure entire model is within view
  camera.position.copy(center);
  camera.position.x += size / 2;
  camera.position.y += size / 5;
  camera.position.z += size / 2;
  camera.lookAt(center);

  scene.background = new THREE.Color(0x191919);
  scene.add(gltfScene);

  // Add light to the camera and camera to the scene so model will
  // always be lit no matter what angle
  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(0.5, 0, 0.866);
  camera.add(dirLight);
  scene.add(camera);

  const guiOptions = {
    "Background Color": 0x191919,
    "Light Color": 0xffffff,
    "Light Intensity": 3,
    "Auto Rotate": true,
  };

  const gui = new GUI({
    container: document.querySelector<HTMLDivElement>("#attach-gui-here")!,
    width: 400,
  });

  gui
    .addColor(guiOptions, "Background Color")
    .onChange((value: number) => (scene.background = new THREE.Color(value)));
  gui.addColor(guiOptions, "Light Color").onChange((value: number) => dirLight.color.set(value));
  gui
    .add(guiOptions, "Light Intensity", 0, 10, 0.1)
    .onChange((value: number) => (dirLight.intensity = value));
  gui.add(guiOptions, "Auto Rotate").onChange((value: boolean) => {
    controls.autoRotate = value;
    controls.update();
  });

  callbackWhenFinished();

  function render(time: number, renderer: THREE.WebGLRenderer) {
    time *= 0.001;

    resizeRendererToDisplaySize(renderer, camera, false);

    controls.update();
    renderer.render(scene, camera);
  }

  const controller = {
    switchTo: (display: DisplayOptions) => {
      if (display === "window") {
        fullscreenRenderer.setAnimationLoop(null);
        resizeRendererToDisplaySize(windowRenderer, camera, true);
        controls.connect(windowRenderer.domElement);
        windowRenderer.setAnimationLoop((time) => render(time, windowRenderer));
      }

      if (display === "fullscreen") {
        windowRenderer.setAnimationLoop(null);
        resizeRendererToDisplaySize(fullscreenRenderer, camera, true);
        controls.connect(fullscreenRenderer.domElement);
        fullscreenRenderer.setAnimationLoop((time) => render(time, fullscreenRenderer));
      }
    },
  };

  return controller;
}

export { initModelViewers, type DisplayOptions, type ViewController };

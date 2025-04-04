import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function showViewer() {
  // Use the existing container
  const container = document.getElementById("glb-viewer-container");
  container.style.display = "block";

  if (document.getElementById("three-renderer-dom")) {
    return; // Viewer already created
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x444444);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.y = 2;
  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setAnimationLoop(animate);
  renderer.domElement.id = "three-renderer-dom";
  container.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xd1ffbd, 2.5);
  directionalLight1.position.set(10, 10, 0).normalize();
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xff7f7f, 2.5);
  directionalLight2.position.set(-10, 10, 0).normalize();
  scene.add(directionalLight2);

  const pointLight = new THREE.PointLight(0xffffff, 5, 1);
  pointLight.position.set(10, 10, 0); // Set the position of the light
  scene.add(pointLight);

  let url = document.getElementById("glb-url-holder").value;

  const loader = new GLTFLoader();
  let object;

  loader.load(
    url,
    // called when the resource is loaded
    function (gltf) {
      scene.add(gltf.scene);
      object = gltf.scene;

      centerCamera();
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened: " + error);
    }
  );

  function centerCamera() {
    const boundingBox = new THREE.Box3();

    boundingBox.setFromObject(object);

    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    let newPositionCamera = new THREE.Vector3(maxSize, maxSize, maxSize);
    camera.zoom = 1;
    camera.left = -(2 * maxSize);
    camera.bottom = -(2 * maxSize);
    camera.top = 2 * maxSize;
    camera.right = 2 * maxSize;
    camera.near = 0.01;
    camera.far = maxSize * 4;
    camera.position.set(
      newPositionCamera.x,
      newPositionCamera.y,
      newPositionCamera.z
    );

    camera.lookAt(center);
    camera.updateProjectionMatrix();

    controls.target = center;
    controls.update();
    controls.saveState();
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function animate() {
    if (object) {
      object.rotation.y += 0.01;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", onWindowResize);
}

export function closeViewer() {
  // Clean up the viewer
  const container = document.getElementById("glb-viewer-container");

  container.style.display = "none";
}

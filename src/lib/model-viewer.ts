import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/addons/effects/OutlineEffect.js";
import { color, instance } from "three/src/nodes/TSL.js";

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
  const windowRenderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: windowCanvas,
  });
  const fullscreenRenderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: fullscreenCanvas,
  });

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

  const effect = new OutlineEffect(fullscreenRenderer);
  let diffuseColor = new THREE.Color(0x707070);

  const materials = {
    Phong: new THREE.MeshPhongMaterial({ color: diffuseColor }),
    Toon: new THREE.MeshToonMaterial({ color: diffuseColor }),
    Lambert: new THREE.MeshLambertMaterial({ color: diffuseColor }),
    Standard: new THREE.MeshStandardMaterial({ color: diffuseColor }),
    Physical: new THREE.MeshPhysicalMaterial({ color: diffuseColor }),
    Normals: new THREE.MeshNormalMaterial(),
    Wireframe: new THREE.MeshBasicMaterial({ wireframe: true })
  };

  const backgrounds = {
    Field: new THREE.CubeTextureLoader().setPath('https://sbcode.net/img/').load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
  };
  let backgroundColor = new THREE.Color(0x191919);
  scene.environment = backgrounds.Field;

  let mainMeshes: THREE.Mesh[] = [];
  const meshMatMap = new Map<THREE.Mesh, THREE.MeshStandardMaterial>();

  // Based off of this discussion: https://discourse.threejs.org/t/adding-multiple-materials-layers-to-a-loaded-object/14117/14
  gltfScene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geometry = child.geometry;

      geometry.clearGroups();
      geometry.addGroup(0, Infinity, 0);
      geometry.addGroup(0, Infinity, 1);

      const mesh = child as THREE.Mesh;
      mainMeshes.push(child); // Keep track of meshes in scene to dynamically update materials later

      const originalMaterial = child.material.clone();
      meshMatMap.set(mesh, child.material.clone());

      if (originalMaterial instanceof THREE.MeshStandardMaterial) {
        const physicalMaterial = materials.Physical.clone();

        physicalMaterial.color = originalMaterial.color;
        physicalMaterial.emissive = originalMaterial.emissive;
        physicalMaterial.roughness = originalMaterial.roughness;
        physicalMaterial.metalness = originalMaterial.metalness;
        
        if (originalMaterial.transparent) {
          physicalMaterial.transmission = 1;
          physicalMaterial.clearcoat = 1;
          physicalMaterial.ior = 1.17;
          physicalMaterial.thickness = 5.12;
        }

        //phongMaterial.shininess = (1 - originalMaterial.roughness) * 100;
  
        const map = originalMaterial.map;
        const normalMap = originalMaterial.normalMap;
        if (map) physicalMaterial.map = originalMaterial.map;
        if (normalMap) physicalMaterial.normalMap = originalMaterial.normalMap;
  
        child.material = physicalMaterial;
      }
    }
  });

  scene.fog = new THREE.Fog(0xcccccc, 1, 10);

  const guiOptions = {
    "Background Color": 0x191919,
    "Light Color": 0xffffff,
    "Diffuse Color": 0xffffff,
    "Light Intensity": 1,
    "Show GLB colors": true,
    "Show Environment Map": false,
    "Enable Environment Lighting": true,
    "Auto Rotate": true,
    "Use Outline Effect": true,
    "Material Applied": "Physical",
    "Fog Enabled": true,
    "Fog Color": 0xcccccc,
  };

  const gui = new GUI({
    container: document.querySelector<HTMLDivElement>("#attach-gui-here")!,
    width: 400,
  });

  gui
    .addColor(guiOptions, "Background Color")
    .onChange((value: number) => {
      backgroundColor = new THREE.Color(value);

      if (!guiOptions['Show Environment Map']) {
        scene.background = new THREE.Color(value)}
      }
    );
  gui
    .add(guiOptions, "Show Environment Map")
    .onChange((value: boolean) => {
      scene.background = value ? backgrounds.Field : backgroundColor;
    });

  gui
    .add(guiOptions, "Enable Environment Lighting")
    .onChange((value: boolean) => {
      scene.environment = value ? backgrounds.Field : null;
    });

  gui
    .addColor(guiOptions, "Light Color")
    .onChange((value: number) => dirLight.color.set(value));
  gui.addColor(guiOptions, "Diffuse Color").onChange((value: number) => {
    diffuseColor = new THREE.Color(value);

    if (guiOptions["Show GLB colors"]) {
      return;
    }

    for (const mesh of mainMeshes) {
      const outValue = new THREE.Color(value);
      (mesh.material as THREE.MeshStandardMaterial).color.copy(outValue);
    }
  });
  
  gui
    .add(guiOptions, "Show GLB colors")
    .onChange((value: boolean) => {
      const diffuse = diffuseColor;

      for (const mesh of mainMeshes) {
        const material = meshMatMap.get(mesh)?.clone();
        const outColor = (material && value) ? material.color.clone() : diffuse.clone();          
        (mesh.material as THREE.MeshStandardMaterial).color.copy(outColor);
      }
    });

  gui
    .add(guiOptions, "Light Intensity", 0, 10, 0.1)
    .onChange((value: number) => (dirLight.intensity = value));
  gui.add(guiOptions, "Auto Rotate").onChange((value: boolean) => {
    controls.autoRotate = value;
    controls.update();
  });

  gui.add(guiOptions, "Use Outline Effect");

  gui
    .add(guiOptions, "Material Applied", Object.keys(materials))
    .onChange((selected: string) => {
      for (const mesh of mainMeshes) {
        const originalMaterial = meshMatMap.get(mesh)?.clone();
        const newMaterial = materials[selected as keyof typeof materials].clone();
        
        if (guiOptions["Show GLB colors"] && originalMaterial instanceof THREE.MeshStandardMaterial) {
          if ('color' in newMaterial) newMaterial.color.copy(originalMaterial.color);
          if ('emissive' in newMaterial) newMaterial.emissive.copy(originalMaterial.emissive);
          if ('shininess' in newMaterial) newMaterial.shininess = (1 - originalMaterial.roughness) * 100;

          if (originalMaterial.transparent) {
            if ('transmission' in newMaterial) newMaterial.transmission = 1;
            if ('clearcoat' in newMaterial) newMaterial.clearcoat = 1;
            if ('ior' in newMaterial) newMaterial.ior = 1.17;
            if ('thickness' in newMaterial) newMaterial.thickness = 5.12;
          }

          const map = originalMaterial.map;
          const normalMap = originalMaterial.normalMap;
          if (map && 'map' in newMaterial) newMaterial.map = originalMaterial.map;
          if (normalMap && 'normalMap' in newMaterial) newMaterial.normalMap = originalMaterial.normalMap;
        } else {
          if ('color' in newMaterial) newMaterial.color = diffuseColor;
        }

        mesh.material = newMaterial;
      }
    });

  gui.add(guiOptions, "Fog Enabled").onChange((enabled: boolean) => {
    if (enabled) {
      scene.fog = new THREE.Fog(guiOptions["Fog Color"], 1, 15);
    } else {
      scene.fog = null;
    }
  });

  gui.addColor(guiOptions, "Fog Color").onChange((color: number) => {
    if (guiOptions["Fog Enabled"]) {
      if (!scene.fog) {
        scene.fog = new THREE.Fog(color, 1, 15);
      } else {
        scene.fog.color.set(color);
      }
    }
  });

  callbackWhenFinished();

  function render(time: number, renderer: THREE.WebGLRenderer) {
    time *= 0.001;

    resizeRendererToDisplaySize(renderer, camera, false);

    controls.update();
    // renderer.render(scene, camera);

    if (guiOptions["Use Outline Effect"] && renderer === fullscreenRenderer) {
      effect.render(scene, camera);
    } else {
      renderer.render(scene, camera);
    }
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
        fullscreenRenderer.setAnimationLoop((time) =>
          render(time, fullscreenRenderer)
        );
      }
    },
  };

  return controller;
}

export { initModelViewers, type DisplayOptions, type ViewController };

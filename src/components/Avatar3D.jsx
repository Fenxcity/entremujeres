import { useEffect, useRef, useState } from "react";

/* Avatar 3D de la asesora (RobotExpressive, Three.js).
   Carga diferida: three y el modelo se importan dinámicamente.
   Si WebGL/el modelo fallan, devuelve null y el placeholder SVG queda visible. */
export default function Avatar3D({ size = 72, onReady }) {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let renderer, frameId, mixer, clock, model;
    const mount = mountRef.current;

    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        if (cancelled || !mount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3835, 3.0));
        const key = new THREE.DirectionalLight(0xffffff, 2.8);
        key.position.set(2, 4, 3);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xC09A5B, 0.8);
        fill.position.set(-3, 1, 2);
        scene.add(fill);

        clock = new THREE.Clock();
        const loader = new GLTFLoader();
        loader.load(
          "/models/RobotExpressive.glb",
          (gltf) => {
            if (cancelled) return;
            model = gltf.scene;
            scene.add(model);

            // RobotExpressive viene de pie con los pies en y≈0 y la cabeza en
            // y≈4.4. Encuadre de cuerpo completo, centrado y con margen
            // (valores verificados en runtime con la silueta renderizada).
            camera.position.set(0, 2.2, 9.3);
            camera.lookAt(0, 2.2, 0);

            mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations || [];
            const idle = clips.find((c) => c.name === "Idle") || clips[0];
            if (idle) mixer.clipAction(idle).play();

            if (onReady) onReady();

            const animate = () => {
              frameId = requestAnimationFrame(animate);
              const dt = clock.getDelta();
              if (mixer) mixer.update(dt);
              if (model) model.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.35;
              renderer.render(scene, camera);
            };
            animate();
          },
          undefined,
          () => { if (!cancelled) setFailed(true); }
        );
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      if (renderer) {
        renderer.dispose();
        const el = renderer.domElement;
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }
    };
  }, [size, onReady]);

  if (failed) return null;

  return (
    <div
      ref={mountRef}
      style={{
        width: size, height: size, borderRadius: "50%",
        overflow: "hidden", background: "#2C2A27",
        boxShadow: "inset 0 0 0 3px #C09A5B",
      }}
    />
  );
}

import { useEffect, useRef, useState } from "react";
import { buildFemaleAvatar } from "./femaleAvatar.js";

/* Avatar 3D de la asesora: mujer estilizada con saco, generada por geometría
   (Three.js, sin modelos externos). Carga diferida del motor 3D.
   Si WebGL falla, devuelve null y el placeholder SVG queda visible. */
export default function Avatar3D({ size = 72, onReady }) {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let renderer, frameId, clock, avatar;
    const mount = mountRef.current;

    (async () => {
      try {
        const THREE = await import("three");
        if (cancelled || !mount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, -0.35, 6);
        camera.lookAt(0, -0.5, 0);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        scene.add(new THREE.HemisphereLight(0xfff6ec, 0x2a2622, 1.6));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(2.5, 3, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xbfe0ff, 0.7);
        fill.position.set(-3, 0.5, 2.5);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(0xc09a5b, 1.1);
        rim.position.set(-1.5, 2, -3);
        scene.add(rim);

        avatar = buildFemaleAvatar(THREE);
        scene.add(avatar.group);

        clock = new THREE.Clock();
        if (onReady) onReady();

        const animate = () => {
          frameId = requestAnimationFrame(animate);
          avatar.update(clock.getElapsedTime());
          renderer.render(scene, camera);
        };
        animate();
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
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 38%, #46423d 0%, #2C2A27 70%)",
        boxShadow: "inset 0 0 0 3px #C09A5B",
      }}
    />
  );
}

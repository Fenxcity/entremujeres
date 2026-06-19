/* Avatar 3D estilizada (low-poly) de una asesora: mujer de tez blanca con saco.
   Construida por geometría con Three.js — sin modelos externos.
   buildFemaleAvatar(THREE) -> { group, update(t) }
   El origen está en el centro de la cabeza (y = 0). El busto cuelga hacia -y. */
export function buildFemaleAvatar(THREE) {
  const COL = {
    skin: 0xF1D9C7,
    skinShade: 0xE6C2AC,
    hair: 0x4A3528,
    blazer: 0x2E2C29,
    blazerHi: 0x3C3A36,
    blouse: 0xF8F4EF,
    gold: 0xC09A5B,
    lip: 0xB05C5C,
    eyeW: 0xF7F2EC,
    iris: 0x3A2A20,
  };
  const mat = (color, roughness = 0.7, metalness = 0.0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const skinMat = mat(COL.skin, 0.55);
  const hairMat = mat(COL.hair, 0.6);
  const blazerMat = mat(COL.blazer, 0.65);
  const blouseMat = mat(COL.blouse, 0.7);
  const goldMat = mat(COL.gold, 0.35, 0.6);

  const sphere = (r, ws = 32, hs = 24) => new THREE.SphereGeometry(r, ws, hs);
  const mesh = (geo, m) => new THREE.Mesh(geo, m);

  const g = new THREE.Group();

  /* ── Cabeza (gira con headGroup) ── */
  const headGroup = new THREE.Group();
  g.add(headGroup);

  const skull = mesh(sphere(1, 48, 48), skinMat);
  skull.scale.set(0.92, 1.06, 0.92);
  headGroup.add(skull);

  // Orejas
  [-1, 1].forEach((s) => {
    const ear = mesh(sphere(0.16, 16, 16), skinMat);
    ear.position.set(s * 0.9, -0.02, 0.05);
    headGroup.add(ear);
  });

  // Cuello
  const neck = mesh(new THREE.CylinderGeometry(0.33, 0.42, 0.7, 24), skinMat);
  neck.position.set(0, -0.95, 0);
  headGroup.add(neck);

  /* ── Rasgos faciales ── */
  const eyeBase = 0.9; // z frente
  const eyes = [];
  [-1, 1].forEach((s) => {
    const eye = new THREE.Group();
    const white = mesh(sphere(1, 20, 16), mat(COL.eyeW, 0.4));
    white.scale.set(0.13, 0.09, 0.06);
    const iris = mesh(sphere(0.06, 16, 16), mat(COL.iris, 0.3));
    iris.position.z = 0.05;
    const glint = mesh(sphere(0.022, 8, 8), mat(0xffffff, 0.2));
    glint.position.set(0.025, 0.03, 0.09);
    eye.add(white, iris, glint);
    eye.position.set(s * 0.3, 0.07, eyeBase - 0.06);
    eye.userData.baseY = 1;
    headGroup.add(eye);
    eyes.push(eye);

    // Ceja
    const brow = mesh(new THREE.BoxGeometry(0.26, 0.05, 0.06), hairMat);
    brow.position.set(s * 0.3, 0.27, eyeBase - 0.04);
    brow.rotation.z = s * -0.12;
    headGroup.add(brow);
  });

  // Nariz
  const nose = mesh(sphere(0.065, 16, 16), mat(COL.skinShade, 0.6));
  nose.scale.set(0.8, 0.95, 0.7);
  nose.position.set(0, -0.05, eyeBase);
  headGroup.add(nose);

  // Labios
  const lips = mesh(sphere(1, 20, 16), mat(COL.lip, 0.45));
  lips.scale.set(0.2, 0.085, 0.08);
  lips.position.set(0, -0.34, eyeBase - 0.02);
  headGroup.add(lips);

  // Rubor sutil
  [-1, 1].forEach((s) => {
    const blush = mesh(sphere(0.1, 12, 12), mat(0xEAB6A4, 0.85));
    blush.scale.set(1, 0.5, 0.22);
    blush.position.set(s * 0.44, -0.15, 0.8);
    headGroup.add(blush);
  });

  /* ── Cabello ── */
  // Casquete: cabello sobre la coronilla, nacimiento por encima de las cejas
  const cap = mesh(
    new THREE.SphereGeometry(1, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.52),
    hairMat
  );
  cap.scale.set(1.05, 1.04, 0.98);
  cap.position.set(0, 0.18, -0.08);
  headGroup.add(cap);

  // Volumen trasero (baja hacia los hombros, detrás del rostro)
  const backHair = mesh(sphere(1, 32, 24), hairMat);
  backHair.scale.set(0.95, 1.15, 0.7);
  backHair.position.set(0, -0.5, -0.45);
  headGroup.add(backHair);

  const backHair2 = mesh(sphere(1, 28, 20), hairMat);
  backHair2.scale.set(0.8, 0.85, 0.5);
  backHair2.position.set(0, -1.45, -0.4);
  headGroup.add(backHair2);

  // Mechones laterales (caen a los lados del rostro)
  [-1, 1].forEach((s) => {
    const lock = mesh(sphere(1, 24, 20), hairMat);
    lock.scale.set(0.24, 0.85, 0.42);
    lock.position.set(s * 0.92, -0.35, 0.05);
    headGroup.add(lock);
  });

  /* ── Cuerpo: saco (busto) ── */
  const body = new THREE.Group();
  g.add(body);

  const torso = mesh(new THREE.CylinderGeometry(0.55, 1.75, 2.1, 36), blazerMat);
  torso.scale.set(1, 1, 0.72);
  torso.position.set(0, -2.35, 0);
  body.add(torso);

  // Hombros redondeados
  [-1, 1].forEach((s) => {
    const sh = mesh(sphere(1, 24, 18), blazerMat);
    sh.scale.set(0.62, 0.46, 0.5);
    sh.position.set(s * 0.92, -1.42, 0);
    body.add(sh);
  });

  // Blusa (V en el pecho)
  const blouse = mesh(sphere(1, 24, 20), blouseMat);
  blouse.scale.set(0.42, 0.62, 0.26);
  blouse.position.set(0, -1.55, 0.42);
  body.add(blouse);

  // Solapas del saco (forman la V)
  [-1, 1].forEach((s) => {
    const lapel = mesh(new THREE.BoxGeometry(0.3, 1.05, 0.14), mat(COL.blazerHi, 0.6));
    lapel.position.set(s * 0.34, -1.5, 0.48);
    lapel.rotation.z = s * 0.2;
    body.add(lapel);
  });

  // Collar trasero del saco
  const collar = mesh(new THREE.TorusGeometry(0.42, 0.12, 12, 24, Math.PI), blazerMat);
  collar.position.set(0, -1.2, -0.05);
  collar.rotation.set(Math.PI / 2, 0, 0);
  body.add(collar);

  // Collar dorado sutil (joyería)
  const necklace = mesh(new THREE.TorusGeometry(0.34, 0.028, 10, 32), goldMat);
  necklace.position.set(0, -1.32, 0.34);
  necklace.rotation.x = 1.45;
  body.add(necklace);

  /* ── Animación ── */
  const baseY = g.position.y;
  const blink = (t) => {
    const p = t % 4.2;
    return p > 3.95 && p < 4.08 ? 0.12 : 1;
  };

  return {
    group: g,
    update(t) {
      g.rotation.y = Math.sin(t * 0.5) * 0.12;
      g.position.y = baseY + Math.sin(t * 1.1) * 0.025;
      headGroup.rotation.y = Math.sin(t * 0.62) * 0.16;
      headGroup.rotation.z = Math.sin(t * 0.43) * 0.03;
      const b = blink(t);
      eyes.forEach((e) => (e.scale.y = b * e.userData.baseY));
    },
  };
}

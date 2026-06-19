/* Avatar 3D estilizada (estilo retrato) de la asesora: mujer de tez blanca con
   traje, generada por geometría con Three.js — sin modelos externos.
   buildFemaleAvatar(THREE) -> { group, update(t) }
   Origen en el centro de la cabeza (y = 0); el busto cuelga hacia -y. */
export function buildFemaleAvatar(THREE) {
  const COL = {
    skin: 0xF3DAC9,
    skinShade: 0xE7C0AC,
    hair: 0x4A3528,
    hairHi: 0x5E4636,
    blazer: 0x26242A,
    blazerHi: 0x343139,
    blouse: 0xF6F1EA,
    gold: 0xC09A5B,
    lipTop: 0xA94E50,
    lipBot: 0xC06A66,
    iris: 0x5B4636,
    lash: 0x2A2018,
  };
  const std = (color, roughness = 0.7, metalness = 0.0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const skinMat = std(COL.skin, 0.48);
  const skinShadeMat = std(COL.skinShade, 0.55);
  const hairMat = std(COL.hair, 0.62);
  const blazerMat = std(COL.blazer, 0.62);
  const blazerHiMat = std(COL.blazerHi, 0.55);
  const blouseMat = std(COL.blouse, 0.7);
  const goldMat = std(COL.gold, 0.3, 0.7);
  const lashMat = std(COL.lash, 0.4);

  const S = (r, w = 40, h = 32) => new THREE.SphereGeometry(r, w, h);
  const M = (geo, m) => new THREE.Mesh(geo, m);
  const arc = (r, tube, a) => new THREE.TorusGeometry(r, tube, 10, 24, a);

  const g = new THREE.Group();

  /* ── Cabeza ── */
  const headGroup = new THREE.Group();
  g.add(headGroup);

  // Cráneo (óvalo) + mentón sugerido
  const skull = M(S(1, 56, 48), skinMat);
  skull.scale.set(0.84, 1.02, 0.9);
  headGroup.add(skull);
  const jaw = M(S(0.62, 40, 32), skinMat);
  jaw.scale.set(0.92, 0.85, 0.95);
  jaw.position.set(0, -0.5, 0.04);
  headGroup.add(jaw);

  // Orejas
  [-1, 1].forEach((s) => {
    const ear = M(S(0.13, 20, 16), skinMat);
    ear.scale.set(0.7, 1, 0.6);
    ear.position.set(s * 0.82, -0.08, 0.02);
    headGroup.add(ear);
    const pendiente = M(S(0.05, 12, 12), goldMat);
    pendiente.position.set(s * 0.82, -0.24, 0.05);
    headGroup.add(pendiente);
  });

  // Cuello esbelto
  const neck = M(new THREE.CylinderGeometry(0.27, 0.34, 0.9, 28), skinMat);
  neck.position.set(0, -1.02, 0);
  headGroup.add(neck);

  /* ── Ojos (almendrados) ── */
  const eyeZ = 0.78;
  const eyeGroups = [];
  [-1, 1].forEach((s) => {
    const eye = new THREE.Group();
    eye.position.set(s * 0.27, 0.04, eyeZ);
    eye.rotation.z = s * 0.07;

    const white = M(S(1, 24, 20), std(0xF7F2EC, 0.35));
    white.scale.set(0.15, 0.082, 0.05);
    eye.add(white);

    const iris = M(S(0.062, 18, 18), std(COL.iris, 0.25));
    iris.position.z = 0.04;
    eye.add(iris);
    const pupil = M(S(0.03, 12, 12), std(0x201813, 0.2));
    pupil.position.z = 0.07;
    eye.add(pupil);
    const glint = M(S(0.018, 8, 8), std(0xffffff, 0.1));
    glint.position.set(0.025, 0.03, 0.085);
    eye.add(glint);

    // Línea de pestañas (párpado superior)
    const lid = M(arc(0.155, 0.016, Math.PI), lashMat);
    lid.position.set(0, 0.0, 0.05);
    eye.add(lid);

    headGroup.add(eye);
    eyeGroups.push(eye);

    // Ceja arqueada y delgada
    const brow = M(arc(0.16, 0.022, Math.PI * 0.62), hairMat);
    brow.position.set(s * 0.28, 0.25, eyeZ + 0.02);
    brow.rotation.z = -Math.PI * 0.19 + s * 0.0;
    brow.scale.set(s, 1, 1);
    headGroup.add(brow);
  });

  // Nariz fina
  const nose = M(S(0.075, 24, 20), skinMat);
  nose.scale.set(0.55, 1.15, 0.7);
  nose.position.set(0, -0.12, 0.86);
  headGroup.add(nose);
  [-1, 1].forEach((s) => {
    const ala = M(S(0.045, 14, 12), skinShadeMat);
    ala.position.set(s * 0.05, -0.2, 0.85);
    headGroup.add(ala);
  });

  // Labios (con arco de Cupido)
  const lipsGroup = new THREE.Group();
  lipsGroup.position.set(0, -0.36, 0.8);
  [-1, 1].forEach((s) => {
    const top = M(S(1, 18, 14), std(COL.lipTop, 0.4));
    top.scale.set(0.07, 0.045, 0.05);
    top.position.set(s * 0.05, 0.02, 0);
    lipsGroup.add(top);
  });
  const bot = M(S(1, 20, 16), std(COL.lipBot, 0.4));
  bot.scale.set(0.13, 0.06, 0.06);
  bot.position.set(0, -0.03, 0);
  lipsGroup.add(bot);
  headGroup.add(lipsGroup);

  // Rubor muy sutil
  [-1, 1].forEach((s) => {
    const blush = M(S(0.085, 14, 12), std(0xEBB6A6, 0.9));
    blush.scale.set(1, 0.5, 0.16);
    blush.position.set(s * 0.42, -0.24, 0.72);
    headGroup.add(blush);
  });

  /* ── Cabello (sedoso, raya al centro) ── */
  // Casquete ceñido a la cabeza (nacimiento por encima de las cejas)
  const cap = M(new THREE.SphereGeometry(1, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
  cap.scale.set(1.03, 1.05, 1.0);
  cap.position.set(0, 0.18, -0.08);
  headGroup.add(cap);

  // Volumen trasero que cae a los hombros
  const back1 = M(S(1, 40, 32), hairMat);
  back1.scale.set(0.92, 1.1, 0.7);
  back1.position.set(0, -0.55, -0.4);
  headGroup.add(back1);
  const back2 = M(S(1, 32, 24), hairMat);
  back2.scale.set(0.82, 0.95, 0.5);
  back2.position.set(0, -1.45, -0.32);
  headGroup.add(back2);

  // Mechones que enmarcan el rostro (sedosos, ceñidos)
  [-1, 1].forEach((s) => {
    const lock = M(S(1, 28, 24), hairMat);
    lock.scale.set(0.2, 0.95, 0.4);
    lock.position.set(s * 0.74, -0.4, 0.12);
    lock.rotation.z = s * 0.08;
    headGroup.add(lock);
  });

  /* ── Cuerpo: traje (busto) ── */
  const body = new THREE.Group();
  g.add(body);

  // Torso del saco
  const torso = M(new THREE.CylinderGeometry(0.46, 1.55, 2.0, 40), blazerMat);
  torso.scale.set(1, 1, 0.66);
  torso.position.set(0, -2.3, 0);
  body.add(torso);

  // Línea de hombros suave (yugo)
  const yoke = M(S(1, 40, 28), blazerMat);
  yoke.scale.set(1.45, 0.5, 0.62);
  yoke.position.set(0, -1.42, 0);
  body.add(yoke);

  // Blusa: escote en V
  const blouse = M(S(1, 28, 24), blouseMat);
  blouse.scale.set(0.3, 0.42, 0.2);
  blouse.position.set(0, -1.4, 0.4);
  body.add(blouse);

  // Solapas (V limpia) con filo más claro
  [-1, 1].forEach((s) => {
    const lapel = M(new THREE.BoxGeometry(0.3, 1.25, 0.12), blazerHiMat);
    lapel.position.set(s * 0.3, -1.58, 0.43);
    lapel.rotation.z = s * 0.27;
    body.add(lapel);
    const edge = M(new THREE.BoxGeometry(0.045, 1.25, 0.13), goldMat);
    edge.position.set(s * 0.44, -1.58, 0.44);
    edge.rotation.z = s * 0.27;
    body.add(edge);
  });

  // Collar trasero del saco
  const collar = M(new THREE.TorusGeometry(0.4, 0.13, 12, 28, Math.PI), blazerMat);
  collar.position.set(0, -1.18, -0.04);
  collar.rotation.set(Math.PI / 2, 0, 0);
  body.add(collar);

  // Collar dorado con dije
  const necklace = M(new THREE.TorusGeometry(0.32, 0.022, 10, 36), goldMat);
  necklace.position.set(0, -1.32, 0.32);
  necklace.rotation.x = 1.45;
  body.add(necklace);
  const dije = M(S(0.05, 12, 12), goldMat);
  dije.position.set(0, -1.62, 0.45);
  body.add(dije);

  /* ── Animación ── */
  const baseY = g.position.y;
  const baseRotY = -0.16; // pose ¾
  g.rotation.y = baseRotY;
  const blink = (t) => {
    const p = t % 4.4;
    return p > 4.12 && p < 4.26 ? 0.12 : 1;
  };

  return {
    group: g,
    update(t) {
      g.rotation.y = baseRotY + Math.sin(t * 0.5) * 0.1;
      g.position.y = baseY + Math.sin(t * 1.05) * 0.022;
      headGroup.rotation.y = Math.sin(t * 0.6) * 0.12;
      headGroup.rotation.z = Math.sin(t * 0.42) * 0.025;
      const b = blink(t);
      eyeGroups.forEach((e) => (e.scale.y = b));
    },
  };
}

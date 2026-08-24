const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let nebulaPuffs = [];

// SUPERNOVA STATE MACHINE
let novaState = 'BUILDUP'; // BUILDUP -> IMPLODE -> SILENCE -> EXPLODE -> COMPLETE
let novaTimer = 0;
let starRadius = 45;
let flashAlpha = 0;
let innerShockwave = 0;
let outerShockwave = 0;
let shockwaveAlpha = 1;
let novaParticles = [];
let infallingParticles = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStars();
  initNebulae();
}

function initStars() {
  stars = [];
  const count = Math.floor((width * height) / 3000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }
}

function initNebulae() {
  nebulaPuffs = [];
  const colors = [
    'rgba(255, 90, 0, ',
    'rgba(200, 20, 80, ',
    'rgba(120, 0, 180, ',
    'rgba(20, 80, 180, ',
    'rgba(255, 140, 20, '
  ];

  const centers = [
    { x: width * 0.18, y: height * 0.25 },
    { x: width * 0.82, y: height * 0.32 },
    { x: width * 0.30, y: height * 0.75 },
    { x: width * 0.70, y: height * 0.80 }
  ];

  centers.forEach(center => {
    const puffCount = Math.floor(Math.random() * 7) + 12;
    for (let i = 0; i < puffCount; i++) {
      nebulaPuffs.push({
        x: center.x + (Math.random() - 0.5) * 350,
        y: center.y + (Math.random() - 0.5) * 250,
        radius: Math.random() * 180 + 100,
        scaleX: Math.random() * 1.2 + 0.8,
        scaleY: Math.random() * 0.8 + 0.4,
        rotation: Math.random() * Math.PI,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        baseOpacity: parseFloat((Math.random() * 0.04 + 0.015).toFixed(3)),
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.0008 + 0.0004
      });
    }
  });
}

function drawNebulae() {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const time = performance.now();

  for (let puff of nebulaPuffs) {
    const breath = Math.sin(time * puff.pulseSpeed + puff.pulseOffset);
    const currentOpacity = puff.baseOpacity + (breath * 0.006);
    const scalePulse = 1 + (breath * 0.04);

    ctx.save();
    ctx.translate(puff.x, puff.y);
    ctx.rotate(puff.rotation);
    ctx.scale(puff.scaleX * scalePulse, puff.scaleY * scalePulse);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, puff.radius);
    grad.addColorStop(0, puff.colorBase + (currentOpacity * 1.4) + ')');
    grad.addColorStop(0.2, puff.colorBase + (currentOpacity * 0.8) + ')');
    grad.addColorStop(0.5, puff.colorBase + (currentOpacity * 0.35) + ')');
    grad.addColorStop(0.8, puff.colorBase + (currentOpacity * 0.1) + ')');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, puff.radius, 0, Math.PI * 2);
    ctx.fill();

    const noiseCount = Math.floor(puff.radius * 0.3);
    for (let i = 0; i < noiseCount; i++) {
      const nr = Math.random() * puff.radius * 0.85;
      const na = Math.random() * Math.PI * 2;
      const nx = Math.cos(na) * nr;
      const ny = Math.sin(na) * nr;
      const alpha = (Math.random() * currentOpacity * 0.8).toFixed(4);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(nx, ny, 1, 1);
    }

    ctx.restore();
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, width, height);

  // 1. NEBULAE
  drawNebulae();

  // 2. STARS
  for (let star of stars) {
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

    ctx.fillStyle = `rgba(255, 230, 200, ${Math.abs(star.alpha)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. SUPERNOVA & BLACK HOLE
  const bhX = width * 0.86;
  const bhY = height * 0.28;
  const coreRadius = 45; 
  const tiltAngle = -Math.PI / 4; 

  novaTimer++;

  // --- STAGE 1: UNSTABLE BUILDUP ---
  if (novaState === 'BUILDUP') {
    const shakeX = (Math.random() - 0.5) * (novaTimer * 0.08);
    const shakeY = (Math.random() - 0.5) * (novaTimer * 0.08);
    const swell = Math.sin(novaTimer * 0.15) * 8 + (novaTimer * 0.12);
    const currentRadius = starRadius + swell;

    const starGlow = ctx.createRadialGradient(bhX + shakeX, bhY + shakeY, 0, bhX + shakeX, bhY + shakeY, currentRadius * 3.5);
    starGlow.addColorStop(0, '#ffffff');
    starGlow.addColorStop(0.2, '#ffcc00');
    starGlow.addColorStop(0.6, 'rgba(255, 50, 0, 0.6)');
    starGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = starGlow;
    ctx.beginPath();
    ctx.arc(bhX + shakeX, bhY + shakeY, currentRadius * 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (novaTimer > 200) {
      novaState = 'IMPLODE';
      novaTimer = 0;
    }
  }

  // --- STAGE 2: IMPLOSION ---
  else if (novaState === 'IMPLODE') {
    starRadius *= 0.80;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bhX, bhY, Math.max(starRadius, 1), 0, Math.PI * 2);
    ctx.fill();

    if (starRadius < 1.5) {
      novaState = 'SILENCE';
      novaTimer = 0;
    }
  }

  // --- STAGE 3: THE OMINOUS SILENCE ---
  else if (novaState === 'SILENCE') {
    if (novaTimer > 45) {
      novaState = 'EXPLODE';
      flashAlpha = 1;
      innerShockwave = 10;
      outerShockwave = 5;

      novaParticles = [];
      for (let i = 0; i < 110; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 16 + 5;
        novaParticles.push({
          x: bhX,
          y: bhY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: Math.random() * 4 + 1.5,
          color: Math.random() > 0.3 ? '#ffaa00' : '#ffffff',
          alpha: 1
        });
      }
    }
  }

  // --- STAGE 4: DETONATION & SHOCKWAVE ---
  if (novaState === 'EXPLODE') {
    innerShockwave += 20;
    outerShockwave += 9;
    shockwaveAlpha -= 0.015;

    if (shockwaveAlpha > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${shockwaveAlpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(bhX, bhY, innerShockwave, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 120, 0, ${shockwaveAlpha * 0.7})`;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(bhX, bhY, outerShockwave, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (flashAlpha > 0) {
      const flashGlow = ctx.createRadialGradient(bhX, bhY, 0, bhX, bhY, 800);
      flashGlow.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      flashGlow.addColorStop(0.3, `rgba(255, 140, 0, ${flashAlpha * 0.7})`);
      flashGlow.addColorStop(0.8, `rgba(180, 20, 0, ${flashAlpha * 0.3})`);
      flashGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = flashGlow;
      ctx.beginPath();
      ctx.arc(bhX, bhY, 800, 0, Math.PI * 2);
      ctx.fill();

      flashAlpha -= 0.018;
    } else {
      novaState = 'COMPLETE';
    }
  }

  for (let p of novaParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.93;
    p.vy *= 0.93;
    p.alpha -= 0.01;

    if (p.alpha > 0) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // --- STAGE 5: TILTED BLACK HOLE & ALIGNED ACCRETION ---
  if (novaState === 'EXPLODE' || novaState === 'COMPLETE') {
    if (!window.bhParticles) {
      window.bhParticles = [];
      for (let i = 0; i < 45; i++) {
        window.bhParticles.push({
          angle: Math.random() * Math.PI * 2,
          dist: Math.random() * 90 + coreRadius + 15,
          speed: Math.random() * 0.025 + 0.01,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.4 ? '#ffaa00' : '#ff4500'
        });
      }
    }

    // Spawn Infalling Particles along the plane
    if (Math.random() < 0.4) {
      const spawnAng = Math.random() * Math.PI * 2;
      const spawnDist = Math.random() * 120 + 170;
      infallingParticles.push({
        dist: spawnDist,
        angle: spawnAng,
        speed: Math.random() * 0.4 + 0.3, // Slower, heavier motion
        size: Math.random() * 2.8 + 1.8,  // More prominent size
        color: Math.random() > 0.4 ? '#ffaa00' : '#ff3300'
      });
    }

    // --- APPLY TILTED TRANSFORM MATRIX ---
    ctx.save();
    ctx.translate(bhX, bhY);
    ctx.rotate(tiltAngle);

    // Ambient Outer Glow
    const outerGlow = ctx.createRadialGradient(0, 0, coreRadius, 0, 0, 200);
    outerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
    outerGlow.addColorStop(0.5, 'rgba(255, 40, 0, 0.1)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 200, 0, Math.PI * 2);
    ctx.fill();

    // Accretion Disk Ellipse
    const ringGrad = ctx.createRadialGradient(0, 0, coreRadius, 0, 0, 150);
    ringGrad.addColorStop(0, '#ffcc00');
    ringGrad.addColorStop(0.25, '#ff5500');
    ringGrad.addColorStop(0.6, 'rgba(200, 30, 0, 0.3)');
    ringGrad.addColorStop(1, 'transparent');

    ctx.save();
    ctx.fillStyle = ringGrad;
    ctx.scale(1, 0.28);
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Render Infalling Particles aligned to disk plane
    for (let i = infallingParticles.length - 1; i >= 0; i--) {
      let ip = infallingParticles[i];
      ip.dist -= ip.speed;
      ip.angle += 0.015; // Slow spiral spin

      const px = Math.cos(ip.angle) * ip.dist;
      const py = Math.sin(ip.angle) * (ip.dist * 0.28);

      if (ip.dist <= coreRadius + 2) {
        infallingParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = ip.color;
      ctx.beginPath();
      ctx.arc(px, py, ip.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Orbiting Accretion Particles
    for (let p of window.bhParticles) {
      p.angle += p.speed;
      p.dist -= 0.1;
      if (p.dist < coreRadius + 4) p.dist = Math.random() * 90 + coreRadius + 20;
      p.px = Math.cos(p.angle) * p.dist;
      p.py = Math.sin(p.angle) * (p.dist * 0.28);
    }

    // Back Particles
    for (let p of window.bhParticles) {
      if (p.py < 0) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Blurred Event Horizon Base
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Soft Gravitational Lens Edge (Feathered Rim)
    const softEdge = ctx.createRadialGradient(0, 0, coreRadius - 12, 0, 0, coreRadius + 6);
    softEdge.addColorStop(0, '#000000');
    softEdge.addColorStop(0.65, 'rgba(0, 0, 0, 0.95)');
    softEdge.addColorStop(0.85, 'rgba(255, 140, 0, 0.4)');
    softEdge.addColorStop(1, 'transparent');

    ctx.fillStyle = softEdge;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius + 6, 0, Math.PI * 2);
    ctx.fill();

    // Outer Photonic Halo
    ctx.strokeStyle = 'rgba(255, 180, 50, 0.6)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff5500';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Front Particles
    for (let p of window.bhParticles) {
      if (p.py >= 0) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

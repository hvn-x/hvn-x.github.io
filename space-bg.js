const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let nebulaPuffs = [];

// SUPERNOVA STATE MACHINE
let novaState = 'BUILDUP'; // BUILDUP -> IMPLODE -> SILENCE -> EXPLODE -> COMPLETE
let novaTimer = 0;
let starRadius = 35;
let flashAlpha = 0;
let innerShockwave = 0;
let outerShockwave = 0;
let shockwaveAlpha = 1;
let novaParticles = [];

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

  // 3. SUPERNOVA SEQUENCE
  const bhX = width * 0.88;
  const bhY = height * 0.28;
  const coreRadius = 32;

  novaTimer++;

  // --- STAGE 1: UNSTABLE BUILDUP (Violent Tremor & Swell) ---
  if (novaState === 'BUILDUP') {
    const shakeX = (Math.random() - 0.5) * (novaTimer * 0.08);
    const shakeY = (Math.random() - 0.5) * (novaTimer * 0.08);
    const swell = Math.sin(novaTimer * 0.15) * 6 + (novaTimer * 0.1);
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

    // Pulling in initial cosmic dust
    if (novaTimer % 2 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 120 + 80;
      novaParticles.push({
        x: bhX + Math.cos(angle) * dist,
        y: bhY + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 4,
        vy: -Math.sin(angle) * 4,
        size: Math.random() * 2 + 1,
        color: '#ffaa00',
        alpha: 0.8,
        suckingIn: true
      });
    }

    if (novaTimer > 180) {
      novaState = 'IMPLODE';
      novaTimer = 0;
    }
  }

  // --- STAGE 2: GRAVITATIONAL IMPLOSION ---
  else if (novaState === 'IMPLODE') {
    starRadius *= 0.82; // Crushes down inward

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bhX, bhY, Math.max(starRadius, 1), 0, Math.PI * 2);
    ctx.fill();

    if (starRadius < 1.5) {
      novaState = 'SILENCE';
      novaTimer = 0;
    }
  }

  // --- STAGE 3: THE QUIET BEFORE THE STORM (Split second of complete dark) ---
  else if (novaState === 'SILENCE') {
    if (novaTimer > 15) { // 15 frames of ominous pause
      novaState = 'EXPLODE';
      flashAlpha = 1;
      innerShockwave = 10;
      outerShockwave = 5;

      // Blast out heavy ejecta
      novaParticles = [];
      for (let i = 0; i < 90; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 14 + 4;
        novaParticles.push({
          x: bhX,
          y: bhY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: Math.random() * 3.5 + 1.5,
          color: Math.random() > 0.3 ? '#ffaa00' : '#ffffff',
          alpha: 1,
          suckingIn: false
        });
      }
    }
  }

  // --- STAGE 4: MASSIVE SUPERNOVA BLAST ---
  if (novaState === 'EXPLODE') {
    innerShockwave += 18;
    outerShockwave += 8;
    shockwaveAlpha -= 0.018;

    // Dual Shockwave Rings
    if (shockwaveAlpha > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${shockwaveAlpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(bhX, bhY, innerShockwave, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 120, 0, ${shockwaveAlpha * 0.7})`;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(bhX, bhY, outerShockwave, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Heavy Screen Flash Fade
    if (flashAlpha > 0) {
      const flashGlow = ctx.createRadialGradient(bhX, bhY, 0, bhX, bhY, 700);
      flashGlow.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      flashGlow.addColorStop(0.3, `rgba(255, 140, 0, ${flashAlpha * 0.7})`);
      flashGlow.addColorStop(0.8, `rgba(180, 20, 0, ${flashAlpha * 0.3})`);
      flashGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = flashGlow;
      ctx.beginPath();
      ctx.arc(bhX, bhY, 700, 0, Math.PI * 2);
      ctx.fill();

      flashAlpha -= 0.02;
    } else {
      novaState = 'COMPLETE';
    }
  }

  // Render & update active debris particles
  for (let p of novaParticles) {
    p.x += p.vx;
    p.y += p.vy;

    if (!p.suckingIn) {
      p.vx *= 0.94; // Drag speed
      p.vy *= 0.94;
      p.alpha -= 0.012;
    }

    if (p.alpha > 0) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // --- STAGE 5: FINAL BLACK HOLE ---
  if (novaState === 'EXPLODE' || novaState === 'COMPLETE') {
    if (!window.bhParticles) {
      window.bhParticles = [];
      for (let i = 0; i < 35; i++) {
        window.bhParticles.push({
          angle: Math.random() * Math.PI * 2,
          dist: Math.random() * 70 + coreRadius + 10,
          speed: Math.random() * 0.02 + 0.008,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.4 ? '#ffaa00' : '#ff4500'
        });
      }
    }

    // Ambient Glow
    const outerGlow = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 150);
    outerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.25)');
    outerGlow.addColorStop(0.5, 'rgba(255, 40, 0, 0.08)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(bhX, bhY, 150, 0, Math.PI * 2);
    ctx.fill();

    // Ring Glow
    const ringGrad = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 110);
    ringGrad.addColorStop(0, '#ffaa00');
    ringGrad.addColorStop(0.3, '#ff5500');
    ringGrad.addColorStop(0.7, 'rgba(200, 30, 0, 0.25)');
    ringGrad.addColorStop(1, 'transparent');

    ctx.save();
    ctx.fillStyle = ringGrad;
    ctx.translate(bhX, bhY);
    ctx.scale(1, 0.28);
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Update particles
    for (let p of window.bhParticles) {
      p.angle += p.speed;
      p.dist -= 0.12;
      if (p.dist < coreRadius + 2) p.dist = Math.random() * 70 + coreRadius + 15;
      p.x = bhX + Math.cos(p.angle) * p.dist;
      p.y = bhY + Math.sin(p.angle) * (p.dist * 0.28);
    }

    // Back particles
    for (let p of window.bhParticles) {
      if (p.y < bhY) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Black Core
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(bhX, bhY, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // Rim Glow
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff5500';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(bhX, bhY, coreRadius + 1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Front particles
    for (let p of window.bhParticles) {
      if (p.y >= bhY) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

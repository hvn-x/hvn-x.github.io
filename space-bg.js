const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let nebulaPuffs = [];

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

// GENERATE RANDOM OVERLAPPING NEBULA CLUSTERS
function initNebulae() {
  nebulaPuffs = [];
  
  // Palette for multi-color space dust
  const colors = [
    'rgba(255, 90, 0, ',    // Neon Cosmic Orange
    'rgba(200, 20, 80, ',   // Deep Magenta
    'rgba(120, 0, 180, ',   // Galactic Violet
    'rgba(20, 80, 180, ',   // Deep Electric Blue
    'rgba(255, 140, 20, '   // Ember Gold
  ];

  // Create 4 distinct main clusters around the screen
  const centers = [
    { x: width * 0.18, y: height * 0.25 }, // Top-left
    { x: width * 0.82, y: height * 0.32 }, // Top-right (Black hole region)
    { x: width * 0.30, y: height * 0.75 }, // Bottom-left
    { x: width * 0.70, y: height * 0.80 }  // Bottom-right
  ];

  centers.forEach(center => {
    // Each cluster gets 12-18 overlapping gas puffs
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
        opacity: (Math.random() * 0.04 + 0.015).toFixed(3) // Keeps it subtle & layered
      });
    }
  });
}

function drawNebulae() {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let puff of nebulaPuffs) {
    ctx.save();
    ctx.translate(puff.x, puff.y);
    ctx.rotate(puff.rotation);
    ctx.scale(puff.scaleX, puff.scaleY);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, puff.radius);
    
    // Smooth multi-stop gradient
    const opacityNum = parseFloat(puff.opacity);
    grad.addColorStop(0, puff.colorBase + (opacityNum * 1.4) + ')');
    grad.addColorStop(0.2, puff.colorBase + (opacityNum * 0.8) + ')');
    grad.addColorStop(0.5, puff.colorBase + (opacityNum * 0.35) + ')');
    grad.addColorStop(0.8, puff.colorBase + (opacityNum * 0.1) + ')');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, puff.radius, 0, Math.PI * 2);
    ctx.fill();

    // DITHERING NOISE LAYER (Destroys color banding rings)
    const noiseCount = Math.floor(puff.radius * 0.4);
    for (let i = 0; i < noiseCount; i++) {
      const nr = Math.random() * puff.radius * 0.85;
      const na = Math.random() * Math.PI * 2;
      const nx = Math.cos(na) * nr;
      const ny = Math.sin(na) * nr;
      const alpha = (Math.random() * opacityNum * 0.8).toFixed(4);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(nx, ny, 1, 1);
    }

    ctx.restore();
  }
  
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, width, height);

  // 1. DYNAMIC NEBULAE CLUSTERS
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

  // 3. ACCRETION BLACK HOLE
  const bhX = width * 0.88;
  const bhY = height * 0.28;
  const coreRadius = 32;

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

  // Ring Background Glow
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

  // Particle updates
  for (let p of window.bhParticles) {
    p.angle += p.speed;
    p.dist -= 0.12;
    if (p.dist < coreRadius + 2) p.dist = Math.random() * 70 + coreRadius + 15;
    p.x = bhX + Math.cos(p.angle) * p.dist;
    p.y = bhY + Math.sin(p.angle) * (p.dist * 0.28);
  }

  // BACK particles
  for (let p of window.bhParticles) {
    if (p.y < bhY) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Pitch Black Core
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

  // FRONT particles
  for (let p of window.bhParticles) {
    if (p.y >= bhY) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

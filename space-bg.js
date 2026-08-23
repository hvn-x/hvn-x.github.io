const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let angle = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStars();
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

function drawNebula(x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  ctx.clearRect(0, 0, width, height);

  // 1. NEBULAS
  drawNebula(width * 0.2, height * 0.3, 400, 'rgba(255, 90, 0, 0.08)');
  drawNebula(width * 0.8, height * 0.7, 500, 'rgba(180, 40, 0, 0.06)');
  drawNebula(width * 0.5, height * 0.5, 600, 'rgba(100, 20, 120, 0.04)');

  // 2. STARS
  for (let star of stars) {
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

    ctx.fillStyle = `rgba(255, 230, 200, ${Math.abs(star.alpha)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

// 3. CLEAN ACCRETION BLACK HOLE
  const bhX = width * 0.88;
  const bhY = height * 0.28;
  const coreRadius = 32;

  // Initialize particles once
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

  // 1. Far Ambient Glow
  const outerGlow = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 150);
  outerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.25)');
  outerGlow.addColorStop(0.5, 'rgba(255, 40, 0, 0.08)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(bhX, bhY, 150, 0, Math.PI * 2);
  ctx.fill();

  // 2. Main Accretion Ring (Background Glow)
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

  // Update positions for all particles
  for (let p of window.bhParticles) {
    p.angle += p.speed;
    p.dist -= 0.12;
    if (p.dist < coreRadius + 2) p.dist = Math.random() * 70 + coreRadius + 15;
    p.x = bhX + Math.cos(p.angle) * p.dist;
    p.y = bhY + Math.sin(p.angle) * (p.dist * 0.28);
  }

  // 3. Draw BACK particles (behind the event horizon)
  for (let p of window.bhParticles) {
    if (p.y < bhY) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Solid Pitch Black Event Horizon Center
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // 5. Thin Outer Rim Glow (Strictly OUTSIDE the core)
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff5500';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius + 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset blur for other canvas draws

  // 6. Draw FRONT particles (in front of the event horizon)
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

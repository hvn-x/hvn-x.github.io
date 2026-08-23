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
  angle += 0.015;

  // Initialize particles once if needed
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

  // 1. Soft Ambient Space Glow (Far background)
  const outerGlow = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 150);
  outerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.25)');
  outerGlow.addColorStop(0.5, 'rgba(255, 40, 0, 0.08)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(bhX, bhY, 150, 0, Math.PI * 2);
  ctx.fill();

  // 2. Main Accretion Ring (Tilted Oval Behind & Around)
  const ringGrad = ctx.createRadialGradient(bhX, bhY, coreRadius * 0.9, bhX, bhY, 110);
  ringGrad.addColorStop(0, '#ffcc00');
  ringGrad.addColorStop(0.3, '#ff5500');
  ringGrad.addColorStop(0.7, 'rgba(200, 30, 0, 0.3)');
  ringGrad.addColorStop(1, 'transparent');

  ctx.save();
  ctx.fillStyle = ringGrad;
  ctx.translate(bhX, bhY);
  ctx.scale(1, 0.28); // Flatten to create disk angle
  ctx.beginPath();
  ctx.arc(0, 0, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Swirling Matter Particles
  for (let p of window.bhParticles) {
    p.angle += p.speed;
    p.dist -= 0.12;
    if (p.dist < coreRadius + 2) p.dist = Math.random() * 70 + coreRadius + 15;

    const px = bhX + Math.cos(p.angle) * p.dist;
    const py = bhY + Math.sin(p.angle) * (p.dist * 0.28);

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Solid Black Void (Drawn AFTER background rings so core stays pure black)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // 5. Thin Inner Photon Ring (Crisp edge glow around black void)
  const photonRing = ctx.createRadialGradient(bhX, bhY, coreRadius - 1, bhX, bhY, coreRadius + 5);
  photonRing.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  photonRing.addColorStop(0.4, '#ff9900');
  photonRing.addColorStop(1, 'transparent');
  ctx.fillStyle = photonRing;
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius + 5, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

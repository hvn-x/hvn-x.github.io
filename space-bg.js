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

// 3. 3D GRAVITATIONAL LENSING BLACK HOLE
  const bhX = width * 0.88;
  const bhY = height * 0.28;
  const coreRadius = 36;
  angle += 0.015;

  // Initialize particles once if they don't exist
  if (!window.bhParticles) {
    window.bhParticles = [];
    for (let i = 0; i < 40; i++) {
      window.bhParticles.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 80 + coreRadius + 5,
        speed: Math.random() * 0.02 + 0.01,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#ffaa00' : '#ff4500'
      });
    }
  }

  // Outer Lensing Atmosphere Glow
  const outerGlow = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 170);
  outerGlow.addColorStop(0, 'rgba(255, 120, 0, 0.35)');
  outerGlow.addColorStop(0.4, 'rgba(255, 50, 0, 0.12)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(bhX, bhY, 170, 0, Math.PI * 2);
  ctx.fill();

  // BACK HALO (Upper Lensed Disk - Bent over top)
  const topHalo = ctx.createRadialGradient(bhX, bhY - 10, coreRadius, bhX, bhY - 10, 110);
  topHalo.addColorStop(0, '#ffffff');
  topHalo.addColorStop(0.25, '#ff9900');
  topHalo.addColorStop(0.6, 'rgba(255, 68, 0, 0.4)');
  topHalo.addColorStop(1, 'transparent');

  ctx.save();
  ctx.fillStyle = topHalo;
  ctx.beginPath();
  ctx.arc(bhX, bhY - 10, 110, Math.PI * 0.85, Math.PI * 0.15, true);
  ctx.fill();
  ctx.restore();

  // SWIRLING MATTER PARTICLES (Sucked into core)
  for (let p of window.bhParticles) {
    p.angle += p.speed;
    p.dist -= 0.15; // Slowly spiral in
    if (p.dist < coreRadius) p.dist = Math.random() * 80 + coreRadius + 20;

    const px = bhX + Math.cos(p.angle) * p.dist;
    const py = bhY + Math.sin(p.angle) * (p.dist * 0.3); // Flatten perspective

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // MAIN FRONT ACCRETION DISK (Horizontal Ring)
  const frontDisk = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 120);
  frontDisk.addColorStop(0, '#ffffff');
  frontDisk.addColorStop(0.2, '#ffaa00');
  frontDisk.addColorStop(0.55, 'rgba(255, 68, 0, 0.7)');
  frontDisk.addColorStop(1, 'transparent');

  ctx.save();
  ctx.fillStyle = frontDisk;
  ctx.translate(bhX, bhY);
  ctx.scale(1, 0.22); // Deep horizontal perspective
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // EVENT HORIZON (Solid Black Void overlaying the back ring)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // PHOTON RING (Thin rim glow directly around event horizon)
  const photonRing = ctx.createRadialGradient(bhX, bhY, coreRadius - 1, bhX, bhY, coreRadius + 4);
  photonRing.addColorStop(0, '#ffffff');
  photonRing.addColorStop(0.6, '#ff8800');
  photonRing.addColorStop(1, 'transparent');
  ctx.fillStyle = photonRing;
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius + 4, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

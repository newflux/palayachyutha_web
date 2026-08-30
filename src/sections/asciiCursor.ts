/**
 * Global ASCII Cursor Trail
 * Spawns ASCII characters at the cursor that drift, rotate, and fade.
 * Works across the entire page via a fixed canvas.
 */

interface AsciiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
}

// Characters pool — ordered from subtle to bold
const ASCII_CHARS = ['·', '•', ':', '.', '+', '*', '░', '▪', '▫', '∘', '○', '□'];

export function initAsciiCursor(): void {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'ascii-cursor-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  // Mouse state
  let mouseX = -9999;
  let mouseY = -9999;
  let lastMouseX = -9999;
  let lastMouseY = -9999;
  let mouseSpeed = 0;

  const particles: AsciiParticle[] = [];
  const MAX_PARTICLES = 200;

  function resize(): void {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function spawnParticles(): void {
    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;
    mouseSpeed = Math.sqrt(dx * dx + dy * dy);

    if (mouseSpeed < 2) return;

    // More particles at higher speed
    const count = Math.min(2 + Math.floor(mouseSpeed * 0.08), 6);

    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) {
        particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * (1 + mouseSpeed * 0.05);
      const life = 40 + Math.random() * 50;
      const charIndex = Math.floor(Math.random() * ASCII_CHARS.length);

      particles.push({
        x: mouseX + (Math.random() - 0.5) * 8,
        y: mouseY + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * spread * 0.8,
        vy: Math.sin(angle) * spread * 0.8,
        char: ASCII_CHARS[charIndex],
        size: 8 + Math.random() * 6,
        alpha: 0.7 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        life: 0,
        maxLife: life,
      });
    }
  }

  function draw(): void {
    ctx!.clearRect(0, 0, width, height);

    // Spawn if mouse moved
    if (mouseX !== lastMouseX || mouseY !== lastMouseY) {
      spawnParticles();
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }

    ctx!.textBaseline = 'middle';
    ctx!.textAlign = 'center';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.life++;
      const t = p.life / p.maxLife; // 0 → 1

      // Decelerate
      p.x += p.vx * (1 - t * 0.7);
      p.y += p.vy * (1 - t * 0.7);
      p.rotation += p.rotSpeed * (1 - t);

      // Fade curve: quick in, slow out
      const fadeIn = Math.min(t * 8, 1);
      const fadeOut = 1 - Math.pow(t, 2);
      const alpha = p.alpha * fadeIn * fadeOut;

      // Scale down towards end
      const scale = 1 - t * 0.4;
      const size = p.size * scale;

      if (p.life >= p.maxLife || alpha <= 0.01) {
        particles.splice(i, 1);
        continue;
      }

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.font = `${size}px 'JetBrains Mono', monospace`;
      ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx!.fillText(p.char, 0, 0);
      ctx!.restore();
    }

    requestAnimationFrame(draw);
  }

  // ── Events ──────────────────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  window.addEventListener('touchend', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  window.addEventListener('resize', resize);

  // Start
  requestAnimationFrame(draw);
}

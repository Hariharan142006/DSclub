"use client";

import { useEffect, useRef } from 'react';

export default function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let animationFrameId;
    let scrollY = window.scrollY;
    let time = 0;
    let docHeight = 1;
    let frameCount = 0;

    // Pre-render a glowing dot to an offscreen canvas with a sharp core
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 32;
    dotCanvas.height = 32;
    const dctx = dotCanvas.getContext('2d');
    
    // 1. Soft Halo
    const grad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    dctx.fillStyle = grad;
    dctx.fillRect(0, 0, 32, 32);

    // 2. Sharp Core Dot
    dctx.beginPath();
    dctx.arc(16, 16, 4.5, 0, Math.PI * 2);
    dctx.fillStyle = 'rgba(0, 240, 255, 1)';
    dctx.fill();

    // ─── 3D SHAPE GENERATORS (surface-biased for clear silhouettes) ──

    // Helper: put a point on or near a sphere surface
    const sphereSurface = (cx, cy, cz, rx, ry, rz, thickness) => {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      // 85% surface, 15% interior glow
      const r = Math.random() < 0.85 ? 1.0 - Math.random() * thickness : Math.random();
      return {
        x: cx + rx * r * Math.sin(phi) * Math.cos(theta),
        y: cy + ry * r * Math.sin(phi) * Math.sin(theta),
        z: cz + rz * r * Math.cos(phi),
      };
    };

    // 1. HUMAN BRAIN — highly accurate parametric 3D brain (Hero)
    const generateBrain = (count) => {
      const pts = [];
      for (let i = 0; i < count; i++) {
        let x, y, z;
        const region = Math.random();

        // 85% of points on cortex
        if (region < 0.85) {
          const isLeft = Math.random() < 0.5;
          const u = Math.random();
          const v = Math.random();
          
          const theta = Math.PI * u; // 0 to PI (one hemisphere)
          const phi = Math.acos(2 * v - 1); // 0 to PI
          
          // Base sphere for right hemisphere
          let nx = Math.sin(phi) * Math.sin(theta); 
          let ny = Math.cos(phi); 
          let nz = Math.sin(phi) * Math.cos(theta); 
          
          let R = 0.6;
          
          // Frontal lobe (front is nz > 0)
          if (nz > 0) R += 0.1 * nz;
          // Occipital lobe (back is nz < 0)
          else R += 0.15 * Math.abs(nz);

          if (ny < -0.1) {
             let temporal = Math.exp( -Math.pow(nx-0.7, 2)*3 - Math.pow(nz-0.0, 2)*5 );
             if (temporal > 0.2) R += 0.18 * temporal;
             else R *= 0.8 + 0.2 * (1 - Math.abs(ny)); 
          }

          // Parietal bulge (top)
          if (ny > 0.4) R += 0.1 * ny;

          // Scale dimensions to overall brain box
          nx = nx * R * 0.82; // Width
          ny = ny * R * 0.95; // Height
          nz = nz * R * 1.25; // Length

          // Longitudinal Fissure (Medial surface flattened with a gap)
          nx = 0.035 + nx * 0.965; 
          
          // Smooth the top rounding near the fissure
          if (ny > 0) nx += 0.04 * ny * ny; 
          
          // Apply Left/Right
          if (isLeft) nx = -nx;

          // Gyri and Sulci (Surface Details)
          const freq = 18;
          let wrinkle = Math.sin(nx * freq) * Math.cos(ny * freq + nz * freq) 
                      + Math.sin(nz * freq) * Math.cos(nx * freq - ny * freq);
          wrinkle *= 0.025; 
          
          nx += nx * wrinkle;
          ny += ny * wrinkle;
          nz += nz * wrinkle;

          // Surface bias
          let rScale = Math.random() < 0.85 ? 0.96 + Math.random() * 0.04 : Math.cbrt(Math.random());
          
          x = nx * rScale;
          y = ny * rScale + 0.1; // Shift up slightly
          z = nz * rScale;

        } else if (region < 0.95) {
          // Cerebellum (Bottom-back)
          const isLeft = Math.random() < 0.5;
          const u = Math.random(), v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          
          let nx = Math.sin(phi) * Math.cos(theta);
          let ny = Math.cos(phi);
          let nz = Math.sin(phi) * Math.sin(theta);
          
          // Folia (horizontal stripes)
          let folia = Math.sin(ny * 40) * 0.02;
          
          let R = 0.22;
          nx = nx * R * (1 + folia);
          ny = ny * R * 0.7; // squished vertically
          nz = nz * R * (1 + folia);
          
          // Positions
          const cx = isLeft ? -0.15 : 0.15;
          const cy = -0.45;
          const cz = -0.48; // Backwards
          
          let rScale = Math.random() < 0.85 ? 0.95 + Math.random() * 0.05 : Math.cbrt(Math.random());
          
          x = cx + nx * rScale;
          y = cy + ny * rScale;
          z = cz + nz * rScale;
          
        } else {
          // Brain Stem
          const angle = Math.random() * Math.PI * 2;
          const h = Math.random();
          const R = 0.06 + Math.pow(1 - h, 3) * 0.07; 
          
          let rScale = Math.random() < 0.85 ? 0.9 + Math.random() * 0.1 : Math.sqrt(Math.random());
          
          x = rScale * R * Math.cos(angle);
          y = -0.35 - h * 0.45;
          z = -0.15 + rScale * R * Math.sin(angle);
        }

        pts.push({ x, y, z });
      }
      return pts;
    };

    // 2. HUMAN HEAD/FACE — clear head silhouette like VOS9X image 1 (About)
    const generateHumanFace = (count) => {
      const pts = [];
      for (let i = 0; i < count; i++) {
        let x, y, z;
        const region = Math.random();

        if (region < 0.5) {
          // Cranium — upper skull shell (large sphere, surface-biased)
          const p = sphereSurface(0, 0.35, 0, 0.55, 0.55, 0.5, 0.07);
          x = p.x; y = p.y; z = p.z;
        } else if (region < 0.72) {
          // Mid-face / cheeks — tapered cylinder
          const angle = Math.random() * Math.PI * 2;
          const t = Math.random(); // 0=top, 1=chin
          const faceR = 0.48 - t * 0.2; // narrows toward chin
          const r = faceR * (0.92 + Math.random() * 0.08); // surface-biased
          x = r * Math.cos(angle);
          y = 0.0 - t * 0.65;
          z = r * Math.sin(angle) * 0.75;
        } else if (region < 0.8) {
          // Chin — small sphere at bottom
          const p = sphereSurface(0, -0.6, 0.1, 0.2, 0.15, 0.18, 0.1);
          x = p.x; y = p.y; z = p.z;
        } else if (region < 0.85) {
          // Nose — protruding ridge
          const t = Math.random();
          x = (Math.random() - 0.5) * 0.06;
          y = 0.1 - t * 0.45;
          z = 0.42 + Math.sin(t * Math.PI) * 0.18;
          x += (Math.random() - 0.5) * 0.03;
          z += (Math.random() - 0.5) * 0.03;
        } else if (region < 0.9) {
          // Eye sockets — two indentations
          const side = Math.random() < 0.5 ? -1 : 1;
          const angle = Math.random() * Math.PI * 2;
          const r = 0.09 * (0.85 + Math.random() * 0.15);
          x = side * 0.2 + r * Math.cos(angle);
          y = 0.2 + r * Math.sin(angle) * 0.6;
          z = 0.4 + Math.random() * 0.05;
        } else if (region < 0.93) {
          // Brow ridge — thick line above eyes
          const t = (Math.random() - 0.5) * 2;
          x = t * 0.35;
          y = 0.28 + (Math.random() - 0.5) * 0.04;
          z = 0.42 + Math.abs(t) * 0.06 + (Math.random() - 0.5) * 0.03;
        } else {
          // Neck — cylinder going down
          const angle = Math.random() * Math.PI * 2;
          const r = 0.16 * (0.88 + Math.random() * 0.12);
          x = r * Math.cos(angle);
          y = -0.75 - Math.random() * 0.45;
          z = r * Math.sin(angle);
        }

        pts.push({ x, y, z });
      }
      return pts;
    };

    // 3. BOXING GLOVE — clear glove shape like VOS9X image 2 (Events)
    const generateBoxingGlove = (count) => {
      const pts = [];
      for (let i = 0; i < count; i++) {
        let x, y, z;
        const part = Math.random();

        if (part < 0.55) {
          // Main glove body — large egg shape, surface shell
          const p = sphereSurface(0, 0.1, 0, 0.6, 0.65, 0.5, 0.06);
          x = p.x; y = p.y; z = p.z;
          // Flatten the striking face (front)
          if (z > 0.25) z = 0.25 + (z - 0.25) * 0.3;
          // Round the knuckle area (top front)
          if (y > 0.3 && z > 0) {
            const bulge = 0.08 * Math.exp(-(y - 0.5) * (y - 0.5) * 8);
            z += bulge;
          }
        } else if (part < 0.72) {
          // Thumb — side lobe, surface shell
          const p = sphereSurface(-0.5, 0.25, 0.1, 0.2, 0.3, 0.18, 0.08);
          x = p.x; y = p.y; z = p.z;
        } else if (part < 0.85) {
          // Wrist cuff — thick band/cylinder
          const angle = Math.random() * Math.PI * 2;
          const r = 0.28 * (0.88 + Math.random() * 0.12);
          const h = Math.random() * 0.25;
          x = r * Math.cos(angle);
          y = -0.6 - h;
          z = r * Math.sin(angle) * 0.7;
        } else if (part < 0.92) {
          // Wrist tapered connection 
          const angle = Math.random() * Math.PI * 2;
          const t = Math.random();
          const r = (0.28 + t * 0.1) * (0.9 + Math.random() * 0.1);
          x = r * Math.cos(angle);
          y = -0.35 - t * 0.25;
          z = r * Math.sin(angle) * 0.65;
        } else {
          // Lacing line on top surface
          const t = Math.random();
          const lacingY = -0.15 + t * 0.55;
          x = (Math.random() - 0.5) * 0.05;
          y = lacingY;
          z = 0.4 + Math.sin(t * 10) * 0.03;
          // Add small dots around lacing
          x += (Math.random() - 0.5) * 0.04;
          z += Math.random() * 0.03;
        }

        pts.push({ x, y, z });
      }
      return pts;
    };

    // 4. CHAIN LINKS — interlocking chain (Gallery)
    const generateChain = (count) => {
      const pts = [];
      const numLinks = 5;
      const linkHeight = 0.55;
      const linkWidth = 0.35;
      const linkDepth = 0.12;
      const totalH = numLinks * linkHeight * 0.7;

      for (let i = 0; i < count; i++) {
        const linkIdx = Math.floor(Math.random() * numLinks);
        const isVertical = linkIdx % 2 === 0;
        const centerY = -totalH / 2 + linkIdx * linkHeight * 0.7;

        // Each link is a rounded rectangle torus
        const t = Math.random() * Math.PI * 2; // around the ring

        let rx, ry;
        if (isVertical) {
          rx = linkWidth;
          ry = linkHeight * 0.5;
        } else {
          rx = linkWidth * 0.9;
          ry = linkHeight * 0.5;
        }

        // Position on the ring path
        const ringX = rx * Math.cos(t);
        const ringY = ry * Math.sin(t);

        // Tube cross-section
        const tubeAngle = Math.random() * Math.PI * 2;
        const tubeR = linkDepth * Math.sqrt(Math.random());

        let x, y, z;
        if (isVertical) {
          // Vertical link — ring in XY plane
          x = ringX + tubeR * Math.cos(tubeAngle) * Math.cos(t) * 0.3;
          y = centerY + ringY;
          z = tubeR * Math.sin(tubeAngle);
        } else {
          // Horizontal link — ring in ZY plane, rotated 90°
          x = tubeR * Math.sin(tubeAngle);
          y = centerY + ringY;
          z = ringX + tubeR * Math.cos(tubeAngle) * Math.cos(t) * 0.3;
        }

        pts.push({ x, y, z });
      }
      return pts;
    };

    // 5. LADDER — 3D ladder structure (Contact)
    const generateLadder = (count) => {
      const pts = [];
      const numRungs = 6;
      const ladderH = 2.4;
      const railWidth = 0.5;
      const railDepth = 0.08;
      const rungDepth = 0.06;

      for (let i = 0; i < count; i++) {
        const part = Math.random();

        if (part < 0.35) {
          // Left rail
          const t = Math.random();
          const angle = Math.random() * Math.PI * 2;
          const r = railDepth * Math.sqrt(Math.random());
          pts.push({
            x: -railWidth + r * Math.cos(angle),
            y: -ladderH / 2 + t * ladderH,
            z: r * Math.sin(angle),
          });
        } else if (part < 0.7) {
          // Right rail
          const t = Math.random();
          const angle = Math.random() * Math.PI * 2;
          const r = railDepth * Math.sqrt(Math.random());
          pts.push({
            x: railWidth + r * Math.cos(angle),
            y: -ladderH / 2 + t * ladderH,
            z: r * Math.sin(angle),
          });
        } else {
          // Rungs
          const rungIdx = Math.floor(Math.random() * numRungs);
          const rungY = -ladderH / 2 + (rungIdx + 0.5) * (ladderH / numRungs);
          const t = Math.random(); // position along the rung
          const angle = Math.random() * Math.PI * 2;
          const r = rungDepth * Math.sqrt(Math.random());
          pts.push({
            x: -railWidth + t * railWidth * 2 + r * Math.cos(angle) * 0.3,
            y: rungY + r * Math.sin(angle),
            z: r * Math.cos(angle),
          });
        }
      }
      return pts;
    };

    // ─── 3D PROJECTION ──────────────────────────────────────────

    const fov = 600;

    const project = (x3d, y3d, z3d, cx, cy, rotY, rotX) => {
      // Y rotation
      let x = x3d * Math.cos(rotY) - z3d * Math.sin(rotY);
      let z = x3d * Math.sin(rotY) + z3d * Math.cos(rotY);
      let y = y3d;

      // X rotation
      const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
      y = y2; z = z2;

      const scale = fov / (fov + z * 300);
      return {
        sx: cx + x * 380 * scale,
        sy: cy - y * 380 * scale, // Negated y maps standard +Y to Canvas Up
        scale,
        z,
      };
    };

    // ─── INIT ───────────────────────────────────────────────────

    let shapes3D = [];
    let particles = [];

    const init = () => {

      // Cap DPR for perf on high-DPI screens
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = window.innerWidth < 768;
      // Reduced particle counts for smooth 60fps
      const particleCount = isMobile ? 2500 : 6000;

      docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        1
      ) - canvas.height;

      // Generate all 5 shapes
      shapes3D = [
        generateBrain(particleCount),       // Hero
        generateHumanFace(particleCount),    // About
        generateBoxingGlove(particleCount),  // Events
        generateChain(particleCount),        // Gallery
        generateLadder(particleCount),       // Contact
      ];

      // Pad to equal length
      shapes3D.forEach(shape => {
        while (shape.length < particleCount) {
          shape.push({
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2,
          });
        }
        // Trim excess
        shape.length = particleCount;
      });

      // Init particles from brain
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const p = shapes3D[0][i];
        particles.push({
          x: p.x, y: p.y, z: p.z,
          vx: 0, vy: 0, vz: 0,
          baseRadius: 0.3 + Math.random() * 1.1,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.006,
        });
      }
    };

    init();

    // ─── EVENT HANDLERS ─────────────────────────────────────────

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 250);
    };
    let scrollRafPending = false;
    const handleScroll = () => {
      if (scrollRafPending) return;
      scrollRafPending = true;
      requestAnimationFrame(() => {
        scrollY = window.scrollY;
        docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          1
        ) - window.innerHeight;
        scrollRafPending = false;
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    setTimeout(() => {
      docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        1
      ) - window.innerHeight;
    }, 600);

    // ─── SHAPE INTERPOLATION ────────────────────────────────────

    const getShapeInterp = (progress) => {
      const n = 5;
      const seg = 1.0 / n;
      const idx = Math.min(Math.floor(progress / seg), n - 1);
      const next = Math.min(idx + 1, n - 1);
      const localT = (progress - idx * seg) / seg;
      // Smooth ease in-out
      const t = localT * localT * (3 - 2 * localT);
      return { fromIdx: idx, toIdx: next, t };
    };

    // ─── DRAW LOOP ──────────────────────────────────────────────

    const draw = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      ctx.clearRect(0, 0, cw, ch);
      time += 1;
      frameCount += 1;

      const cx = cw * 0.5;
      const cy = ch * 0.48;

      const scrollProgress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
      const { fromIdx, toIdx, t } = getShapeInterp(scrollProgress);

      const fromShape = shapes3D[fromIdx];
      const toShape = shapes3D[toIdx];

      // VOS9X-style rotation: gentle auto-spin + scroll-driven rotation
      const autoRotY = time * 0.003;
      const scrollRotY = scrollProgress * Math.PI * 3;
      const scrollRotX = Math.sin(scrollProgress * Math.PI * 1.5) * 0.25;
      const rotY = autoRotY + scrollRotY;
      const rotX = scrollRotX + Math.sin(time * 0.0015) * 0.06;

      // Spring morph physics — skip every other frame for cheaper updates
      const spring = 0.04;
      const friction = 0.84;
      const doPhysics = (frameCount & 1) === 0; // every other frame

      // Update 3D positions
      if (doPhysics) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const f = fromShape[i];
          const to2 = toShape[i];

          if (f && to2) {
            const tx = f.x + (to2.x - f.x) * t;
            const ty = f.y + (to2.y - f.y) * t;
            const tz = f.z + (to2.z - f.z) * t;

            p.vx += (tx - p.x) * spring;
            p.vy += (ty - p.y) * spring;
            p.vz += (tz - p.z) * spring;
          }

          p.vx *= friction;
          p.vy *= friction;
          p.vz *= friction;
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
        }
      }

      // Project to 2D & depth sort
      const projected = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const proj = project(p.x, p.y, p.z, cx, cy, rotY, rotX);

        if (proj.sx < -30 || proj.sx > cw + 30 || proj.sy < -30 || proj.sy > ch + 30) continue;

        projected.push({
          sx: proj.sx,
          sy: proj.sy,
          scale: proj.scale,
          z: proj.z,
          br: p.baseRadius,
          tp: p.twinklePhase,
          ts: p.twinkleSpeed,
        });
      }

      // No need to sort for additive blending (hugely improves CPU performance)
      // projected.sort((a, b) => b.z - a.z);

      // Render dots using the incredibly fast pre-rendered offscreen trick
      ctx.globalCompositeOperation = 'screen'; // Use screen/lighter for a volumetric glow effect
      
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        const depthNorm = Math.max(0, Math.min(1, (p.z + 1.5) / 3));
        const size = p.br * p.scale * (0.35 + depthNorm * 0.85);
        if (size < 0.1) continue;

        const twinkle = 0.6 + 0.4 * Math.sin(time * p.ts + p.tp);
        let alpha = (0.12 + depthNorm * 0.8) * twinkle;
        
        ctx.globalAlpha = Math.min(alpha, 1);
        
        // Draw the pre-rendered glowing dot image
        const drawSize = Math.max(3, size * 7); 
        const dx = (p.sx - drawSize * 0.5) | 0;
        const dy = (p.sy - drawSize * 0.5) | 0;
        const ds = (drawSize + 0.5) | 0;
        ctx.drawImage(dotCanvas, dx, dy, ds, ds);
      }
      
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.9,
      }}
    />
  );
}

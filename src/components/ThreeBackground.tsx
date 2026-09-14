import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  theme: 'dark' | 'light';
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ theme }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for all rotating objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Color definitions based on theme
    const isDark = themeRef.current === 'dark';
    const primaryColor = isDark ? 0x8b5cf6 : 0x6366f1; // Violet
    const secondaryColor = isDark ? 0x06b6d4 : 0x0ea5e9; // Cyan
    const particleColor = isDark ? 0x38bdf8 : 0x818cf8;

    // 1. Wireframe Globe (Icosahedron / Sphere)
    const globeGeo = new THREE.IcosahedronGeometry(7.5, 3);
    const globeMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.15 : 0.12,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    mainGroup.add(globe);

    // Inner core globe
    const coreGeo = new THREE.SphereGeometry(6.8, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.06 : 0.05,
    });
    const coreGlobe = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreGlobe);

    // 2. Concentric Astrolabe / Chronometer Rings
    const ringsGroup = new THREE.Group();
    mainGroup.add(ringsGroup);

    const ringRadii = [9.2, 10.5, 11.8];
    const ringMeshes: THREE.Line[] = [];

    ringRadii.forEach((radius, idx) => {
      const ringGeo = new THREE.BufferGeometry();
      const points: number[] = [];
      const segments = 120;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(Math.cos(theta) * radius, Math.sin(theta) * radius, 0);
      }
      ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      const ringMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? secondaryColor : primaryColor,
        transparent: true,
        opacity: isDark ? 0.28 : 0.2,
      });
      const ring = new THREE.Line(ringGeo, ringMat);
      // Tilt each ring slightly
      ring.rotation.x = Math.PI / 3 + idx * 0.25;
      ring.rotation.y = idx * 0.4;
      ringsGroup.add(ring);
      ringMeshes.push(ring);
    });

    // 3. Stardust / Particle Swarm
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const r = 8 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = Math.random();
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.12,
      transparent: true,
      opacity: isDark ? 0.5 : 0.35,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // Mouse interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      targetX += (mouseX * 0.4 - targetX) * 0.05;
      targetY += (mouseY * 0.4 - targetY) * 0.05;

      // Rotate main globe
      globe.rotation.y = elapsedTime * 0.08;
      globe.rotation.x = 0.2 + targetY * 0.2;
      globe.rotation.z = -targetX * 0.2;

      coreGlobe.rotation.y = -elapsedTime * 0.05;

      // Astrolabe rings rotation
      ringsGroup.rotation.y = elapsedTime * 0.04 + targetX * 0.3;
      ringsGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.15 + targetY * 0.3;

      // Particle rotation
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      id="three-canvas-container"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-90 transition-opacity duration-700"
      style={{
        background: theme === 'dark' 
          ? 'radial-gradient(ellipse at 50% 15%, rgba(20, 24, 45, 0.7) 0%, rgba(7, 9, 14, 0.98) 75%)'
          : 'radial-gradient(ellipse at 50% 15%, rgba(238, 242, 255, 0.8) 0%, rgba(248, 250, 252, 0.98) 75%)',
      }}
    />
  );
};

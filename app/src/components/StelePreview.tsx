import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './StelePreview.module.css';

interface StelePreviewProps {
  /** Background color — v3.html passes `bg="#f0f5e6"` for the asset-detail viewer. */
  bg?: string;
}

/**
 * Stele + turtle-base 3D preview, ported 1:1 from viewer.js's
 * `ArtifactViewer` custom element (drag-to-rotate, wheel-to-zoom, idle
 * auto-rotate, ResizeObserver-driven resize). `three` is installed from npm
 * instead of loaded from the CDN import used in the mockup.
 */
export default function StelePreview({ bg = '#eae9e9' }: StelePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bg);
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.set(0, 0.4, 6.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;cursor:grab';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8686, 1.15));
    const dir = new THREE.DirectionalLight(0xffffff, 1.7);
    dir.position.set(3, 5, 4);
    scene.add(dir);
    const back = new THREE.DirectionalLight(0xffffff, 0.5);
    back.position.set(-4, 2, -3);
    scene.add(back);

    const g = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0x8f8b8b, roughness: 0.85, metalness: 0.05 });
    const darkStone = new THREE.MeshStandardMaterial({ color: 0x676363, roughness: 0.9 });
    const ink = new THREE.MeshStandardMaterial({ color: 0x44403f, roughness: 0.95 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.32, 1.7), darkStone);
    base.position.y = -1.55;
    g.add(base);

    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 16), darkStone);
    shell.scale.set(1.3, 0.45, 0.95);
    shell.position.y = -1.28;
    g.add(shell);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 12), darkStone);
    head.scale.set(1.5, 0.85, 0.9);
    head.position.set(1.5, -1.32, 0);
    g.add(head);

    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.1, 0.26), stone);
    slab.position.y = 0.05;
    g.add(slab);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.26, 40), stone);
    top.rotation.x = Math.PI / 2;
    top.position.y = 1.1;
    g.add(top);

    const columns: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.55, 0.02), ink);
      col.position.set(-0.55 + i * 0.22, -0.05, 0.135);
      g.add(col);
      columns.push(col);
    }
    scene.add(g);

    let dragging = false;
    let px = 0;
    let py = 0;
    let idle = 0;
    const dom = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
      dom.style.cursor = 'grabbing';
      dom.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      g.rotation.y += (e.clientX - px) * 0.008;
      g.rotation.x = Math.max(-0.5, Math.min(0.6, g.rotation.x + (e.clientY - py) * 0.005));
      px = e.clientX;
      py = e.clientY;
      idle = 0;
    };
    const onPointerUp = () => {
      dragging = false;
      dom.style.cursor = 'grab';
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cam.position.z = Math.max(3.2, Math.min(10, cam.position.z + e.deltaY * 0.004));
    };

    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 440;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    });
    ro.observe(container);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!dragging && ++idle > 90) g.rotation.y += 0.0022;
      renderer.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      stone.dispose();
      darkStone.dispose();
      ink.dispose();
      base.geometry.dispose();
      shell.geometry.dispose();
      head.geometry.dispose();
      slab.geometry.dispose();
      top.geometry.dispose();
      columns.forEach((c) => c.geometry.dispose());
      if (container.contains(dom)) container.removeChild(dom);
    };
  }, [bg]);

  return (
    <div ref={containerRef} className={styles.viewer} style={{ background: bg }}>
      <div className={styles.hint}>kéo để xoay · lăn để thu phóng</div>
    </div>
  );
}

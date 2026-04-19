import { useEffect } from 'react';

/**
 * Custom hook encapsulating the two Three.js useEffects:
 * 1. Scene initialization (camera, renderer, lights, mesh, animate loop) — runs once when threeLoaded.
 * 2. Geometry / dot update — runs when x/y/currentFunc/nextX/nextY changes.
 */
export default function useThreeScene(
  mountRef,
  sceneElementsRef,
  threeLoaded,
  currentFunc,
  x,
  y,
  nextX,
  nextY,
  z,
  nextZ,
) {
  // Effect 1: Initialize Three.js scene
  useEffect(() => {
    if (!threeLoaded || !mountRef.current) return;
    const THREE = window.THREE;
    if (!THREE || !THREE.OrbitControls) return;

    const container = mountRef.current;
    container.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Axis label sprites
    const createTextSprite = (text, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color;
      ctx.font = 'bold 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 64);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(1.5, 1.5, 1.5);
      return sprite;
    };

    // Math X → Three X (red), Math Y → Three Z (blue), Math Z → Three Y (green)
    const labelX = createTextSprite('X', '#ef4444');
    labelX.position.set(5.5, 0, 0);
    scene.add(labelX);

    const labelY = createTextSprite('Y', '#3b82f6');
    labelY.position.set(0, 0, 5.5);
    scene.add(labelY);

    const labelZ = createTextSprite('Z', '#22c55e');
    labelZ.position.set(0, 5.5, 0);
    scene.add(labelZ);

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });
    const surfaceMesh = new THREE.Mesh(geometry, material);

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    surfaceMesh.add(wireframeMesh);
    scene.add(surfaceMesh);

    const currentDotGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const currentDotMat = new THREE.MeshPhongMaterial({ color: 0xef4444 });
    const currentDot = new THREE.Mesh(currentDotGeo, currentDotMat);
    scene.add(currentDot);

    const nextDotGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const nextDotMat = new THREE.MeshPhongMaterial({ color: 0x9ca3af });
    const nextDot = new THREE.Mesh(nextDotGeo, nextDotMat);
    scene.add(nextDot);

    let reqId;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    sceneElementsRef.current = { scene, camera, renderer, controls, surfaceMesh, currentDot, nextDot };

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sceneElementsRef.current = null;
    };
  }, [threeLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: Update surface geometry and dots
  useEffect(() => {
    const elements = sceneElementsRef.current;
    if (!elements || !window.THREE) return;

    const { surfaceMesh, currentDot, nextDot } = elements;
    const THREE = window.THREE;

    const size = 60;
    const [min, max] = currentFunc.domain;
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= size; i++) {
      const mathY = min + (i / size) * (max - min);
      for (let j = 0; j <= size; j++) {
        const mathX = min + (j / size) * (max - min);
        const mathZ = currentFunc.f(mathX, mathY);
        vertices.push(mathX, mathZ * currentFunc.zScale, mathY);
      }
    }

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const a = i * (size + 1) + j;
        const b = a + 1;
        const c = a + (size + 1);
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    surfaceMesh.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    surfaceMesh.geometry.setIndex(indices);
    surfaceMesh.geometry.computeVertexNormals();

    currentDot.position.set(x, z * currentFunc.zScale, y);
    nextDot.position.set(nextX, nextZ * currentFunc.zScale, nextY);
  }, [x, y, nextX, nextY, currentFunc, z, nextZ, threeLoaded]); // eslint-disable-line react-hooks/exhaustive-deps
}

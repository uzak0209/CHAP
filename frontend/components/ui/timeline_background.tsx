import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Node {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  connections: number[];
}

const NetworkVisualization: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const nodeObjectsRef = useRef<THREE.Mesh[]>([]);
  const lineObjectsRef = useRef<THREE.Line[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // シーン、カメラ、レンダラーのセットアップ
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ノードの生成
    const nodeCount = 100;
    const nodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const node: Node = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.05
        ),
        size: Math.random() * 0.8 + 0.2,
        connections: []
      };
      nodes.push(node);
    }

    // 接続を生成（近いノード同士を繋ぐ）
    nodes.forEach((node, i) => {
      const nearbyNodes = nodes
        .map((otherNode, j) => ({ node: otherNode, index: j, distance: node.position.distanceTo(otherNode.position) }))
        .filter(({ index, distance }) => index !== i && distance < 25)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, Math.floor(Math.random() * 6) + 2);
      
      node.connections = nearbyNodes.map(({ index }) => index);
    });

    nodesRef.current = nodes;

    // ノードの3Dオブジェクト作成
    const nodeObjects: THREE.Mesh[] = [];
    const nodeGeometry = new THREE.SphereGeometry(1, 8, 8);
    
    nodes.forEach((node, i) => {
      const opacity = Math.random() * 0.6 + 0.4;
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(0.55, 0.8, 0.6),
        transparent: true,
        opacity: opacity
      });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.position.copy(node.position);
      mesh.scale.setScalar(node.size);
      scene.add(mesh);
      nodeObjects.push(mesh);
    });
    nodeObjectsRef.current = nodeObjects;

    // 接続線の作成
    const lineObjects: THREE.Line[] = [];
    nodes.forEach((node, i) => {
      node.connections.forEach(connectionIndex => {
        if (connectionIndex > i) { // 重複を避ける
          const points = [node.position.clone(), nodes[connectionIndex].position.clone()];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ 
            color: new THREE.Color().setHSL(0.55, 0.6, 0.7),
            transparent: true,
            opacity: 0.3
          });
          const line = new THREE.Line(geometry, material);
          scene.add(line);
          lineObjects.push(line);
        }
      });
    });
    lineObjectsRef.current = lineObjects;

    // グラデーション効果のための背景パーティクル
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 200;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color().setHSL(0.55, 0.4, 0.8),
      size: 0.5,
      transparent: true,
      opacity: 0.2
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // アニメーションループ
    const animate = () => {
    

      const time = Date.now() * 0.001;

      // ノードの動きをアニメーション
      nodesRef.current.forEach((node, i) => {
        // ゆっくりとした浮遊運動
        node.position.x += Math.sin(time * 0.5 + i * 0.1) * 0.02;
        node.position.y += Math.cos(time * 0.3 + i * 0.15) * 0.015;
        
        // ノードオブジェクトの位置を更新
        if (nodeObjectsRef.current[i]) {
          nodeObjectsRef.current[i].position.copy(node.position);
          
          // サイズの微細な変動
          const scale = node.size + Math.sin(time * 2 + i * 0.5) * 0.1;
          nodeObjectsRef.current[i].scale.setScalar(scale);
        }
      });

      // 接続線を更新
      let lineIndex = 0;
      nodesRef.current.forEach((node, i) => {
        node.connections.forEach(connectionIndex => {
          if (connectionIndex > i && lineObjectsRef.current[lineIndex]) {
            const points = [node.position.clone(), nodesRef.current[connectionIndex].position.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            lineObjectsRef.current[lineIndex].geometry.dispose();
            lineObjectsRef.current[lineIndex].geometry = geometry;
            lineIndex++;
          }
        });
      });

      // パーティクルの回転
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;

      // カメラの自動回転
      camera.position.x = Math.cos(time * 0.1) * 80;
      camera.position.z = Math.sin(time * 0.1) * 80 + 50;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // リサイズハンドラー
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // メモリリークを防ぐためにジオメトリとマテリアルを破棄
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 text-blue-600 font-mono text-sm opacity-70">
        Network Visualization
      </div>
    </div>
  );
};

export default NetworkVisualization;
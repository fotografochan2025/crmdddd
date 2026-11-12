import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Layers, RotateCw, Eye, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface Phone3DExplodedSceneProps {
  scrollExplosion?: number; // 0 to 1 from scroll progress
  onLayerSelect?: (layerName: string, description: string) => void;
  activeChannel?: 'whatsapp' | 'instagram' | 'audio';
  triggerBurst?: number;
}

export interface LayerSpec {
  id: string;
  name: string;
  tag: string;
  description: string;
  group: THREE.Group;
  baseZ: number;
  explodeZ: number;
  explodeX: number;
  explodeY: number;
  explodeRotY: number;
}

export const Phone3DExplodedScene: React.FC<Phone3DExplodedSceneProps> = ({
  scrollExplosion = 0,
  onLayerSelect,
  activeChannel = 'whatsapp',
  triggerBurst = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [manualExplode, setManualExplode] = useState<number | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('all');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // References to keep render loop fast with zero GC allocations
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const layersRef = useRef<LayerSpec[]>([]);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chipGlowMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Drag & rotation kinematics
  const rotTarget = useRef({ x: 0.16, y: -0.35 });
  const rotCurrent = useRef({ x: 0.16, y: -0.35 });
  const mousePrev = useRef({ x: 0, y: 0 });
  const explodeTarget = useRef<number>(0);
  const explodeCurrent = useRef<number>(0);

  // Audio synthesis for tactile hardware feedback
  const playTactileFeedback = useCallback(
    (type: 'click' | 'expand') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === 'expand') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.14);
          gain.gain.setValueAtTime(0.02, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        } else {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(620, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.025, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {
        // Ignore audio permissions
      }
    },
    [soundEnabled]
  );

  // Sync explosion target from scroll or manual override
  useEffect(() => {
    explodeTarget.current = manualExplode !== null ? manualExplode : scrollExplosion;
  }, [scrollExplosion, manualExplode]);

  // Redraw screen canvas texture when channel changes
  const updateScreenCanvas = useCallback(() => {
    const canvas = screenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark titanium glass OLED display
    ctx.fillStyle = '#070D0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle matrix grid
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Dynamic Island Pill
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 80, 24, 160, 42, 21);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Camera dot & prober inside Island
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 48, 45, 4, 0, Math.PI * 2);
    ctx.fill();

    // Status Bar
    ctx.fillStyle = '#E5E7EB';
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.fillText('09:41', 42, 54);
    ctx.fillText('5G · 100%', canvas.width - 140, 54);

    // App Header Pill
    ctx.fillStyle = activeChannel === 'instagram' ? '#180B24' : '#0B1A14';
    ctx.beginPath();
    ctx.roundRect(24, 88, canvas.width - 48, 80, 20);
    ctx.fill();
    ctx.strokeStyle =
      activeChannel === 'instagram' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(52, 211, 153, 0.35)';
    ctx.stroke();

    // Header Content
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px system-ui, sans-serif';
    const title =
      activeChannel === 'instagram'
        ? 'Instagram Direct API'
        : activeChannel === 'audio'
        ? 'Transcrição de Voz IA'
        : 'WhatsApp Oficial · MultiAtend';
    ctx.fillText(title, 48, 138);

    // Chat Bubbles
    const drawBubble = (
      text: string,
      y: number,
      isAgent: boolean,
      sub: string
    ) => {
      const bw = canvas.width - 120;
      const bx = isAgent ? 80 : 36;
      ctx.fillStyle = isAgent
        ? 'rgba(16, 185, 129, 0.22)'
        : 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = isAgent
        ? 'rgba(52, 211, 153, 0.45)'
        : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, y, bw, 110, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isAgent ? '#E6FFFA' : '#F3F4F6';
      ctx.font = '500 22px system-ui, sans-serif';
      ctx.fillText(text.slice(0, 36), bx + 22, y + 44);
      if (text.length > 36) {
        ctx.fillText(text.slice(36, 74), bx + 22, y + 74);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '400 16px monospace';
      ctx.fillText(sub, bx + bw - 90, y + 96);
    };

    if (activeChannel === 'instagram') {
      drawBubble('Vi seu anúncio nos Stories! Tem API para 14 usuários?', 200, false, '14:18');
      drawBubble('Sim! Roteamento automático no mesmo painel.', 340, true, '14:18 · ✓✓');
      drawBubble('Quero agendar demonstração para hoje.', 480, false, '14:19');
      drawBubble('Horário reservado no Meet: 16h30.', 620, true, '14:19 · ✓✓');
    } else if (activeChannel === 'audio') {
      drawBubble('Áudio (0:18) recebido do cliente...', 200, false, '14:22');
      drawBubble('Transcrito: "Preciso migrar 8 mil contatos."', 340, true, '14:22 · IA');
      drawBubble('Importação automática ativada no CRM.', 480, true, '14:23 · ✓✓');
    } else {
      drawBubble('Olá! Preciso conectar 20 vendedores.', 200, false, '14:12');
      drawBubble('Perfeito! Distribuição em 0.4s por fila.', 340, true, '14:12 · ✓✓');
      drawBubble('Consigo ver o Kanban de vendas ao vivo?', 480, false, '14:13');
      drawBubble('Card criado na etapa Atendimento! SLA 45s.', 620, true, '14:13 · ✓✓');
    }

    // Bottom Navigation Bar indicator
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 90, canvas.height - 30, 180, 8, 4);
    ctx.fill();

    if (screenTextureRef.current) {
      screenTextureRef.current.needsUpdate = true;
    }
  }, [activeChannel]);

  useEffect(() => {
    updateScreenCanvas();
  }, [updateScreenCanvas]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 560;

    // Detect software WebGL as instructed by the Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 10.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Environment lighting via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-point lighting setup
    const keyLight = new THREE.DirectionalLight(0xecfdf5, 2.8);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.8);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 2.2);
    rimLight.position.set(0, -6, -4);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xdcfce7, 0x060908, 0.9);
    scene.add(hemiLight);

    // Root Group
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, 0.1, 0);
    scene.add(rootGroup);
    mainGroupRef.current = rootGroup;

    // PROCEDURAL TEXTURE GENERATION FOR HARDWARE LAYERS
    // 1. OLED Screen Canvas & Texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 1024;
    screenCanvasRef.current = screenCanvas;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    screenTextureRef.current = screenTexture;
    updateScreenCanvas();

    // 2. Logic Board Procedural Texture (Neural MultiAtend SoC)
    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 512;
    boardCanvas.height = 1024;
    const bCtx = boardCanvas.getContext('2d')!;
    bCtx.fillStyle = '#06130D';
    bCtx.fillRect(0, 0, 512, 1024);

    // Circuit traces & gold busses
    bCtx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
    bCtx.lineWidth = 2;
    for (let i = 0; i < 48; i++) {
      bCtx.beginPath();
      const sx = 30 + (i * 13) % 450;
      const sy = 100 + (i * 21) % 820;
      bCtx.moveTo(sx, sy);
      bCtx.lineTo(sx + 35, sy + 35);
      bCtx.lineTo(sx + 90, sy + 35);
      bCtx.stroke();
    }

    // Central Chip Package "MultiAtend A18 Neural Core"
    bCtx.fillStyle = '#0F1E17';
    bCtx.strokeStyle = '#34D399';
    bCtx.lineWidth = 3;
    bCtx.beginPath();
    bCtx.roundRect(146, 320, 220, 220, 16);
    bCtx.fill();
    bCtx.stroke();

    bCtx.fillStyle = '#34D399';
    bCtx.font = 'bold 24px monospace';
    bCtx.fillText('MULTIATEND', 178, 410);
    bCtx.font = '600 16px monospace';
    bCtx.fillText('NEURAL ENGINE · META API', 158, 442);
    bCtx.fillStyle = 'rgba(255,255,255,0.7)';
    bCtx.font = '13px monospace';
    bCtx.fillText('OCTA-CORE · 100K MSGS/S', 172, 470);

    const boardTexture = new THREE.CanvasTexture(boardCanvas);
    boardTexture.colorSpace = THREE.SRGBColorSpace;

    // 3. Battery Procedural Texture
    const batteryCanvas = document.createElement('canvas');
    batteryCanvas.width = 512;
    batteryCanvas.height = 1024;
    const batCtx = batteryCanvas.getContext('2d')!;
    batCtx.fillStyle = '#111513';
    batCtx.fillRect(0, 0, 512, 1024);
    batCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    batCtx.lineWidth = 3;
    batCtx.strokeRect(40, 200, 432, 620);
    batCtx.fillStyle = '#E5E7EB';
    batCtx.font = 'bold 22px monospace';
    batCtx.fillText('LITHIUM GRAPHENE CELL', 90, 280);
    batCtx.fillStyle = '#10B981';
    batCtx.font = '600 18px monospace';
    batCtx.fillText('5200 mAh · 120W HYPER CHARGE', 90, 316);
    batCtx.fillStyle = '#9CA3AF';
    batCtx.font = '14px monospace';
    batCtx.fillText('ISOLATED POWER BUS FOR HIGH CONCURRENCY CRM', 70, 350);

    const batteryTexture = new THREE.CanvasTexture(batteryCanvas);
    batteryTexture.colorSpace = THREE.SRGBColorSpace;

    // 4. MagSafe & Back Chassis Texture
    const magCanvas = document.createElement('canvas');
    magCanvas.width = 512;
    magCanvas.height = 1024;
    const magCtx = magCanvas.getContext('2d')!;
    magCtx.fillStyle = '#080F0B';
    magCtx.fillRect(0, 0, 512, 1024);
    magCtx.strokeStyle = 'rgba(52, 211, 153, 0.28)';
    magCtx.lineWidth = 4;
    magCtx.beginPath();
    magCtx.arc(256, 512, 120, 0, Math.PI * 2);
    magCtx.stroke();
    magCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    magCtx.strokeRect(236, 645, 40, 60);

    const magTexture = new THREE.CanvasTexture(magCanvas);
    magTexture.colorSpace = THREE.SRGBColorSpace;

    // GEOMETRIES FOR PHONE
    const phoneW = 2.45;
    const phoneH = 4.95;
    const phoneR = 0.32;
    const baseThick = 0.04;

    const createRoundedBoxGeo = (w: number, h: number, d: number, r: number) => {
      const shape = new THREE.Shape();
      const x = -w / 2;
      const y = -h / 2;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + h - r);
      shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      shape.lineTo(x + r, y + h);
      shape.quadraticCurveTo(x, y + h, x, y + h - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);

      return new THREE.ExtrudeGeometry(shape, {
        depth: d,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      });
    };

    // Shared Materials
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1a241f,
      roughness: 0.26,
      metalness: 0.94,
    });

    const goldPinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.18,
      metalness: 0.96,
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.28,
      metalness: 0.9,
    });

    // BUILD DISINTEGRATING LAYERS
    const layers: LayerSpec[] = [];

    // LAYER 1: BACK CHASSIS + TRIPLE CAMERA MODULE (-Z)
    const backGroup = new THREE.Group();
    const backGeo = createRoundedBoxGeo(phoneW, phoneH, baseThick, phoneR);
    const backMesh = new THREE.Mesh(
      backGeo,
      new THREE.MeshStandardMaterial({
        map: magTexture,
        roughness: 0.22,
        metalness: 0.9,
        color: 0x121c17,
      })
    );
    backMesh.position.z = -baseThick / 2;
    backGroup.add(backMesh);

    // Camera Bump Island (Top Left)
    const bumpGeo = createRoundedBoxGeo(1.0, 1.05, 0.08, 0.18);
    const bumpMesh = new THREE.Mesh(bumpGeo, titaniumMat);
    bumpMesh.position.set(-0.55, 1.7, 0.02);
    backGroup.add(bumpMesh);

    // 3 Sapphire Camera Lenses with gold rim rings
    const lensPositions = [
      { x: -0.75, y: 1.95 },
      { x: -0.75, y: 1.45 },
      { x: -0.35, y: 1.7 },
    ];
    lensPositions.forEach((pos) => {
      const ringGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24);
      ringGeo.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, goldPinMat);
      ringMesh.position.set(pos.x, pos.y, 0.08);
      backGroup.add(ringMesh);

      const glassGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.07, 24);
      glassGeo.rotateX(Math.PI / 2);
      const glassMesh = new THREE.Mesh(
        glassGeo,
        new THREE.MeshPhysicalMaterial({
          color: 0x030705,
          roughness: 0.05,
          metalness: 0.9,
          transmission: isSoftwareGl ? 0 : 0.85,
          opacity: 0.95,
          transparent: true,
        })
      );
      glassMesh.position.set(pos.x, pos.y, 0.09);
      backGroup.add(glassMesh);
    });

    rootGroup.add(backGroup);
    layers.push({
      id: 'chassis',
      name: 'Chassi em Titânio Escovado e Câmeras',
      tag: '01. Chassi Titânio',
      description: 'Estrutura aeroespacial com blindagem magnética e lentes de safira',
      group: backGroup,
      baseZ: -0.15,
      explodeZ: -2.3,
      explodeX: -0.4,
      explodeY: -0.2,
      explodeRotY: -0.14,
    });

    // LAYER 2: GRAPHENE BATTERY & VAPOR CHAMBER COOLING
    const batteryGroup = new THREE.Group();
    const batGeo = createRoundedBoxGeo(phoneW * 0.88, phoneH * 0.88, 0.03, phoneR * 0.8);
    const batMesh = new THREE.Mesh(
      batGeo,
      new THREE.MeshStandardMaterial({
        map: batteryTexture,
        roughness: 0.35,
        metalness: 0.65,
        color: 0x1f2923,
      })
    );
    batteryGroup.add(batMesh);

    // Copper heat pipes across battery
    const pipeGeo = new THREE.BoxGeometry(1.6, 0.08, 0.02);
    const pipeMesh = new THREE.Mesh(pipeGeo, copperMat);
    pipeMesh.position.set(0, 0.2, 0.03);
    batteryGroup.add(pipeMesh);

    rootGroup.add(batteryGroup);
    layers.push({
      id: 'battery',
      name: 'Módulo de Energia e Dissipador de Grafeno',
      tag: '02. Bateria 5200mAh',
      description: 'Célula de grafeno 5200 mAh e câmara de vapor para estabilidade contínua 24h',
      group: batteryGroup,
      baseZ: -0.06,
      explodeZ: -1.2,
      explodeX: -0.2,
      explodeY: 0.1,
      explodeRotY: -0.06,
    });

    // LAYER 3: MULTIATEND NEURAL LOGIC BOARD (The Brain of the CRM)
    const logicGroup = new THREE.Group();
    const boardGeo = createRoundedBoxGeo(phoneW * 0.92, phoneH * 0.92, 0.025, phoneR * 0.85);
    const boardMesh = new THREE.Mesh(
      boardGeo,
      new THREE.MeshStandardMaterial({
        map: boardTexture,
        roughness: 0.3,
        metalness: 0.7,
        color: 0x0d281a,
      })
    );
    logicGroup.add(boardMesh);

    // Glowing Central Neural Processor Chip
    const chipGeo = new THREE.BoxGeometry(0.85, 0.85, 0.04);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0x052e16,
      roughness: 0.15,
      metalness: 0.8,
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(0, 0.35, 0.03);
    logicGroup.add(chipMesh);

    // Glowing circuit halo around chip
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    chipGlowMatRef.current = haloMat;
    const haloGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0.35, 0.055);
    logicGroup.add(haloMesh);

    rootGroup.add(logicGroup);
    layers.push({
      id: 'neural-chip',
      name: 'Placa Lógica Neural MultiAtend (Engine Core)',
      tag: '03. Placa Neural SoC',
      description: 'Processador de automação omnichannel integrado à Cloud API Oficial Meta',
      group: logicGroup,
      baseZ: 0.0,
      explodeZ: 0.0,
      explodeX: 0.0,
      explodeY: 0.0,
      explodeRotY: 0.0,
    });

    // LAYER 4: OLED PROMOTION RETINA DISPLAY (+Z)
    const oledGroup = new THREE.Group();
    const oledGeo = createRoundedBoxGeo(phoneW * 0.96, phoneH * 0.96, 0.02, phoneR * 0.9);
    const oledMesh = new THREE.Mesh(
      oledGeo,
      new THREE.MeshStandardMaterial({
        map: screenTexture,
        roughness: 0.12,
        metalness: 0.1,
        color: 0xffffff,
      })
    );
    oledGroup.add(oledMesh);

    rootGroup.add(oledGroup);
    layers.push({
      id: 'oled',
      name: 'Display OLED Super Retina 120Hz',
      tag: '04. Display OLED',
      description: 'Painel antirreflexo de alto brilho com Dynamic Island e mensagens ativas',
      group: oledGroup,
      baseZ: 0.08,
      explodeZ: 1.3,
      explodeX: 0.25,
      explodeY: -0.1,
      explodeRotY: 0.08,
    });

    // LAYER 5: CERAMIC SHIELD FRONT GLASS (+Z)
    const glassGroup = new THREE.Group();
    const glassGeo = createRoundedBoxGeo(phoneW, phoneH, 0.025, phoneR);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xecfdf5,
      roughness: 0.04,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.94,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.95,
      ior: 1.52,
      thickness: 0.4,
      reflectivity: 0.9,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassGroup.add(glassMesh);

    // Bezel border & Speaker ear-piece notch
    const speakerGeo = new THREE.BoxGeometry(0.35, 0.025, 0.02);
    const speakerMesh = new THREE.Mesh(speakerGeo, titaniumMat);
    speakerMesh.position.set(0, 2.38, 0.02);
    glassGroup.add(speakerMesh);

    rootGroup.add(glassGroup);
    layers.push({
      id: 'glass',
      name: 'Vidro Ceramic Shield com Tratamento Óptico',
      tag: '05. Vidro Shield',
      description: 'Camada de proteção de cristal com alta resistência e clareza ultra nítida',
      group: glassGroup,
      baseZ: 0.16,
      explodeZ: 2.4,
      explodeX: 0.5,
      explodeY: 0.2,
      explodeRotY: 0.16,
    });

    // LAYER 6: HOLOGRAPHIC FLOATING CHAT & SLA CARDS (Detaching on explosion)
    const holoGroup = new THREE.Group();
    const createHoloCard = (
      text: string,
      accentColor: string,
      yPos: number,
      zOff: number,
      xOff: number
    ) => {
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 380;
      cardCanvas.height = 140;
      const cCtx = cardCanvas.getContext('2d')!;
      cCtx.fillStyle = 'rgba(11, 22, 17, 0.95)';
      cCtx.beginPath();
      cCtx.roundRect(0, 0, 380, 140, 22);
      cCtx.fill();
      cCtx.strokeStyle = accentColor;
      cCtx.lineWidth = 3;
      cCtx.stroke();

      cCtx.fillStyle = '#FFFFFF';
      cCtx.font = 'bold 22px system-ui, sans-serif';
      cCtx.fillText(text, 24, 52);
      cCtx.fillStyle = accentColor;
      cCtx.font = '600 16px monospace';
      cCtx.fillText('ROTEADO AUTOMATICAMENTE AO KANBAN', 24, 90);
      cCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      cCtx.font = '14px monospace';
      cCtx.fillText('SLA: 00:24 · FILA COMERCIAL', 24, 118);

      const cardTex = new THREE.CanvasTexture(cardCanvas);
      cardTex.colorSpace = THREE.SRGBColorSpace;

      const cardGeo = new THREE.PlaneGeometry(1.8, 0.68);
      const cardMat = new THREE.MeshBasicMaterial({
        map: cardTex,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.set(xOff, yPos, zOff);
      return cardMesh;
    };

    const card1 = createHoloCard('WhatsApp Oficial Conectado', '#34D399', 1.1, 0.2, -1.0);
    const card2 = createHoloCard('SLA Countdown Ativo (<30s)', '#C084FC', -1.2, 0.35, 1.0);
    holoGroup.add(card1);
    holoGroup.add(card2);

    rootGroup.add(holoGroup);
    layers.push({
      id: 'hologram',
      name: 'Cards Holográficos Flutuantes de Conversão',
      tag: '06. Cards Holográficos',
      description: 'Camada de dados em tempo real desprendida no espaço tridimensional',
      group: holoGroup,
      baseZ: 0.22,
      explodeZ: 3.5,
      explodeX: 0.0,
      explodeY: 0.0,
      explodeRotY: 0.0,
    });

    layersRef.current = layers;

    // PROCEDURAL PARTICLES BURSTING FROM NEURAL CHIP
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 1.5;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.065,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);
    particlesRef.current = particles;

    // Contact Shadow Plane beneath the phone
    const shadowGeo = new THREE.PlaneGeometry(3.6, 5.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -0.2, -1.8);
    rootGroup.add(shadowMesh);

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION & KINEMATICS RENDER LOOP
    let animId = 0;
    const clock = new THREE.Clock();

    const renderTick = () => {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle auto-rotation when user is not dragging
      if (autoRotate && !isDragging) {
        rotTarget.current.y += dt * 0.22;
      }

      // Smooth exponential damping on rotation
      rotCurrent.current.x = THREE.MathUtils.damp(
        rotCurrent.current.x,
        rotTarget.current.x,
        8.5,
        dt
      );
      rotCurrent.current.y = THREE.MathUtils.damp(
        rotCurrent.current.y,
        rotTarget.current.y,
        8.5,
        dt
      );

      // Smooth spring damping on explosion amount
      explodeCurrent.current = THREE.MathUtils.damp(
        explodeCurrent.current,
        explodeTarget.current,
        7.0,
        dt
      );

      const explodeVal = explodeCurrent.current;

      // Apply exploded transformation to each layer
      layersRef.current.forEach((layer) => {
        const curZ = THREE.MathUtils.lerp(layer.baseZ, layer.explodeZ, explodeVal);
        const curX = THREE.MathUtils.lerp(0, layer.explodeX, explodeVal);
        const curY = THREE.MathUtils.lerp(0, layer.explodeY, explodeVal);
        const curRotY = THREE.MathUtils.lerp(0, layer.explodeRotY, explodeVal);

        layer.group.position.set(curX, curY, curZ);
        layer.group.rotation.y = curRotY;

        // Visual emphasis when a specific layer is chosen
        const isTarget = selectedLayerId === 'all' || selectedLayerId === layer.id;
        layer.group.traverse((child) => {
          if ((child as THREE.Mesh).material) {
            const m = (child as THREE.Mesh).material as THREE.Material;
            m.opacity = isTarget ? 1.0 : Math.max(0.18, 1 - explodeVal * 0.7);
            m.transparent = true;
          }
        });
      });

      // Subtle organic breathing oscillation on the root group
      if (rootGroup) {
        rootGroup.rotation.x = rotCurrent.current.x + Math.sin(time * 0.8) * 0.02;
        rootGroup.rotation.y = rotCurrent.current.y;
      }

      // Animate Chip Glow
      if (chipGlowMatRef.current) {
        chipGlowMatRef.current.opacity = 0.35 + Math.sin(time * 3.2) * 0.25;
      }

      // Stream particles down toward the live Kanban
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes
          .position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] -= 0.012 + (i % 3) * 0.006;
          // Loop back to top near chip
          if (arr[i * 3 + 1] < -3.2) {
            arr[i * 3 + 1] = 2.2;
            arr[i * 3] = (Math.random() - 0.5) * 1.4;
            arr[i * 3 + 2] = (Math.random() - 0.5) * (0.4 + explodeVal * 1.5);
          }
        }
        posAttr.needsUpdate = true;
        (particlesRef.current.material as THREE.PointsMaterial).opacity =
          0.3 + explodeVal * 0.6;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderTick);
    };

    renderTick();

    // CLEANUP ON UNMOUNT
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [updateScreenCanvas, selectedLayerId, autoRotate, isDragging]);

  // Burst animation trigger
  useEffect(() => {
    if (triggerBurst > 0 && chipGlowMatRef.current) {
      chipGlowMatRef.current.opacity = 1.0;
      playTactileFeedback('expand');
    }
  }, [triggerBurst, playTactileFeedback]);

  // Interactive Mouse / Touch Drag to Rotate 3D Phone
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    mousePrev.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) {
      // Subtle cursor parallax
      if (mountRef.current && !autoRotate) {
        const rect = mountRef.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        rotTarget.current = {
          x: 0.16 + ny * 0.35,
          y: -0.35 + nx * 0.55,
        };
      }
      return;
    }
    const dx = e.clientX - mousePrev.current.x;
    const dy = e.clientY - mousePrev.current.y;
    mousePrev.current = { x: e.clientX, y: e.clientY };

    rotTarget.current = {
      x: Math.max(-0.6, Math.min(0.8, rotTarget.current.x + dy * 0.008)),
      y: rotTarget.current.y + dx * 0.008,
    };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    playTactileFeedback('click');
    rotTarget.current = { x: 0.16, y: -0.35 };
    setManualExplode(null);
    setSelectedLayerId('all');
  };

  const handleSelectLayer = (id: string) => {
    playTactileFeedback('click');
    setSelectedLayerId(id);
    const found = layersRef.current.find((l) => l.id === id);
    if (found && onLayerSelect) {
      onLayerSelect(found.name, found.description);
    }
  };

  const currentExplodeRate =
    manualExplode !== null ? manualExplode : scrollExplosion;

  return (
    <div
      className="relative w-full h-[540px] sm:h-[620px] select-none flex flex-col justify-between"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
    >
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Floating 3D Holographic Callout Annotation Markers (When exploded >= 35%) */}
      {currentExplodeRate > 0.35 && (
        <>
          {/* Callout 1: Ceramic Shield (Top Right) */}
          <div className="absolute top-14 right-2 sm:right-6 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
            <div className="px-3 py-1.5 rounded-xl bg-[#091410]/90 border border-emerald-400/40 backdrop-blur-md shadow-lg max-w-[170px]">
              <span className="text-[10px] font-mono text-emerald-300 block">Camada +Z</span>
              <span className="text-xs font-semibold text-white block">Ceramic Shield</span>
              <span className="text-[10px] text-neutral-400">Proteção óptica antirreflexo</span>
            </div>
          </div>

          {/* Callout 2: Neural Logic Board (Middle Left) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
            <div className="px-3 py-1.5 rounded-xl bg-[#091410]/90 border border-emerald-400/50 backdrop-blur-md shadow-lg max-w-[190px]">
              <span className="text-[10px] font-mono text-emerald-400 block">Engine Core</span>
              <span className="text-xs font-semibold text-white block">SoC Neural MultiAtend</span>
              <span className="text-[10px] text-neutral-400">Roteador Meta Cloud API</span>
            </div>
          </div>

          {/* Callout 3: Titanium Chassis (Bottom Right) */}
          <div className="absolute bottom-28 right-2 sm:right-6 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
            <div className="px-3 py-1.5 rounded-xl bg-[#091410]/90 border border-purple-400/40 backdrop-blur-md shadow-lg max-w-[170px]">
              <span className="text-[10px] font-mono text-purple-300 block">Camada -Z</span>
              <span className="text-xs font-semibold text-white block">Chassi em Titânio</span>
              <span className="text-[10px] text-neutral-400">Blindagem magnética MagSafe</span>
            </div>
          </div>
        </>
      )}

      {/* Top Floating Badge: Exploded Status & Controls */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-[#09110D]/85 border border-white/[0.1] backdrop-blur-md flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono text-neutral-200">
            {manualExplode !== null
              ? `Desintegração Manual: ${Math.round((manualExplode || 0) * 100)}%`
              : `Scrollytelling 3D: ${Math.round(scrollExplosion * 100)}%`}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label={soundEnabled ? 'Silenciar efeitos' : 'Ativar efeitos sonoros'}
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center justify-center text-neutral-300 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              autoRotate
                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                : 'bg-white/[0.06] text-neutral-400 border-white/[0.1] hover:text-white'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>{autoRotate ? 'Giro Ativo' : 'Giro Pausado'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-[10px] font-medium text-neutral-300 transition-colors cursor-pointer"
          >
            Resetar
          </button>
        </div>
      </div>

      {/* Ergonomic Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[94%] max-w-[490px] p-3 rounded-2xl bg-[#08100C]/90 border border-emerald-400/30 backdrop-blur-xl shadow-2xl space-y-2.5">
        {/* Layer Selector Chips */}
        <div className="flex items-center justify-between text-[11px] text-neutral-300">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Desconstrução em Camadas 3D</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            Arraste para girar em 360°
          </span>
        </div>

        {/* Interactive Exploded Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-neutral-400">Montado</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={manualExplode !== null ? manualExplode : scrollExplosion}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setManualExplode(val);
              playTactileFeedback('expand');
            }}
            aria-label="Controle de desintegração 3D"
            className="flex-1 accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <span className="text-[10px] font-mono text-emerald-400">Desintegrado</span>
        </div>

        {/* Layer Filter Buttons */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { id: 'all', label: 'Ver Todas' },
            { id: 'neural-chip', label: 'Placa Neural' },
            { id: 'oled', label: 'Display OLED' },
            { id: 'chassis', label: 'Chassi Titânio' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectLayer(item.id)}
              className={`py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer truncate ${
                selectedLayerId === item.id
                  ? 'bg-emerald-400 text-[#04120B] font-bold'
                  : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

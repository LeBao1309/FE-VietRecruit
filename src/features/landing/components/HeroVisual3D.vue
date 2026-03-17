<script setup lang="ts">
import { shallowRef, onMounted, onUnmounted } from "vue";
import { TresCanvas } from "@tresjs/core";
import * as THREE from "three";
import { Stars, OrbitControls, Levioso } from "@tresjs/cientos";

const gridRef = shallowRef<any>(null);
let animationId: number;

const getPixelRatio = () => {
  if (typeof window !== "undefined") {
    return Math.min(window.devicePixelRatio, 2);
  }
  return 1;
};
const pixelRatio = getPixelRatio();

const animate = () => {
  if (gridRef.value) {
    gridRef.value.rotation.y += 0.005;
    gridRef.value.rotation.x += 0.002;
  }
  animationId = requestAnimationFrame(animate);
};

onMounted(() => animate());
onUnmounted(() => cancelAnimationFrame(animationId));

// ==========================================================
// [Decision Log]: TOÁN HỌC VECTOR CHO LOGO 4F (NGHIÊNG & ĐỤC LỖ)
// ==========================================================

// 1. Dựng khối Outer chữ 4 (Vẽ ngược chiều kim đồng hồ - CCW)
const shape4 = new THREE.Shape();
shape4.moveTo(0.20, -0.80);  // Góc dưới phải
shape4.lineTo(0.40, 0.80);   // Góc trên phải
shape4.lineTo(-0.25, 0.80);  // Góc trên trái
shape4.lineTo(-0.85, -0.20); // Điểm ngoài cùng bên trái
shape4.lineTo(-0.80, -0.45); // Mặt cắt vát chéo
shape4.lineTo(-0.05, -0.45); // Góc gập ngang bên dưới
shape4.lineTo(-0.10, -0.80); // Góc dưới trái của chân
shape4.lineTo(0.20, -0.80);  // Đóng khối

// Đục lỗ cho chữ 4 (Vẽ thuận chiều kim đồng hồ - CW)
const hole4 = new THREE.Path();
hole4.moveTo(0.00, -0.20);   // Góc dưới phải của lỗ
hole4.lineTo(-0.50, -0.20);  // Góc dưới trái của lỗ
hole4.lineTo(-0.10, 0.55);   // Góc trên trái của lỗ
hole4.lineTo(0.15, 0.55);    // Góc trên phải của lỗ
hole4.lineTo(0.00, -0.20);   // Đóng lỗ
shape4.holes.push(hole4);    // Ép WebGL xuyên thủng Polygon

// 2. Dựng khối chữ F (Đồng bộ góc nghiêng với chữ 4)
const shapeF = new THREE.Shape();
shapeF.moveTo(0.00, -0.80);
shapeF.lineTo(0.10, -0.10);
shapeF.lineTo(0.45, -0.10);
shapeF.lineTo(0.50, 0.15);   // Mặt cắt vát của thanh giữa
shapeF.lineTo(0.13, 0.15);
shapeF.lineTo(0.18, 0.55);
shapeF.lineTo(0.65, 0.55);
shapeF.lineTo(0.70, 0.80);   // Mặt cắt vát của thanh trên
shapeF.lineTo(-0.10, 0.80);
shapeF.lineTo(-0.30, -0.80);
shapeF.lineTo(0.00, -0.80);  // Đóng khối

// 3. Cấu hình đùn khối (Tăng độ mượt mài)
const extrudeSettings = { 
  depth: 0.25, 
  bevelEnabled: true, 
  bevelSegments: 8,      // [Crucial]: Tăng mức độ chia lưới để bo mượt các góc nhọn
  bevelSize: 0.035,      // Độ vát viền
  bevelThickness: 0.035, 
  curveSegments: 12      // Khử răng cưa tối đa cho đường cong ngầm
};
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-2xl bg-transparent"
    style="height: 520px; background-color: transparent !important;"
    aria-hidden="true"
    role="presentation"
  >
    <TresCanvas
      :alpha="true"
      :antialias="true"
      :shadows="false"
      clear-color="#00000000"
      :device-pixel-ratio="pixelRatio"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    >
      <TresPerspectiveCamera
        :position="[0, 0, 10]"
        :fov="45"
        :near="0.1"
        :far="100"
      />

      <OrbitControls
        :auto-rotate="false"
        :enable-zoom="false"
        :enable-pan="false"
        :enable-damping="true"
        :damping-factor="0.05"
      />

      <TresAmbientLight :intensity="1.5" color="#FFFFFF" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="3.0" color="#FFFFFF" />
      <TresPointLight :position="[-2, -2, 2]" :intensity="1.2" color="#008C8C" />

      <Stars :radius="50" :depth="30" :count="1000" :factor="3" :saturation="0.3" :fade="true" :speed="0.3" />

      <Levioso :float-factor="1.2" :rotation-factor="0.0" :speed="2">
        <TresGroup :scale="1.5">
          
          <TresMesh :position="[-0.40, 0, 0]">
            <TresExtrudeGeometry :args="[shape4, extrudeSettings]" />
            <TresMeshStandardMaterial color="#008C8C" :roughness="0.25" :metalness="0.15" emissive="#008C8C" :emissive-intensity="0.7" />
          </TresMesh>

          <TresMesh :position="[0.35, 0, 0]">
            <TresExtrudeGeometry :args="[shapeF, extrudeSettings]" />
            <TresMeshStandardMaterial color="#008C8C" :roughness="0.25" :metalness="0.15" emissive="#008C8C" :emissive-intensity="0.7" />
          </TresMesh>

        </TresGroup>
      </Levioso>

      <TresMesh ref="gridRef" :scale="5" :renderOrder="1">
        <TresIcosahedronGeometry :args="[1, 1]" />
        <TresMeshBasicMaterial color="#008C8C" :wireframe="true" :transparent="true" :opacity="0.08" />
      </TresMesh>
    </TresCanvas>

    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 70% 70% at 50% 50%,
          rgba(0, 140, 140, 0.08) 0%,
          transparent 70%
        );
      "
    />
  </div>
</template>
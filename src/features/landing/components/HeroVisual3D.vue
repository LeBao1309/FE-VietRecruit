<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import {
  Stars,
  OrbitControls,
  MeshWobbleMaterial,
  Levioso,
} from "@tresjs/cientos";
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-2xl"
    style="height: 520px"
    aria-hidden="true"
    role="presentation"
  >
    <TresCanvas
      :alpha="true"
      :antialias="true"
      :shadows="false"
      clear-color="#00000000"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    >
      <TresPerspectiveCamera
        :position="[0, 0, 5]"
        :fov="45"
        :near="0.1"
        :far="100"
      />

      <OrbitControls
        :auto-rotate="true"
        :auto-rotate-speed="0.5"
        :enable-zoom="false"
        :enable-pan="false"
        :enable-damping="true"
        :damping-factor="0.05"
      />

      <TresAmbientLight :intensity="0.8" color="#FFFFFF" />
      <TresDirectionalLight
        :position="[5, 8, 5]"
        :intensity="0.8"
        color="#FFFFFF"
      />
      <TresPointLight
        :position="[-2, -2, 2]"
        :intensity="0.4"
        color="#009898"
      />

      <Stars
        :radius="50"
        :depth="30"
        :count="1000"
        :factor="3"
        :saturation="0.3"
        :fade="true"
        :speed="0.3"
      />

      <Levioso :float-factor="1.5" :rotation-factor="0.4" :speed="2">
        <TresMesh>
          <TresTorusKnotGeometry :args="[1, 0.3, 200, 32]" />
          <MeshWobbleMaterial
            color="#009898"
            :factor="0.3"
            :speed="1.5"
            :roughness="0.2"
            :metalness="0.6"
          />
        </TresMesh>
      </Levioso>

      <TresMesh :scale="2.5">
        <TresIcosahedronGeometry :args="[1, 1]" />
        <TresMeshBasicMaterial
          color="#009898"
          :wireframe="true"
          :transparent="true"
          :opacity="0.04"
        />
      </TresMesh>
    </TresCanvas>

    <!-- CSS glow overlay for light theme -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 70% 70% at 50% 50%,
          rgba(0, 152, 152, 0.04) 0%,
          transparent 70%
        );
      "
    />
  </div>
</template>

<template>
  <div class="page-heading">
    <div>
      <div class="text-overline text-primary">{{ eyebrow }}</div>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <slot />
    <div v-if="$slots.topAction" class="page-heading__top-action">
      <slot name="topAction" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; subtitle?: string }>();
</script>

<template>
  <q-card flat bordered class="countdown-card">
    <q-card-section>
      <q-icon :name="icon" size="30px" color="primary" />
      <div class="supporting-text q-mt-md">{{ label }}</div>
      <div class="text-h5 text-weight-bold q-mt-xs">{{ value }}</div>
      <div class="supporting-text q-mt-xs">{{ time }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{ icon: string; label: string; value: string; time: string }>();
</script>

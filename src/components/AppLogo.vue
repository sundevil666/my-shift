<template>
  <svg
    class="app-logo"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="56" height="56" rx="16" class="app-logo__tile" />
    <circle cx="32" cy="32" r="18" class="app-logo__dial" />
    <path d="M32 21V32L40 37" class="app-logo__hands" />
    <circle cx="32" cy="32" r="2.5" class="app-logo__pin" />
    <path d="M32 16V19M48 32H45M32 48V45M16 32H19" class="app-logo__ticks" />
  </svg>
</template>

<style scoped>
.app-logo {
  display: block;
  width: 30px;
  height: 30px;
}

.app-logo__tile {
  fill: var(--shift-accent, #176b87);
}

.app-logo__dial {
  fill: none;
  stroke: var(--shift-accent-text, white);
  stroke-width: 3;
}

.app-logo__hands,
.app-logo__ticks {
  stroke: var(--shift-accent-text, white);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.app-logo__hands {
  stroke-width: 3.5;
}

.app-logo__ticks {
  stroke-width: 2;
}

.app-logo__pin {
  fill: var(--shift-accent-text, white);
}
</style>

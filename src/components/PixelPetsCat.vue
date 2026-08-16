<template>
  <div class="pixel-pet" :class="`pixel-pet--${state}`">
    <canvas ref="canvas" width="180" height="150" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

type CatState = 'sleep' | 'leave' | 'work';
const props = defineProps<{ state: CatState }>();
const canvas = ref<HTMLCanvasElement>();
let frame = 0;

const coat = '#e8943c';
const mark = '#b5641d';
const outline = '#5a3514';
const cream = '#f7f1e6';

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, rotation = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  if (color === coat) {
    const fur = ctx.createRadialGradient(-rx * .3, -ry * .45, 1, 0, 0, Math.max(rx, ry));
    fur.addColorStop(0, '#ffc16f'); fur.addColorStop(.52, coat); fur.addColorStop(1, '#d87927');
    ctx.fillStyle = fur;
  } else ctx.fillStyle = color;
  ctx.shadowColor = 'rgb(50 31 16 / 16%)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 2.2; ctx.strokeStyle = outline; ctx.stroke(); ctx.restore();
}

function ear(ctx: CanvasRenderingContext2D, x: number, y: number, flip = 1) {
  ctx.beginPath(); ctx.moveTo(x, y + 15); ctx.quadraticCurveTo(x + 5 * flip, y + 2, x + 9 * flip, y - 5);
  ctx.quadraticCurveTo(x + 15 * flip, y + 5, x + 18 * flip, y + 16); ctx.closePath();
  ctx.fillStyle = coat; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = outline; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 5 * flip, y + 12); ctx.quadraticCurveTo(x + 9 * flip, y + 4, x + 12 * flip, y + 12);
  ctx.strokeStyle = '#efaa91'; ctx.lineWidth = 3; ctx.stroke();
}

function face(ctx: CanvasRenderingContext2D, x: number, y: number, sleepy: boolean, blink: boolean) {
  ear(ctx, x - 26, y - 24, 1); ear(ctx, x + 26, y - 24, -1);
  ellipse(ctx, x, y, 35, 28, coat);
  ctx.strokeStyle = mark; ctx.lineWidth = 2.4;
  for (const dx of [-10, 0, 10]) { ctx.beginPath(); ctx.moveTo(x + dx, y - 25); ctx.lineTo(x + dx * .7, y - 15); ctx.stroke(); }
  ctx.strokeStyle = outline; ctx.lineCap = 'round'; ctx.lineWidth = 2.2;
  for (const dx of [-13, 13]) {
    ctx.beginPath();
    if (sleepy || blink) ctx.arc(x + dx, y - 2, 7, .15 * Math.PI, .85 * Math.PI);
    else { ctx.ellipse(x + dx, y - 2, 7, 9, 0, 0, Math.PI * 2); ctx.fillStyle = '#f8fff2'; ctx.fill(); }
    ctx.stroke();
    if (!sleepy && !blink) {
      ctx.beginPath(); ctx.arc(x + dx, y - 1, 4, 0, Math.PI * 2); ctx.fillStyle = '#79ad4f'; ctx.fill();
      ctx.beginPath(); ctx.arc(x + dx, y - 1, 2.2, 0, Math.PI * 2); ctx.fillStyle = '#202126'; ctx.fill();
      ctx.beginPath(); ctx.arc(x + dx + 1.3, y - 3, .9, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }
  }
  ellipse(ctx, x, y + 11, 13, 8, cream);
  ctx.beginPath(); ctx.moveTo(x - 4, y + 7); ctx.lineTo(x + 4, y + 7); ctx.lineTo(x, y + 12); ctx.closePath(); ctx.fillStyle = '#e0888f'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + 12, 7, .18 * Math.PI, .82 * Math.PI); ctx.strokeStyle = outline; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = outline; ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + side * 10, y + 12 + i * 3); ctx.lineTo(x + side * 34, y + 10 + i * 5); ctx.stroke(); }
}

function drawSleep(ctx: CanvasRenderingContext2D, t: number) {
  const breathe = Math.sin(t / 700) * 2;
  ellipse(ctx, 88, 107, 65, 16, '#fff');
  ellipse(ctx, 90, 91, 57 + breathe, 28 + breathe * .4, coat, -.08);
  face(ctx, 54, 76, true, false);
  ctx.strokeStyle = mark; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(111, 87, 25, -.5, 2.4); ctx.stroke();
  const p = (t % 2400) / 2400;
  ctx.globalAlpha = Math.sin(Math.PI * p); ctx.fillStyle = '#3976a8'; ctx.font = `bold ${16 + p * 15}px sans-serif`;
  ctx.fillText('Z', 66 + p * 45, 53 - p * 40); ctx.globalAlpha = 1;
}

function drawLeave(ctx: CanvasRenderingContext2D, t: number) {
  const phase = t / 190; const bob = Math.abs(Math.sin(phase * 2)) * 2.5;
  ellipse(ctx, 89, 121, 63, 12, '#fff');
  ctx.save(); ctx.translate(0, -bob);
  const drawLeg = (hipX: number, offset: number, far: boolean) => {
    const stride = Math.sin(phase + offset);
    const footX = hipX + stride * 7;
    const lift = Math.max(0, Math.cos(phase + offset)) * 4;
    const kneeX = hipX - stride * 2.5;
    const kneeY = 103 - lift * .25;
    const footY = 117 - lift;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(hipX, 91); ctx.quadraticCurveTo(kneeX, kneeY, footX, footY);
    ctx.strokeStyle = outline; ctx.lineWidth = 10; ctx.stroke();
    ctx.strokeStyle = far ? '#cc7128' : coat; ctx.lineWidth = 6.5; ctx.stroke();
    ellipse(ctx, footX + 2, footY, 7.5, 4.2, far ? '#dc8435' : cream, stride * .035);
  };

  // Дальние лапы двигаются позади корпуса.
  drawLeg(69, Math.PI, true);
  drawLeg(108, 0, true);
  ellipse(ctx, 88, 83, 46, 29, coat, -.04);
  ctx.strokeStyle = mark; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(48, 76, 24, 2.8, 5.15); ctx.stroke();
  // Ближние лапы перекрывают корпус и образуют диагональную пару с дальними.
  drawLeg(59, 0, false);
  drawLeg(118, Math.PI, false);
  face(ctx, 119, 66, false, (t % 3200) < 130);
  ctx.restore();
}

function drawWork(ctx: CanvasRenderingContext2D, t: number) {
  const bob = Math.sin(t / 400) * 2; ellipse(ctx, 90, 121, 63, 12, '#fff');
  ellipse(ctx, 90, 89 + bob, 45, 34, coat); face(ctx, 90, 62 + bob, false, (t % 2900) < 140);
  const phase = Math.sin(t / 170); const left = phase > 0 ? 7 : 0; const right = phase < 0 ? 7 : 0;
  ellipse(ctx, 68, 101 - left, 12, 16, cream, -.25); ellipse(ctx, 112, 101 - right, 12, 16, cream, .25);
  const ballX = 90 + Math.sin(t / 520) * 22; ellipse(ctx, ballX, 112, 11, 11, '#67b7c7');
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ballX, 112, 6, 0, Math.PI * 1.4); ctx.stroke();
}

function draw(now: number) {
  const ctx = canvas.value?.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, 180, 150); ctx.imageSmoothingEnabled = true;
  if (props.state === 'sleep') drawSleep(ctx, now); else if (props.state === 'leave') drawLeave(ctx, now); else drawWork(ctx, now);
  frame = requestAnimationFrame(draw);
}

onMounted(() => { frame = requestAnimationFrame(draw); });
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.pixel-pet { display: grid; place-items: center; min-height: 170px; border-radius: 16px; background: rgb(103 183 199 / 8%); }
.pixel-pet canvas { display: block; width: 180px; height: 150px; max-width: 100%; }
@media (prefers-reduced-motion: reduce) { .pixel-pet canvas { opacity: .99; } }
</style>

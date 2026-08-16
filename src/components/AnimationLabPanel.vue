<template>
  <div class="animation-lab">
    <q-card flat bordered class="animation-lab__card">
      <q-card-section>
        <div class="section-title">Текущие четыре кота</div>
        <p class="supporting-text animation-lab__intro">
          Все варианты, которые сейчас сравниваем в шапке. Ничего отсюда не удаляется.
        </p>
      </q-card-section>
      <q-card-section class="animation-lab__current">
        <HeaderActivityIcon activity="work" />
        <div class="animation-lab__labels">
          <div v-for="item in currentCats" :key="item.title" class="animation-lab__label">
            <strong>{{ item.title }}</strong>
            <span>{{ item.description }}</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="animation-lab__card">
      <q-card-section>
        <div class="section-title">Один настраиваемый кот · PixelPets</div>
        <p class="supporting-text animation-lab__intro">
          Один цвет и одна модель. Меняется только поза и движение — все три состояния работают одновременно.
        </p>
      </q-card-section>
      <q-card-section class="animation-lab__pixelpets">
        <div v-for="item in pixelPetsStates" :key="item.state" class="animation-lab__state">
          <PixelPetsCat :state="item.state" />
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </div>
      </q-card-section>
      <q-card-section class="animation-lab__license">
        Бесплатный открытый проект · MIT · <a href="https://github.com/JOhnsonKC201/pixelpets" target="_blank" rel="noreferrer">исходник PixelPets</a>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import HeaderActivityIcon from 'components/HeaderActivityIcon.vue';
import PixelPetsCat from 'components/PixelPetsCat.vue';

const currentCats = [
  { title: '1. Сон', description: 'Спит на коврике, поднимается Z.' },
  { title: '2. Выход', description: 'Идёт на работу.' },
  { title: '3. Игра', description: 'Лежит, моргает и катает мяч.' },
  { title: '4. Эксперимент', description: 'Идущий кот с отдельным мячом.' },
];

const pixelPetsStates = [
  { state: 'sleep' as const, title: 'Сон', description: 'Лежит, дышит; Z выходит от головы.' },
  { state: 'leave' as const, title: 'Выход', description: 'Действительно переставляет четыре лапы.' },
  { state: 'work' as const, title: 'Работа', description: 'Сидит и поочерёдно толкает мяч лапами.' },
];
</script>

<style scoped>
.animation-lab {
  display: grid;
  grid-template-columns: minmax(0, 760px);
  justify-content: center;
  gap: 16px;
}

.animation-lab__card {
  min-width: 0;
}

.animation-lab__intro {
  margin: 6px 0 0;
}

.animation-lab__current {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding-top: 4px;
}

.animation-lab__pixelpets {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding-top: 4px;
}

.animation-lab__state { display: grid; gap: 4px; text-align: center; min-width: 0; }
.animation-lab__state span { color: var(--muted-text); font-size: .82rem; line-height: 1.3; }
.animation-lab__license { padding-top: 0; color: var(--muted-text); font-size: .78rem; text-align: center; }
.animation-lab__license a { color: inherit; }

.animation-lab__labels {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.animation-lab__label {
  display: grid;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgb(103 183 199 / 10%);
}

.animation-lab__label span {
  color: var(--muted-text);
  font-size: 0.82rem;
}

@media (max-width: 900px) {
  .animation-lab { grid-template-columns: 1fr; }
}

@media (max-width: 599px) {
  .animation-lab__labels { grid-template-columns: 1fr; }
  .animation-lab__pixelpets { grid-template-columns: 1fr; }
}
</style>

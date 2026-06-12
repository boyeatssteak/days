<script setup lang="ts">
import { ref, computed } from 'vue'
import { differenceInCalendarDays } from 'date-fns'
import DayCell from './DayCell.vue'
import { useGrid } from '../composables/useGrid'
import { useScroll } from '../composables/useScroll'
import { usePattern } from '../composables/usePattern'
import { useLabels } from '../composables/useLabels'

const scrollContainer = ref<HTMLElement | null>(null)

const {
  daysPerRow,
  indexingDay,
  featuredDay,
  dayWidth,
  ROW_HEIGHT,
  visibleRows,
  totalRows,
  firstRowDate,
  prependRows,
  appendRows,
} = useGrid()

const { pattern } = usePattern()

const { leftSections, rightSections } = useLabels(visibleRows, daysPerRow, pattern)

const patternLabels = computed(() =>
  rightSections.value.filter(s => s.type === 'pattern')
)
const subpatternLabels = computed(() =>
  rightSections.value.filter(s => s.type === 'subpattern')
)
const patternBoxes = computed(() => patternLabels.value)
const subpatternBoxes = computed(() => subpatternLabels.value)

const todayRow = computed(() => {
  if (!visibleRows.value.length) return 0
  const today = new Date()
  const diff = differenceInCalendarDays(today, firstRowDate.value)
  return Math.floor(diff / daysPerRow.value)
})

const featuredRow = computed(() => {
  if (!visibleRows.value.length || !featuredDay.value) return 0
  const diff = differenceInCalendarDays(featuredDay.value, firstRowDate.value)
  return Math.floor(diff / daysPerRow.value)
})

function scrollToRow(row: number) {
  const el = scrollContainer.value
  if (!el) return
  const target = row * ROW_HEIGHT - el.clientHeight / 2 + ROW_HEIGHT / 2
  el.scrollTop = Math.max(0, target)
}

useScroll(scrollContainer, prependRows, appendRows, todayRow.value, ROW_HEIGHT)
</script>

<template>
  <button
    class="fixed top-2 left-2 z-50 text-xl cursor-pointer select-none"
    @click="scrollToRow(featuredRow)"
  >
    🏠
  </button>
  <div
    ref="scrollContainer"
    class="h-screen overflow-y-auto bg-[#242424]"
  >
    <div class="flex justify-center">
      <div class="flex">
        <!-- Year labels -->
        <div
          class="relative shrink-0"
          :style="{ width: '4.5rem', height: totalRows * ROW_HEIGHT + 'px' }"
        >
          <div
            v-for="(s, i) in leftSections.filter(s => s.type === 'year')"
            :key="'y-' + i"
            class="absolute left-0 right-0"
            :style="{
              top: s.startRow * ROW_HEIGHT + 'px',
              height: s.rowCount * ROW_HEIGHT + 'px',
            }"
          >
            <div
              class="sticky px-2 py-2 font-medium text-zinc-300"
              :style="{
                top: s.topOffset,
                zIndex: s.zIndex,
              }"
            >
              <span class="block overflow-hidden text-ellipsis whitespace-nowrap">{{ s.text }}</span>
            </div>
          </div>
        </div>

        <!-- Month labels -->
        <div
          class="relative shrink-0"
          :style="{ width: '3.5rem', height: totalRows * ROW_HEIGHT + 'px' }"
        >
          <div
            v-for="(s, i) in leftSections.filter(s => s.type === 'month')"
            :key="'m-' + i"
            class="absolute left-0 right-0"
            :style="{
              top: s.startRow * ROW_HEIGHT + 'px',
              height: s.rowCount * ROW_HEIGHT + 'px',
            }"
          >
            <div
              class="sticky px-2 py-2 font-medium text-zinc-500"
              :style="{
                top: s.topOffset,
                zIndex: s.zIndex,
              }"
            >
              <span class="block overflow-hidden text-ellipsis whitespace-nowrap">{{ s.text }}</span>
            </div>
          </div>
        </div>

        <!-- Grid + right labels (boxes cover these only) -->
        <div class="relative">
          <!-- Subpattern boxes (dashed) -->
          <div
            v-for="box in subpatternBoxes"
            :key="'sbox-' + box.startRow"
            class="absolute left-0 right-0 border border-dashed border-zinc-700 rounded-lg pointer-events-none"
            :style="{
              top: box.startRow * ROW_HEIGHT + 'px',
              height: box.rowCount * ROW_HEIGHT + 'px',
            }"
          />
          <!-- Pattern boxes (solid) -->
          <div
            v-for="box in patternBoxes"
            :key="'pbox-' + box.startRow"
            class="absolute left-0 right-0 border border-zinc-700 rounded-lg pointer-events-none"
            :style="{
              top: box.startRow * ROW_HEIGHT + 'px',
              height: box.rowCount * ROW_HEIGHT + 'px',
            }"
          />

          <div class="flex">
            <!-- Grid -->
            <div class="flex flex-col">
              <div
                v-for="(row, ri) in visibleRows"
                :key="ri"
                class="flex"
                :style="{ height: ROW_HEIGHT + 'px' }"
              >
                <DayCell
                  v-for="(day, ci) in row.days"
                  :key="ci"
                  :day="day"
                  :featured-day="featuredDay"
                  :day-width="dayWidth"
                />
              </div>
            </div>

            <!-- Subpattern labels (closer to grid) -->
            <div
              v-if="subpatternLabels.length"
              class="relative shrink-0"
              :style="{ width: '5rem', height: totalRows * ROW_HEIGHT + 'px' }"
            >
              <div
                v-for="(s, i) in subpatternLabels"
                :key="'sp-' + i"
                class="absolute left-0 right-0"
                :style="{
                  top: s.startRow * ROW_HEIGHT + 'px',
                  height: s.rowCount * ROW_HEIGHT + 'px',
                }"
              >
                <div
                  class="sticky px-2 py-2 font-medium text-zinc-500"
                  :style="{
                    top: s.topOffset,
                    zIndex: s.zIndex,
                  }"
                >
                  <span class="block overflow-hidden text-ellipsis whitespace-nowrap">{{ s.text }}</span>
                </div>
              </div>
            </div>

            <!-- Pattern labels (further right) -->
            <div
              v-if="patternLabels.length"
              class="relative shrink-0"
              :style="{ width: '5rem', height: totalRows * ROW_HEIGHT + 'px' }"
            >
              <div
                v-for="(s, i) in patternLabels"
                :key="'p-' + i"
                class="absolute left-0 right-0"
                :style="{
                  top: s.startRow * ROW_HEIGHT + 'px',
                  height: s.rowCount * ROW_HEIGHT + 'px',
                }"
              >
                <div
                  class="sticky px-2 py-2 font-medium text-zinc-300"
                  :style="{
                    top: s.topOffset,
                    zIndex: s.zIndex,
                  }"
                >
                  <span class="block overflow-hidden text-ellipsis whitespace-nowrap">{{ s.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

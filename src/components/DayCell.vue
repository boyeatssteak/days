<script setup lang="ts">
import { getDate, getDay, isSameDay } from 'date-fns'
import { computed } from 'vue'

const props = defineProps<{
  day: Date
  featuredDay: Date | null
  dayWidth: number
}>()

const dayNumber = computed(() => getDate(props.day))

const isWeekend = computed(() => {
  const d = getDay(props.day)
  return d === 0 || d === 6
})

const isFeatured = computed(() => props.featuredDay && isSameDay(props.day, props.featuredDay))
</script>

<template>
  <span
    class="shrink-0 text-center py-2 select-none"
    :class="{
      'border-2 rounded-lg font-bold bg-zinc-900': isFeatured,
      'text-zinc-600 font-light': isWeekend && !isFeatured,
    }"
    :style="{ width: dayWidth + 'ch' }"
  >
    {{ dayNumber }}
  </span>
</template>

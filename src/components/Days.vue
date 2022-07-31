<template>
    <div>
        <h1>oh hai</h1>
        <div class="grid grid-cols-7 gap-4">
            <span
                v-for="day in visibleDays"
                :class="{ 'font-bold': isToday(day) }">
                {{ getDate(day) }}
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
    add,
    eachDayOfInterval,
    getDate,
    getDay,
    isToday,
    sub,
} from 'date-fns'

export default defineComponent({
    name: `Days`,
    data() {
        return {
            // visibleStart: `20220701`,
            // visibleEnd: `20220930`,
            // centerDate: `20220715`,
            // daysPerRow: 7,
            getDate,
            isToday,
            today: new Date(),
        }
    },
    computed: {
        visibleDays(): Date[] {
            // return [...Array(60).keys()]
            return eachDayOfInterval({
                start: this.visibleStart,
                end: this.visibleEnd,
            })
        },
        visibleStart(): Date {
            return sub(this.today, { days: getDay(this.today), weeks: 3 })
        },
        visibleEnd(): Date {
            return add(this.today, { days: 6 - getDay(this.today), weeks: 9 })
        },
    }
})
</script>

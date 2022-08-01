<template>
    <div>
        <h1>oh hai</h1>
        <div class="grid grid-cols-7">
            <span
                v-for="(day, index) in visibleDays"
                :class="dayClasses(index, day)">
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

interface Generic<T = any> {
    [key: string]: T
}

export default defineComponent({
    name: `Days`,
    data() {
        return {
            // visibleStart: `20220701`,
            // visibleEnd: `20220930`,
            // centerDate: `20220715`,
            daysPerRow: 7,
            getDate,
            isToday,
            today: new Date(),
        }
    },
    computed: {
        visibleDays(): Date[] {
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
    },
    methods: {
        dayClasses(index: number, day: Date): Generic {
            const isFirstInRow = index % this.daysPerRow == 0
            const today = isToday(day)
            const isFirstOfMonth = getDate(day) === 1
            const isFirstRow = getDate(day) <= this.daysPerRow

            return {
                'border-t': today || isFirstRow,
                'border-r': today,
                'border-b': today,
                'border-l': today || (isFirstOfMonth && !isFirstInRow),
                'p-4': true,
            }
        },
    },
})
</script>

<template>
    <div>
        <h1>oh hai</h1>
        <div
            :style="gridStyles"
            class="grid">
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
    differenceInCalendarDays,
    eachDayOfInterval,
    getDate,
    getDay,
    isSameDay,
    lastDayOfMonth,
    setDate,
    sub,
} from 'date-fns'

interface Generic<T = any> {
    [key: string]: T
}

export default defineComponent({
    name: `Days`,
    data() {
        return {
            anchorDate: new Date(1980, 9, 20),
            daysPerRow: 7,
            getDate,
        }
    },
    computed: {
        gridStyles(): Generic {
            return {
                gridTemplateColumns: `repeat(${this.daysPerRow}, minmax(0, 1fr))`,
            }
        },
        visibleDays(): Date[] {
            return eachDayOfInterval({
                start: this.visibleStart,
                end: this.visibleEnd,
            })
        },
        visibleStart(): Date {
            return sub(this.anchorDate, { days: getDay(this.anchorDate), weeks: 3 })
        },
        visibleEnd(): Date {
            return add(this.anchorDate, { days: 6 - getDay(this.anchorDate), weeks: 9 })
        },
    },
    methods: {
        dayClasses(index: number, day: Date): Generic {
            const isFirstInRow = index % this.daysPerRow == 0
            const isAnchorDate = isSameDay(this.anchorDate, day)
            const isFirstOfMonth = getDate(day) === 1
            const isInFirstRow = getDate(day) < getDate(this.lastDayInFirstRow(index, day))
            const isInLastRow = getDate(this.firstDayInLastRow(index, day)) <= getDate(day)

            return {
                'border-4': isAnchorDate,
                'border-t': !isAnchorDate && isInFirstRow,
                'border-b': !isAnchorDate && isInLastRow,
                'border-l': !isAnchorDate && isFirstOfMonth && !isFirstInRow,
                'px-4': true,
                'py-3': true,
            }
        },
        firstDayInLastRow(index: number, day: Date): Date {
            const lastDayOfThisMonth = lastDayOfMonth(day)
            const diffDays = differenceInCalendarDays(lastDayOfThisMonth, this.visibleStart)
            const offset = differenceInCalendarDays(lastDayOfThisMonth, this.visibleStart) % this.daysPerRow

            return sub(lastDayOfThisMonth, { days: offset })
        },
        lastDayInFirstRow(index: number, day: Date): Date {
            const firstDayOfThisMonth = setDate(day, 1)
            const offset = index % this.daysPerRow

            return add(firstDayOfThisMonth, { days: offset })
        }
    },
})
</script>

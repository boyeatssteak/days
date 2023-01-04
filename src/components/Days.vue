<template>
    <div id="container" class="max-w-md mx-auto px-2">
        <button @click="addRowsToStart">moar</button>

        <Group v-for="outer in eachYearOfInterval(interval)">
            <template #label>
                {{ getYear(outer) }}
            </template>

            <div class="grow">
                <Group v-for="inner in monthsByYear(outer)">
                    <template #label>
                        {{ renderMonth(getMonth(inner)) }}
                    </template>

                    <div
                        :style="gridStyles"
                        class="grid grow">
                        <span
                            v-for="day in daysByMonth(inner)"
                            :class="getStylesForDay(day)">
                            {{ isDate(day) ? getDate(day) : `` }}
                        </span>
                    </div>
                </Group>
            </div>
        </Group>

        <button @click="addRowsToEnd">moar</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
    add,
    differenceInCalendarDays,
    eachDayOfInterval,
    eachMonthOfInterval,
    eachYearOfInterval,
    getDate,
    getDay,
    getMonth,
    getYear,
    isDate,
    isSameDay,
    lastDayOfMonth,
    max,
    min,
    parse,
    setDate,
    setMonth,
    sub,
} from 'date-fns'
import { includes } from 'lodash'
import Group from './Group.vue'

interface Generic<T = any> {
    [key: string]: T
}

export default defineComponent({
    name: `Days`,
    components: {
        Group,
    },
    data(): Generic {
        return {
            anchorDate: null,
            daysPerRow: null,
            eachMonthOfInterval,
            eachYearOfInterval,
            endDate: null,
            getDate,
            getMonth,
            getYear,
            isDate,
            isSameDay,
            startDate: null,
        }
    },
    // created () {
    //     window.addEventListener('scroll', this.handleScroll);
    // },
    beforeMount () {
        const params = new Proxy(
            new URLSearchParams(window.location.search) as Generic,
            {
                get: (searchParams, prop: string) => searchParams.get(prop),
            }
        );

        this.daysPerRow = params.daysPerRow ? parseInt(params.daysPerRow) : 7
        this.anchorDate = params.anchorDate ? this.parseDate(params.anchorDate) : new Date()
        this.endDate = params.endDate
            ? this.parseDate(params?.endDate)
            : add(this.anchorDate, { days: 9 * this.daysPerRow})
        this.startDate = params.startDate
            ? this.parseDate(params?.startDate)
            : sub(this.anchorDate, { days: 3 * this.daysPerRow })
    },
    computed: {
        gridStyles(): Generic {
            return {
                gridTemplateColumns: `repeat(${this.daysPerRow}, minmax(0, 1fr))`,
            }
        },
        interval(): Interval {
            return {
                start: this.visibleStart,
                end: this.visibleEnd,
            }
        },
        rowIndexingDay(): Date {
            if (this.daysPerRow !== 7) {
                // when we're not viewing rows as weeks, lets just make column 1 the day they chose
                return this.startDate
            }

            return sub(this.startDate, { days: getDay(this.startDate) })
        },
        visibleDays(): Date[] {
            return eachDayOfInterval({
                start: this.visibleStart,
                end: this.visibleEnd,
            })
        },
        visibleStart(): Date {
            const firstOfMonth = setDate(this.startDate, 1)

            return max([this.rowIndexingDay, firstOfMonth])
        },
        visibleEnd(): Date {
            const offset = this.daysPerRow === 7
                ? 6 - getDay(this.endDate)
                : this.daysPerRow - 1 - differenceInCalendarDays(this.endDate, this.visibleStart) % this.daysPerRow

            const rowEnd = add(this.endDate, { days: offset })

            return min([rowEnd, lastDayOfMonth(this.endDate)])
        },
    },
    methods: {
        addRowsToEnd(): void {
            this.endDate = add(this.endDate, { days: 4 * this.daysPerRow })

            this.$nextTick(() => {
                window.scrollTo(0, document.body.scrollHeight)
            })
        },
        addRowsToStart(): void {
            this.startDate = sub(this.startDate, { days: 4 * this.daysPerRow })
        },
        getStylesForDay(day: Date): string[] {
            const classes = [`py-2`]

            switch (true) {
                case isSameDay(day, this.anchorDate):
                    classes.push(`border-2`, `rounded-lg`, `font-bold`, `bg-zinc-900`)
                    break
                case includes([0, 6], getDay(day)):
                    classes.push(`text-zinc-400`, `font-light`)
                    break
            }

            return classes
        },
        daysByMonth(month: Date): Date[] {
            const firstDayOfGroup = max([this.visibleStart, month])
            const lastDayOfGroup = min([this.visibleEnd, lastDayOfMonth(month)])

            const offset = Array(
                differenceInCalendarDays(firstDayOfGroup, this.rowIndexingDay) % this.daysPerRow
            )

            return [
                ...offset,
                ...eachDayOfInterval({
                    start: firstDayOfGroup,
                    end: lastDayOfGroup,
                }),
            ]
        },
        handleScroll(event: any): void {
            console.log(event)
        },
        lastDayInFirstRow(index: number, day: Date): Date {
            const firstDayOfThisMonth = setDate(day, 1)
            const offset = index % this.daysPerRow

            return add(firstDayOfThisMonth, { days: offset })
        },
        monthsByYear(year: Date): Date[] {
            const firstMonthOfGroup = max([this.visibleStart, year])
            const lastMonthOfGroup = lastDayOfMonth(min([this.visibleEnd, setMonth(year, 11)]))

            return eachMonthOfInterval({
                start: firstMonthOfGroup,
                end: lastMonthOfGroup,
            })
        },
        parseDate(string: string): Date | null {
            const parsed = parse(string, `yyyy-MM-dd`, new Date())

            return isDate(parsed) ? parsed : null
        },
        renderMonth(month: number): string {
            const monthNames = [
                `jan`,
                `feb`,
                `mar`,
                `apr`,
                `may`,
                `jun`,
                `jul`,
                `aug`,
                `sept`,
                `oct`,
                `nov`,
                `dec`,
            ]

            return monthNames[month]
        },
    },
})
</script>

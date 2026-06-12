import { ref, computed } from 'vue'
import {
  add,
  sub,
  differenceInCalendarDays,
  parse,
  isDate,
} from 'date-fns'
import type { DayRow } from '../types'

export function useGrid() {
  const params = new URLSearchParams(window.location.search)

  const daysPerRow = ref(parseInt(params.get('days_per_row') ?? '7'))
  const ROW_HEIGHT = 42
  const today = new Date()

  const indexingDay = ref(parseIndexingDay())
  const featuredDay = ref(parseFeaturedDay())

  const initialWindowDays = 52 * daysPerRow.value

  const windowStart = ref(sub(today, { days: initialWindowDays }))
  const windowEnd = ref(add(today, { days: initialWindowDays }))

  function parseIndexingDay(): Date {
    const raw = params.get('indexing_day')
    if (raw) {
      const parsed = parse(raw, 'yyyy-MM-dd', new Date())
      if (isDate(parsed)) return parsed
    }
    return sub(setDateStart(today), { days: today.getDay() })
  }

  function parseFeaturedDay(): Date | null {
    const raw = params.get('featured_day')
    if (raw) {
      const parsed = parse(raw, 'yyyy-MM-dd', new Date())
      if (isDate(parsed)) return parsed
    }
    return setDateStart(new Date())
  }

  function setDateStart(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  function alignToRow(d: Date): Date {
    const diff = differenceInCalendarDays(d, indexingDay.value)
    const offset = ((diff % daysPerRow.value) + daysPerRow.value) % daysPerRow.value
    return sub(d, { days: offset })
  }

  const visibleRows = computed(() => {
    const dpr = daysPerRow.value
    const start = alignToRow(windowStart.value)
    const end = windowEnd.value
    const rows: DayRow[] = []
    let cursor = start

    while (cursor <= end) {
      const days: Date[] = []
      for (let c = 0; c < dpr; c++) {
        days.push(add(cursor, { days: c }))
      }
      rows.push({ days })
      cursor = add(cursor, { days: dpr })
    }

    return rows
  })

  const totalRows = computed(() => visibleRows.value.length)

  const dayWidth = computed(() => {
    const maxDayWidth = 5
    const minDayWidth = 2
    const cutoverDayWidth = 3
    const cutoverDayCount = 25
    const dpr = daysPerRow.value

    if (dpr <= 7) return maxDayWidth
    if (100 <= dpr) return minDayWidth

    if (dpr <= cutoverDayCount) {
      const w = (maxDayWidth - cutoverDayWidth) / (cutoverDayCount - 7)
      return cutoverDayWidth + (cutoverDayCount - dpr) * w
    }

    const w = (cutoverDayWidth - minDayWidth) / (100 - cutoverDayCount)
    return cutoverDayWidth - (dpr - cutoverDayCount) * w
  })

  function prependRows(count: number) {
    windowStart.value = sub(windowStart.value, { days: count * daysPerRow.value })
  }

  function appendRows(count: number) {
    windowEnd.value = add(windowEnd.value, { days: count * daysPerRow.value })
  }

  const firstRowDate = computed(() => visibleRows.value[0]?.days[0] ?? new Date())

  return {
    daysPerRow,
    indexingDay,
    featuredDay,
    dayWidth,
    ROW_HEIGHT,
    windowStart,
    windowEnd,
    visibleRows,
    totalRows,
    firstRowDate,
    prependRows,
    appendRows,
  }
}

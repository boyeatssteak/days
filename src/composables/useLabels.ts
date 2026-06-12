import { computed, type Ref } from 'vue'
import {
  add,
  sub,
  differenceInCalendarDays,
  getYear,
  getMonth,
  getDate,
  parse,
  isDate,
} from 'date-fns'
import type { DayRow, Pattern, LabelSection } from '../types'

export function useLabels(
  visibleRows: Ref<DayRow[]>,
  daysPerRow: Ref<number>,
  pattern: Ref<Pattern | null>,
) {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  const leftSections = computed(() => {
    const rows = visibleRows.value
    if (!rows.length) return []

    const firstDays = rows[0].days

    const firstJan1 = firstDays.find(d => getMonth(d) === 0 && getDate(d) === 1)
    let curYear = firstJan1 ? getYear(firstJan1) : getYear(firstDays[0])

    const firstMonthFirst = firstDays.find(d => getDate(d) === 1)
    let curMonth = firstMonthFirst ? getMonth(firstMonthFirst) : getMonth(firstDays[0])

    const sections: LabelSection[] = []
    let yearStart = 0
    let monthStart = 0

    for (let i = 0; i < rows.length; i++) {
      const days = rows[i].days

      const jan1 = days.find(d => getMonth(d) === 0 && getDate(d) === 1)
      if (jan1 && i > yearStart) {
        sections.push({
          type: 'year',
          text: String(curYear),
          startRow: yearStart,
          rowCount: i - yearStart,
          topOffset: '0',
          zIndex: 3,
        })
        yearStart = i
        curYear = getYear(jan1)
      }

      let monthFirst: Date | undefined
      for (let j = days.length - 1; j >= 0; j--) {
        if (getDate(days[j]) === 1) {
          monthFirst = days[j]
          break
        }
      }
      if (monthFirst) {
        const newMonth = getMonth(monthFirst)
        if (newMonth !== curMonth) {
          sections.push({
            type: 'month',
            text: monthNames[curMonth],
            startRow: monthStart,
            rowCount: i - monthStart,
            topOffset: '0',
            zIndex: 2,
          })
          monthStart = i
          curMonth = newMonth
        }
      }
    }

    sections.push({
      type: 'year',
      text: String(curYear),
      startRow: yearStart,
      rowCount: rows.length - yearStart,
      topOffset: '0',
      zIndex: 3,
    })

    sections.push({
      type: 'month',
      text: monthNames[curMonth],
      startRow: monthStart,
      rowCount: rows.length - monthStart,
      topOffset: '0',
      zIndex: 2,
    })

    return sections
  })

  const rightSections = computed(() => {
    const p = pattern.value
    if (!p) return []

    const rows = visibleRows.value
    if (!rows.length) return []

    const dpr = daysPerRow.value
    const firstDate = rows[0].days[0]

    const patternStartDate = parse(p.patternStart, 'yyyy-MM-dd', new Date())
    if (!isDate(patternStartDate)) return []

    const daysFromFirst = differenceInCalendarDays(patternStartDate, firstDate)
    const patternFirstRow = Math.floor(daysFromFirst / dpr)

    function dateToLocalRow(date: Date): number {
      const diff = differenceInCalendarDays(date, firstDate)
      return Math.floor(diff / dpr)
    }

    const patternSections: LabelSection[] = []
    const subpatternSections: LabelSection[] = []

    for (let rep = 0; rep < p.patternCount; rep++) {
      const repStartRow = patternFirstRow + rep * p.rowCount
      const repEndRow = repStartRow + p.rowCount - 1

      if (repEndRow < 0 || repStartRow >= rows.length) continue

      const visStart = Math.max(0, repStartRow)
      const visEnd = Math.min(rows.length - 1, repEndRow)
      const visCount = visEnd - visStart + 1

      patternSections.push({
        type: 'pattern',
        text: `${p.label} ${rep + 1}`,
        startRow: visStart,
        rowCount: visCount,
        topOffset: '0',
        zIndex: 3,
      })

      for (const sp of p.subpatterns) {
        let spStartRow: number
        let spRowCount: number

        if (sp.unit === 'rows') {
          spStartRow = repStartRow + sp.offset
          spRowCount = sp.count
        } else {
          const repFirstDay = add(patternStartDate, {
            days: rep * p.rowCount * dpr,
          })
          const first = add(repFirstDay, { days: sp.offset })
          const last = sub(add(first, { days: sp.count }), { days: 1 })
          spStartRow = dateToLocalRow(first)
          const spEndRow = dateToLocalRow(last)
          spRowCount = spEndRow - spStartRow + 1
        }

        const vStart = Math.max(0, spStartRow)
        const vEnd = Math.min(rows.length - 1, spStartRow + spRowCount - 1)
        const vCount = vEnd - vStart + 1

        if (vCount > 0) {
          subpatternSections.push({
            type: 'subpattern',
            text: sp.label,
            startRow: vStart,
            rowCount: vCount,
            topOffset: '0',
            zIndex: 2,
          })
        }
      }
    }

    const resolved = resolveOverlaps(subpatternSections)
    return [...patternSections, ...resolved]
  })

  return { leftSections, rightSections }
}

function resolveOverlaps(sections: LabelSection[]): LabelSection[] {
  const resolved: LabelSection[] = []

  for (const section of sections) {
    let i = 0
    while (i < resolved.length) {
      const existing = resolved[i]
      const existingStart = existing.startRow
      const existingEnd = existing.startRow + existing.rowCount - 1
      const sectionStart = section.startRow
      const sectionEnd = section.startRow + section.rowCount - 1

      if (sectionStart <= existingEnd && sectionEnd >= existingStart) {
        resolved.splice(i, 1)

        if (existingStart < sectionStart) {
          resolved.push({
            ...existing,
            rowCount: sectionStart - existingStart,
          })
        }

        if (existingEnd > sectionEnd) {
          resolved.push({
            ...existing,
            startRow: sectionEnd + 1,
            rowCount: existingEnd - sectionEnd,
          })
        }
      } else {
        i++
      }
    }

    resolved.push({ ...section })
  }

  resolved.sort((a, b) => a.startRow - b.startRow)
  return resolved
}

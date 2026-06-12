import { computed } from 'vue'
import type { Pattern } from '../types'

export function usePattern() {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('pattern')

  const pattern = computed<Pattern | null>(() => {
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)

      if (typeof parsed.rowCount !== 'number'
        || typeof parsed.label !== 'string'
        || typeof parsed.patternStart !== 'string'
      ) return null

      const pattern: Pattern = {
        rowCount: parsed.rowCount,
        label: parsed.label,
        patternStart: parsed.patternStart,
        patternCount: parsed.patternCount ?? 99,
        subpatterns: [],
      }

      if (Array.isArray(parsed.subpatterns)) {
        for (const sp of parsed.subpatterns) {
          if (!['rows', 'days'].includes(sp.unit)
            || typeof sp.offset !== 'number'
            || typeof sp.count !== 'number'
            || typeof sp.label !== 'string'
          ) return null
          pattern.subpatterns.push(sp)
        }
      }

      return pattern
    } catch {
      return null
    }
  })

  return { pattern }
}

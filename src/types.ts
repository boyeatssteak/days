export type SubPatternUnit = 'rows' | 'days'

export interface SubPattern {
  unit: SubPatternUnit
  offset: number
  count: number
  label: string
}

export interface Pattern {
  rowCount: number
  label: string
  patternStart: string
  patternCount: number
  subpatterns: SubPattern[]
}

export interface DayRow {
  days: Date[]
}

export interface LabelSection {
  type: 'year' | 'month' | 'pattern' | 'subpattern'
  text: string
  startRow: number
  rowCount: number
  topOffset: string
  zIndex: number
}

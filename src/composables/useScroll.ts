import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export function useScroll(
  containerRef: Ref<HTMLElement | null>,
  onPrepend: (count: number) => void,
  onAppend: (count: number) => void,
  scrollToRow?: number,
  rowHeight?: number,
) {
  let pending = false
  let lastCall = 0

  const SCROLL_STEP = 52

  function handleScroll() {
    const el = containerRef.value
    if (!el || pending) return

    const now = Date.now()
    if (now - lastCall < 100) return
    lastCall = now

    const { scrollTop, scrollHeight, clientHeight } = el
    const viewportMid = scrollTop + clientHeight / 2
    const bleed = clientHeight * 4

    if (viewportMid - bleed < 0) {
      pending = true
      const prev = { height: scrollHeight, top: scrollTop }

      onPrepend(SCROLL_STEP)

      nextTick(() => {
        const el2 = containerRef.value
        if (el2) {
          el2.scrollTop = el2.scrollHeight - prev.height + prev.top
        }
        pending = false
      })
      return
    }

    if (viewportMid + bleed > scrollHeight) {
      pending = true
      const prevTop = scrollTop

      onAppend(SCROLL_STEP)

      nextTick(() => {
        const el2 = containerRef.value
        if (el2) {
          el2.scrollTop = prevTop + 0.5
        }
        pending = false
      })
      return
    }
  }

  onMounted(() => {
    const el = containerRef.value
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true })

      if (scrollToRow !== undefined && rowHeight) {
        const target = scrollToRow * rowHeight - el.clientHeight / 2 + rowHeight / 2
        el.scrollTop = Math.max(0, target)
      }
    }
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (el) {
      el.removeEventListener('scroll', handleScroll)
    }
  })
}

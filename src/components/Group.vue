<template>
    <div class="flex items-start my-4 first:my-0 last:my-0">
        <div class="sticky top-4 p-2">
            <slot name="label"></slot>
        </div>

        <slot name="default"></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: `Group`,
})
</script>

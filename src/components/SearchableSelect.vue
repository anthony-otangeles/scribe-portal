<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select an option' },
  searchPlaceholder: { type: String, default: 'Search options...' },
  clearLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  teleportToBody: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Select an option' },
})

const emit = defineEmits(['update:modelValue'])
const root = ref(null)
const trigger = ref(null)
const menu = ref(null)
const searchInput = ref(null)
const open = ref(false)
const query = ref('')
const menuStyle = ref({})
const listboxId = `searchable-select-${Math.random().toString(36).slice(2, 9)}`

const filteredOptions = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return props.options
  return props.options.filter((option) => String(option).toLowerCase().includes(term))
})

watch(() => props.disabled, (disabled) => {
  if (disabled) close()
})

watch(() => props.options, (options) => {
  if (props.modelValue && !options.includes(props.modelValue)) emit('update:modelValue', '')
})

function toggle() {
  if (props.disabled) return
  open.value ? close() : show()
}

async function show() {
  open.value = true
  query.value = ''
  await nextTick()
  updateMenuPosition()
  searchInput.value?.focus()
}

function close() {
  open.value = false
  query.value = ''
}

function select(option) {
  emit('update:modelValue', option)
  close()
}

function updateMenuPosition() {
  if (!open.value || !props.teleportToBody || !trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const gap = 5
  const edge = 8
  const menuHeight = menu.value?.offsetHeight || 260
  const roomBelow = window.innerHeight - rect.bottom - gap - edge
  const opensAbove = roomBelow < Math.min(menuHeight, 200) && rect.top > roomBelow
  const top = opensAbove ? Math.max(edge, rect.top - menuHeight - gap) : rect.bottom + gap
  const left = Math.min(Math.max(edge, rect.left), Math.max(edge, window.innerWidth - rect.width - edge))
  menuStyle.value = {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    width: `${Math.round(rect.width)}px`,
  }
}

function handleDocumentClick(event) {
  if (open.value && !root.value?.contains(event.target) && !menu.value?.contains(event.target)) close()
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<template>
  <div ref="root" class="searchable-select" :class="{ 'is-open': open, 'is-disabled': disabled }">
    <button
      ref="trigger"
      type="button"
      class="searchable-select__trigger"
      role="combobox"
      :aria-label="ariaLabel"
      :aria-controls="listboxId"
      :aria-expanded="open"
      :aria-required="required"
      :disabled="disabled"
      @click="toggle"
      @keydown.down.prevent="show"
    >
      <span :class="{ 'is-placeholder': !modelValue }">{{ modelValue || placeholder }}</span>
      <AppIcon :name="open ? 'chevronUp' : 'chevronDown'" :size="15" />
    </button>

    <Teleport to="body" :disabled="!teleportToBody">
      <div v-if="open" ref="menu" class="searchable-select__menu" :class="{ 'is-teleported': teleportToBody }" :style="teleportToBody ? menuStyle : undefined">
        <div v-if="searchable" class="searchable-select__search">
          <AppIcon name="search" :size="15" />
          <input ref="searchInput" v-model="query" type="search" :placeholder="searchPlaceholder" :aria-label="searchPlaceholder" autocomplete="off" />
        </div>
        <div :id="listboxId" class="searchable-select__options" role="listbox">
          <button v-if="clearLabel && !query" type="button" class="searchable-select__option is-clear" :class="{ 'is-selected': !modelValue }" role="option" :aria-selected="!modelValue" @click="select('')">
            {{ clearLabel }}
            <AppIcon v-if="!modelValue" name="check" :size="14" />
          </button>
          <button v-for="option in filteredOptions" :key="option" type="button" class="searchable-select__option" :class="{ 'is-selected': option === modelValue }" role="option" :aria-selected="option === modelValue" @click="select(option)">
            <span>{{ option }}</span>
            <AppIcon v-if="option === modelValue" name="check" :size="14" />
          </button>
          <p v-if="!filteredOptions.length">No matching options</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.searchable-select { position: relative; width: 100%; }
.searchable-select__trigger { align-items: center; background: #fff; border: 1px solid #D7DAE1; border-radius: 7px; color: var(--ink); cursor: pointer; display: flex; font-family: inherit; font-size: 14px; font-weight: 500; gap: 10px; height: 43px; justify-content: space-between; padding: 0 15px 0 11px; text-align: left; width: 100%; }
.searchable-select__trigger > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.searchable-select__trigger > span.is-placeholder { color: var(--subtle); }
.searchable-select__trigger > svg { color: var(--muted); flex: 0 0 auto; }
.searchable-select.is-open .searchable-select__trigger, .searchable-select__trigger:focus-visible { border-color: #A98DDA; box-shadow: 0 0 0 3px rgba(103,86,140,.1); outline: 0; }
.searchable-select__trigger:disabled { background: #F3F4F6; color: var(--subtle); cursor: not-allowed; }
.searchable-select__menu { background: #fff; border: 1px solid #D7DAE1; border-radius: 8px; box-shadow: 0 12px 28px rgba(28,25,46,.14); left: 0; overflow: hidden; position: absolute; right: 0; top: calc(100% + 5px); z-index: 50; }
.searchable-select__menu.is-teleported { position: fixed; right: auto; z-index: 180; }
.searchable-select__search { align-items: center; border-bottom: 1px solid #E7E8EC; color: var(--subtle); display: flex; gap: 8px; padding: 9px; }
.searchable-select__search input { background: #F8F8FA; border: 1px solid #D7DAE1; border-radius: 6px; color: var(--ink); font-family: inherit; font-size: 13px; height: 38px; min-width: 0; outline: 0; padding: 0 10px; width: 100%; }
.searchable-select__search input:focus { background: #fff; border-color: #A98DDA; box-shadow: 0 0 0 2px rgba(103,86,140,.08); }
.searchable-select__options { max-height: 210px; overflow-y: auto; padding: 5px; }
.searchable-select__option { align-items: center; background: transparent; border: 0; border-radius: 5px; color: var(--ink); cursor: pointer; display: flex; font-family: inherit; font-size: 13px; gap: 10px; justify-content: space-between; min-height: 38px; padding: 8px 9px; text-align: left; width: 100%; }
.searchable-select__option > span { overflow-wrap: anywhere; }
.searchable-select__option:hover, .searchable-select__option:focus-visible { background: #F7F4FC; outline: 0; }
.searchable-select__option.is-selected { background: var(--purple-soft); color: var(--purple-dark); font-weight: 750; }
.searchable-select__option.is-clear { color: var(--muted); }
.searchable-select__options > p { color: var(--muted); font-size: 12px; margin: 0; padding: 14px 10px; text-align: center; }
</style>

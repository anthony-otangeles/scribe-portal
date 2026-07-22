<script setup>
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

const route = useRoute()

defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false },
})
const emit = defineEmits(['close-mobile-nav', 'toggle-collapse'])

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/encounters', label: 'Encounter', icon: 'activity' },
  { label: 'Patients', icon: 'users' },
  { label: 'Calendar', icon: 'calendar', expandable: true },
  { label: 'My Performance', icon: 'chart' },
  { label: 'Settings', icon: 'settings' },
]

const isItemActive = (item) => item.to === '/dashboard'
  ? route.path === '/dashboard'
  : item.to === '/encounters' && route.path.startsWith('/encounters')
</script>

<template>
  <div v-if="mobileOpen" class="sidebar-backdrop" @click="emit('close-mobile-nav')" />
  <aside class="sidebar" :class="{ 'is-collapsed': collapsed, 'is-mobile-open': mobileOpen }">
    <div class="sidebar__mobile-head">
      <div class="sidebar__mobile-search">
        <AppIcon name="search" :size="16" color="#99A1AF" />
        <span>Search patients, MRN, encounters...</span>
      </div>
      <button type="button" aria-label="Close navigation" @click="emit('close-mobile-nav')">
        <AppIcon name="x" :size="18" color="#6A7282" />
      </button>
    </div>

    <nav class="sidebar__nav" aria-label="Primary navigation">
      <template v-for="item in navItems" :key="item.label">
        <RouterLink v-if="item.to" :to="item.to" :title="collapsed ? item.label : undefined" class="sidebar__link" @click="emit('close-mobile-nav')">
          <span class="sidebar__item" :class="{ 'is-active': isItemActive(item) }">
            <AppIcon :name="item.icon" :size="20" :color="isItemActive(item) ? '#00C9A7' : '#6A7282'" />
            <span v-if="!collapsed">{{ item.label }}</span>
          </span>
        </RouterLink>
        <button v-else type="button" class="sidebar__link sidebar__static-link" :title="collapsed ? item.label : undefined" @click="emit('close-mobile-nav')">
          <span class="sidebar__item">
            <AppIcon :name="item.icon" :size="20" color="#6A7282" />
            <span v-if="!collapsed">{{ item.label }}</span>
            <AppIcon v-if="item.expandable && !collapsed" class="sidebar__item-chevron" name="chevronDown" :size="15" color="#6A7282" />
          </span>
        </button>
      </template>
    </nav>

    <footer class="sidebar__footer">
      <div class="sidebar__collapse">
        <span v-if="!collapsed">&copy; 2026 Otangeles Note+</span>
        <button type="button" :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'" @click="emit('toggle-collapse')">
          <AppIcon :name="collapsed ? 'chevronsRight' : 'chevronsLeft'" :size="22" color="#00C9A7" />
        </button>
      </div>
    </footer>
  </aside>
</template>

<style scoped>
.sidebar { background: #fff; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; flex-shrink: 0; overflow-x: hidden; transition: width 180ms ease-out; width: 260px; }
.sidebar.is-collapsed { width: 72px; }
.sidebar-backdrop, .sidebar__mobile-head, .sidebar__mobile-search { display: none; }
.sidebar__nav { display: flex; flex: 1; flex-direction: column; gap: 6px; overflow-y: auto; padding: 20px 16px; }
.is-collapsed .sidebar__nav { padding: 12px; }
.sidebar__link { color: inherit; text-decoration: none; }
.sidebar__static-link { background: transparent; border: 0; cursor: default; padding: 0; text-align: left; width: 100%; }
.sidebar__item { align-items: center; border-radius: 4px; color: #6A7282; display: flex; font-size: 14px; font-weight: 600; gap: 12px; height: 46px; padding: 0 14px; transition: background 120ms ease-out; user-select: none; }
.is-collapsed .sidebar__item { justify-content: center; padding: 0; }
.sidebar__item:hover, .sidebar__item.is-active { background: #F8F8F8; }
.sidebar__item.is-active { color: #00C9A7; font-weight: 700; }
.sidebar__item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar__item-chevron { margin-left: auto; }
.sidebar__footer { border-top: 1px solid var(--border); display: flex; flex: 0 0 66px; flex-direction: column; gap: 8px; height: 66px; justify-content: center; padding: 11px 16px; }
.is-collapsed .sidebar__footer { padding: 11px 12px; }
.sidebar__collapse { align-items: center; display: flex; gap: 12px; justify-content: space-between; }
.is-collapsed .sidebar__collapse { border-top: 0; justify-content: center; margin-top: 0; padding-top: 0; }
.sidebar__collapse > span { color: #99A1AF; font-size: 12px; white-space: nowrap; }
.sidebar__collapse button { align-items: center; background: #fff; border: 1px solid #D1D5DC; border-radius: 8px; cursor: pointer; display: flex; flex-shrink: 0; height: 40px; justify-content: center; padding: 0; width: 40px; }
@media (max-width: 900px) {
  .sidebar-backdrop { background: rgba(28, 25, 46, .38); display: block; inset: 0; position: fixed; z-index: 60; }
  .sidebar, .sidebar.is-collapsed { bottom: 0; box-shadow: 12px 0 28px -18px rgba(28, 25, 46, .45); left: 0; max-width: min(86vw, 340px); overflow-y: auto; position: fixed; top: 0; transform: translateX(-104%); transition: transform 180ms ease-out; width: min(86vw, 340px); z-index: 70; }
  .sidebar.is-mobile-open, .sidebar.is-collapsed.is-mobile-open { transform: translateX(0); }
  .sidebar__mobile-head { align-items: center; border-bottom: 1px solid #EEEEEE; display: flex; gap: 10px; padding: 12px 16px; }
  .sidebar__mobile-head button { align-items: center; background: #fff; border: 1px solid #D1D5DC; border-radius: 5px; cursor: pointer; display: flex; height: 36px; justify-content: center; padding: 0; width: 36px; }
  .sidebar__mobile-search { align-items: center; background: #F7F7F7; border: 1px solid #E5E7EB; border-radius: 6px; color: #99A1AF; display: flex; flex: 1; font-size: 13px; gap: 9px; min-height: 40px; min-width: 0; padding: 0 12px; }
  .sidebar__mobile-search span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sidebar__nav, .is-collapsed .sidebar__nav { gap: 6px; overflow: visible; padding: 14px 16px 18px; }
  .sidebar__footer { display: none; }
  .sidebar__item, .is-collapsed .sidebar__item { gap: 12px; height: 40px; justify-content: flex-start; padding: 0 12px; }
  .sidebar__item span { display: inline; }
}
</style>

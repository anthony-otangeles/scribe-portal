<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import TopBar from './components/TopBar.vue'

const route = useRoute()
const mobileNavOpen = ref(false)
const sidebarCollapsed = ref(false)

function toggleNavigation() {
  if (window.matchMedia('(max-width: 900px)').matches) {
    mobileNavOpen.value = !mobileNavOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

watch(() => route.fullPath, () => {
  mobileNavOpen.value = false
})
</script>

<template>
  <div class="app-shell">
    <TopBar @toggle-nav="toggleNavigation" />
    <div class="app-body">
      <AppSidebar
        :collapsed="sidebarCollapsed"
        :mobile-open="mobileNavOpen"
        @close-mobile-nav="mobileNavOpen = false"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      />
      <main class="app-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

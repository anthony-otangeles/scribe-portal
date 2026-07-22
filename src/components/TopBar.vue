<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import AvatarIcon from './AvatarIcon.vue'
import BrandLogo from './BrandLogo.vue'
import { notifications } from '../data/portalData'

const emit = defineEmits(['toggle-nav'])
const router = useRouter()
const profileOpen = ref(false)
const notificationsOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const notificationItems = ref(notifications.map((item) => ({ ...item })))
const unreadCount = computed(() => notificationItems.value.filter((item) => item.unread).length)

function closePopovers(event) {
  if (!event.target.closest('[data-popover]')) {
    profileOpen.value = false
    notificationsOpen.value = false
  }
}

function markAllRead() {
  notificationItems.value.forEach((item) => { item.unread = false })
}

function submitSearch() {
  const value = searchQuery.value.trim()
  if (!value) return
  router.push({ path: '/encounters', query: { search: value } })
  searchOpen.value = false
}

function handleShortcut(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = true
    requestAnimationFrame(() => document.querySelector('#global-search')?.focus())
  }
  if (event.key === 'Escape') searchOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', closePopovers)
  document.addEventListener('keydown', handleShortcut)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closePopovers)
  document.removeEventListener('keydown', handleShortcut)
})
</script>

<template>
  <header class="top-bar">
    <div class="top-bar__brand">
      <button class="brand-button" type="button" aria-label="Go to dashboard" @click="router.push('/dashboard')">
        <BrandLogo />
      </button>
      <i aria-hidden="true" />
      <span>Scribe Portal</span>
    </div>
    <div class="top-bar__spacer" />

    <form class="top-bar__search" role="search" @submit.prevent="submitSearch">
      <AppIcon name="search" :size="16" color="#99A1AF" />
      <input v-model="searchQuery" aria-label="Search" placeholder="Search patients, MRN, encounters..." />
      <kbd>Ctrl K</kbd>
    </form>

    <button type="button" class="top-bar__menu-button" aria-label="Toggle navigation" @click="emit('toggle-nav')">
      <AppIcon name="menu" :size="20" color="#1C192E" />
    </button>

    <div data-popover class="top-bar__popover">
      <button
        type="button"
        class="icon-button"
        :class="{ 'is-active': notificationsOpen }"
        aria-label="Open notifications"
        @click="notificationsOpen = !notificationsOpen; profileOpen = false"
      >
        <AppIcon name="bell" :size="18" :color="notificationsOpen ? '#845EC2' : '#6A7282'" />
        <span v-if="unreadCount" class="top-bar__badge" />
      </button>
      <section v-if="notificationsOpen" class="notifications-menu" @click.stop>
        <header>
          <div>
            <strong>Notifications</strong>
            <span>{{ unreadCount }} unread</span>
          </div>
          <button type="button" @click="markAllRead">Mark all as read</button>
        </header>
        <div class="notifications-menu__list">
          <article v-for="item in notificationItems" :key="item.id" :class="{ unread: item.unread }">
            <span class="notification-icon" :class="`tone-${item.tone}`">
              <AppIcon :name="item.tone === 'pink' ? 'refresh' : item.tone === 'green' ? 'check' : 'send'" :size="15" />
            </span>
            <div>
              <div class="notification-title">
                <strong>{{ item.title }}</strong>
                <span>{{ item.when }}</span>
                <i v-if="item.unread" />
              </div>
              <p>{{ item.body }}</p>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div data-popover class="top-bar__profile">
      <button type="button" class="profile-trigger" aria-label="Open profile menu" @click="profileOpen = !profileOpen; notificationsOpen = false">
        <AvatarIcon initials="AD" :size="36" />
      </button>
      <section v-if="profileOpen" class="profile-menu" @click.stop>
        <div class="profile-menu__identity">
          <span>Signed in as</span>
          <strong>anthony.delrosario@otangeles.com</strong>
          <em>Scribe</em>
        </div>
        <button type="button" class="profile-menu__logout" @click="profileOpen = false">
          <AppIcon name="logout" :size="16" color="#C34A7D" />
          Logout
        </button>
      </section>
    </div>
  </header>

  <div v-if="searchOpen" class="command-backdrop" @click.self="searchOpen = false">
    <form class="command-search" @submit.prevent="submitSearch">
      <AppIcon name="search" :size="20" color="#845EC2" />
      <input id="global-search" v-model="searchQuery" placeholder="Search patients, MRN, encounters..." />
      <kbd>Esc</kbd>
    </form>
  </div>
</template>

<style scoped>
.top-bar {
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  flex-shrink: 0;
  gap: 16px;
  height: 64px;
  padding: 0 24px;
  position: relative;
  z-index: 40;
}
.top-bar__brand { align-items: center; display: flex; flex-shrink: 0; gap: 12px; min-width: 0; }
.brand-button { align-items: center; background: transparent; border: 0; cursor: pointer; display: flex; flex-shrink: 0; height: 30px; padding: 0; }
.top-bar__brand > i { background: #D1D5DC; display: block; height: 24px; width: 1px; }
.top-bar__brand > span { color: #6A7282; font-size: 15px; font-weight: 400; white-space: nowrap; }
.top-bar__spacer { flex: 1; }
.top-bar__search {
  align-items: center;
  background: #F7F7F7;
  border: 1px solid #E5E7EB;
  border-radius: 5px;
  display: flex;
  flex-shrink: 1;
  gap: 10px;
  height: 40px;
  max-width: 38vw;
  min-width: 260px;
  padding: 0 12px;
  width: 420px;
}
.top-bar__search input { background: transparent; border: 0; color: #1C192E; flex: 1; font-size: 14px; min-width: 0; outline: 0; }
.top-bar__search input::placeholder { color: #99A1AF; }
kbd { background: #fff; border: 1px solid #E5E7EB; border-radius: 4px; color: #99A1AF; font-family: ui-monospace, monospace; font-size: 10px; padding: 2px 6px; white-space: nowrap; }
.top-bar__menu-button,
.icon-button {
  align-items: center;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  height: 40px;
  justify-content: center;
  padding: 0;
  width: 40px;
}
.top-bar__menu-button { display: none; }
.top-bar__menu-button { border-color: #D1D5DC; }
.profile-trigger { align-items: center; background: transparent; border: 0; cursor: pointer; display: flex; height: 36px; justify-content: center; padding: 0; width: 36px; }
.icon-button.is-active { background: #F5F2FD; }
.top-bar__popover,
.top-bar__profile { position: relative; }
.top-bar__badge { background: #C9302C; border: 2px solid #fff; border-radius: 50%; height: 8px; position: absolute; right: 8px; top: 8px; width: 8px; }
.notifications-menu,
.profile-menu { background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 16px 32px -10px rgba(28, 25, 46, .16); overflow: hidden; position: absolute; right: 0; top: 48px; z-index: 50; }
.notifications-menu { width: 420px; }
.notifications-menu > header { align-items: center; display: flex; justify-content: space-between; padding: 17px 20px; }
.notifications-menu > header div { display: flex; flex-direction: column; gap: 2px; }
.notifications-menu > header strong { font-size: 15px; }
.notifications-menu > header span { color: #99A1AF; font-size: 11px; }
.notifications-menu > header button { background: #fff; border: 1px solid #E5DBFA; border-radius: 6px; color: #845EC2; cursor: pointer; font-size: 12px; font-weight: 700; padding: 6px 10px; }
.notifications-menu__list { border-top: 1px solid #EEEEEE; }
.notifications-menu article { display: flex; gap: 12px; padding: 14px 20px; }
.notifications-menu article + article { border-top: 1px solid #F3F4F6; }
.notifications-menu article.unread { background: #FCFBFF; }
.notification-icon { align-items: center; border-radius: 50%; display: flex; flex-shrink: 0; height: 34px; justify-content: center; width: 34px; }
.tone-pink { background: #FFF3F8; color: #C34A7D; }
.tone-green { background: #E7F5EF; color: #29BB89; }
.tone-blue { background: #E6F3FB; color: #0081CF; }
.notification-title { align-items: center; display: flex; gap: 8px; }
.notification-title strong { font-size: 13px; }
.notification-title span { color: #99A1AF; font-size: 11px; }
.notification-title i { background: #29BB89; border-radius: 50%; height: 7px; margin-left: auto; width: 7px; }
.notifications-menu p { color: #6A7282; font-size: 12px; line-height: 18px; margin: 4px 0 0; }
.profile-menu { width: 260px; }
.profile-menu__identity { padding: 14px 16px; }
.profile-menu__identity span { color: #99A1AF; display: block; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.profile-menu__identity strong { color: #1C192E; display: block; font-size: 12.5px; margin-top: 4px; max-width: 100%; overflow-wrap: anywhere; }
.profile-menu__identity em { background: #F5F2FD; border-radius: 999px; color: #67568C; display: inline-flex; font-size: 11px; font-style: normal; font-weight: 800; margin-top: 10px; padding: 4px 8px; }
.profile-menu > button { align-items: center; background: transparent; border: 0; color: #1C192E; cursor: pointer; display: flex; font-size: 13px; font-weight: 600; gap: 10px; padding: 10px 16px; text-align: left; width: 100%; }
.profile-menu > button:hover { background: #F9FAFB; }
.profile-menu .profile-menu__logout { color: #C34A7D; }
.command-backdrop { align-items: flex-start; background: rgba(28, 25, 46, .35); display: flex; inset: 0; justify-content: center; padding-top: 12vh; position: fixed; z-index: 100; }
.command-search { align-items: center; background: #fff; border-radius: 12px; box-shadow: 0 24px 70px rgba(28, 25, 46, .25); display: flex; gap: 12px; max-width: calc(100vw - 32px); padding: 18px; width: 600px; }
.command-search input { border: 0; color: #1C192E; flex: 1; font-size: 16px; outline: 0; }
@media (max-width: 1024px) {
  .top-bar { gap: 12px; padding: 0 18px; }
  .top-bar__search { max-width: 28vw; min-width: 180px; width: 260px; }
  .top-bar__search kbd { display: none; }
}
@media (max-width: 900px) {
  .top-bar__menu-button { display: flex; }
  .top-bar__search { display: none; }
  .top-bar__spacer { display: block; }
}
@media (max-width: 760px) {
  .top-bar { gap: 10px; height: 58px; padding: 0 12px; }
  .top-bar__brand > i, .top-bar__brand > span { display: none; }
  .notifications-menu, .profile-menu { position: fixed; right: 12px; top: 62px; }
  .notifications-menu { max-width: calc(100vw - 24px); width: 420px; }
}
@media (max-width: 480px) {
  .top-bar { gap: 8px; }
  .icon-button, .top-bar__menu-button { height: 36px; width: 36px; }
  .notifications-menu, .profile-menu { left: 10px; max-width: none; right: 10px; width: auto; }
}
</style>

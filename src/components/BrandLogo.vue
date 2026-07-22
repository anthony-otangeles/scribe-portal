<script setup>
import logoUrl from '../assets/otangeles-logo.svg'
</script>

<template>
  <img class="brand-logo" :src="logoUrl" alt="Otangeles Note+" height="30" />
</template>

<style scoped>
.brand-logo {
  display: block;
  flex-shrink: 0;
  height: 30px;
  object-fit: contain;
  object-position: left center;
  width: auto;
}
</style>

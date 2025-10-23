<script setup>
// Layout için herhangi bir özel mantık buraya eklenebilir
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar Component -->
    <Navbar />

    <!-- Main Content Area -->
    <main class="flex-grow">
      <slot />
    </main>
  </div>
</template>

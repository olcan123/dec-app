<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const navItems = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'Müşteriler', href: '/customers' },
  { name: 'Beyannameler', href: '/declarations' },
  { name: 'Beyanname Türleri', href: '/declarations/types' },
]
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <NuxtLink to="/" class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Logo
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:space-x-8">
          <NuxtLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.href"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            active-class="text-blue-600 font-semibold"
          >
            {{ item.name }}
          </NuxtLink>
          
          <!-- CTA Button -->
          <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Başlayın
          </button>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="toggleMenu"
            class="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMenuOpen" class="md:hidden border-t border-gray-200">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.href"
            @click="toggleMenu"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
            active-class="text-blue-600 bg-blue-50 font-semibold"
          >
            {{ item.name }}
          </NuxtLink>
          
          <button class="w-full mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Başlayın
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>
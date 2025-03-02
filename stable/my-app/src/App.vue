<template>
  <div class="min-h-screen bg-base-200 flex flex-col items-center">
    <nav class="bg-primary text-white p-4 w-full flex justify-center gap-4">
      <router-link to="/" class="btn btn-secondary">Home</router-link>
      <router-link to="/about" class="btn btn-accent">About</router-link>
    </nav>
    <div class="p-5">
      <router-view></router-view>
    </div>
  </div>
</template>


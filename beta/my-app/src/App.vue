<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>
nav {
  background-color: #333;
  padding: 10px;
}

nav a {
  color: white;
  margin-right: 15px;
  text-decoration: none;
}
</style>


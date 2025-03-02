import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import About from './components/About.vue'; // Import About page

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }, // Add About route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;


import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import About from './components/About.vue'; // Import About page
import Book from './components/Book.vue';
import Static from './components/Static.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }, // Add About route
  {path: '/book', component: Book},
  {path: '/static', component: Static},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;


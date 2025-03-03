<template>
  <div class="flex flex-col gap-8">
    <h1 class="text-4xl font-bold text-primary">Static Content Management</h1>
    
    <!-- Static Content List -->
    <div class="bg-base-100 rounded-box shadow-lg p-6">
      <h2 class="text-2xl font-bold text-secondary mb-6">Available Content</h2>
      <div v-if="loading" class="flex justify-center p-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      <div v-else-if="error" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ error }}</span>
      </div>
      <div v-else-if="staticContents.length === 0" class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>No static content available. Add some using the button below.</span>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="content in staticContents" :key="content.books_id" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <figure class="h-48 bg-base-200">
            <img v-if="content.static_resources && content.static_resources.picture_url" 
              :src="content.static_resources.picture_url" 
              alt="Content Image"
              class="object-cover w-full h-full" />
            <div v-else class="flex items-center justify-center w-full h-full text-base-content/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-12 h-12 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          </figure>
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h3 class="card-title text-primary">{{ content.name || 'Static Content' }}</h3>
              <div class="badge badge-secondary">Book ID: {{ content.books_id }}</div>
            </div>
            <p v-if="content.author_name" class="mt-1"><span class="font-semibold">Author:</span> {{ content.author_name }}</p>
            <p v-if="content.category" class="mt-1"><span class="font-semibold">Category:</span> {{ content.category }}</p>
            <p class="mt-2"><span class="font-semibold">Picture URL:</span> {{ content.static_resources?.picture_url || 'Not set' }}</p>
            <p class="mt-1"><span class="font-semibold">Download URL:</span> {{ content.static_resources?.download_url || 'Not set' }}</p>
            <div class="card-actions justify-end mt-4">
              <button @click="openEditModal(content)" class="btn btn-sm btn-secondary">Edit</button>
              <button @click="confirmDelete(content.books_id)" class="btn btn-sm btn-error">Delete</button>
              <a v-if="content.static_resources && content.static_resources.download_url" 
                :href="content.static_resources.download_url" 
                target="_blank" 
                class="btn btn-sm btn-primary">
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Content Button -->
    <div class="flex justify-center">
      <button @click="openAddModal" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 mr-2 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Add New Content
      </button>
    </div>
    
    <!-- Add Content Modal -->
    <div v-if="showAddModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-primary">Add New Static Content</h3>
        <button @click="closeAddModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <div class="alert alert-info shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <span class="text-sm">Enter the Book ID for which you want to add static resources</span>
          </div>
        </div>
        
        <form @submit.prevent="addStaticContent" class="mt-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Book ID</span>
            </label>
            <input type="number" v-model.number="newBookId" required class="input input-bordered w-full" placeholder="Enter the Book ID" />
          </div>
          
          <div class="modal-action">
            <button type="button" @click="closeAddModal" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Content</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Edit Content Modal -->
    <div v-if="showEditModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-secondary">Edit Static Content</h3>
        <button @click="closeEditModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <div class="alert alert-info shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <span class="font-medium">Book ID:</span> {{ editingContent.books_id }}
          </div>
        </div>
        
        <form @submit.prevent="updateStaticContent" class="mt-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Picture URL</span>
            </label>
            <input type="text" v-model="editingContent.picture_url" class="input input-bordered w-full" placeholder="http://localhost:5000/db/pictures/1.png" />
          </div>
          <div class="form-control w-full mt-2">
            <label class="label">
              <span class="label-text">Download URL</span>
            </label>
            <input type="text" v-model="editingContent.download_url" class="input input-bordered w-full" placeholder="http://localhost:5000/db/downloads/1.pdf" />
          </div>
          
          <div class="modal-action">
            <button type="button" @click="closeEditModal" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-secondary">Update Content</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-error">Confirm Deletion</h3>
        <button @click="closeDeleteModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <p class="py-4">Are you sure you want to delete static content for Book ID: <span class="font-bold">{{ deleteBookId }}</span>?</p>
        
        <div class="modal-action">
          <button @click="closeDeleteModal" class="btn btn-ghost">Cancel</button>
          <button @click="deleteStaticContent" class="btn btn-error">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Static',
  data() {
    return {
      staticContents: [],
      loading: true,
      error: null,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      newBookId: null,
      editingContent: {
        books_id: null,
        picture_url: '',
        download_url: ''
      },
      deleteBookId: null
    };
  },
  created() {
    this.fetchAllStaticContent();
  },
  methods: {
    async fetchAllStaticContent() {
      this.loading = true;
      this.error = null;
      
      try {
        // Changed to fetch from the main books endpoint instead
        const response = await axios.get('http://localhost:5000/books');
        this.staticContents = response.data;
      } catch (error) {
        console.error('Error fetching books data:', error);
        this.error = 'Failed to load books data. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    
    openAddModal() {
      this.newBookId = null;
      this.showAddModal = true;
    },
    
    closeAddModal() {
      this.showAddModal = false;
    },
    
    openEditModal(content) {
      this.editingContent = {
        books_id: content.books_id,
        picture_url: content.static_resources?.picture_url || '',
        download_url: content.static_resources?.download_url || ''
      };
      this.showEditModal = true;
    },
    
    closeEditModal() {
      this.showEditModal = false;
    },
    
    confirmDelete(bookId) {
      this.deleteBookId = bookId;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
    },
    
    async addStaticContent() {
      try {
        await axios.post(`http://localhost:5000/books/static/add/${this.newBookId}`, {});
        this.closeAddModal();
        await this.fetchAllStaticContent(); // Refresh content list
        
        // Use toast if available or fallback to alert
        if (typeof this.$toast !== 'undefined') {
          this.$toast.success('Content added successfully!');
        } else {
          alert('Content added successfully!');
        }
      } catch (error) {
        console.error('Error adding static content:', error);
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.error('Failed to add content. Please try again.');
        } else {
          alert('Failed to add content. Please try again.');
        }
      }
    },
    
    async updateStaticContent() {
      try {
        const bookId = this.editingContent.books_id;
        const updateData = {
          picture_url: this.editingContent.picture_url,
          download_url: this.editingContent.download_url
        };
        
        await axios.put(`http://localhost:5000/books/static/update/${bookId}`, updateData);
        this.closeEditModal();
        await this.fetchAllStaticContent(); // Refresh content list
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.success('Content updated successfully!');
        } else {
          alert('Content updated successfully!');
        }
      } catch (error) {
        console.error('Error updating static content:', error);
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.error('Failed to update content. Please try again.');
        } else {
          alert('Failed to update content. Please try again.');
        }
      }
    },
    
    async deleteStaticContent() {
      try {
        await axios.delete(`http://localhost:5000/books/static/delete/${this.deleteBookId}`);
        this.closeDeleteModal();
        await this.fetchAllStaticContent(); // Refresh content list
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.success('Content deleted successfully!');
        } else {
          alert('Content deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting static content:', error);
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.error('Failed to delete content. Please try again.');
        } else {
          alert('Failed to delete content. Please try again.');
        }
      }
    }
  }
};
</script>

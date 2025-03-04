<template>
  <div class="flex flex-col gap-8">
    <h1 class="text-4xl font-bold text-primary">Picture Management</h1>
    
    <!-- Book Selection -->
    <div class="bg-base-100 rounded-box shadow-lg p-6">
      <h2 class="text-2xl font-bold text-secondary mb-6">Select Book</h2>
      
      <div v-if="loadingBooks" class="flex justify-center p-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      <div v-else-if="booksError" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ booksError }}</span>
      </div>
      <div v-else>
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Select a book to manage pictures</span>
          </label>
          <select v-model="selectedBookId" class="select select-bordered select-primary w-full max-w-md">
            <option disabled value="">Please select a book</option>
            <option v-for="book in books" :key="book.books_id" :value="book.books_id">
              {{ book.name || 'Book #' + book.books_id }} (ID: {{ book.books_id }})
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Upload Picture Section -->
    <div v-if="selectedBookId" class="bg-base-100 rounded-box shadow-lg p-6">
      <h2 class="text-2xl font-bold text-secondary mb-6">Upload New Picture</h2>
      
      <div class="flex flex-col md:flex-row gap-4 items-start">
        <div class="form-control flex-grow">
          <label class="label">
            <span class="label-text">Select an image file</span>
          </label>
          <input 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect" 
            class="file-input file-input-bordered file-input-primary w-full" 
          />
          <label class="label" v-if="selectedFile">
            <span class="label-text-alt">Selected: {{ selectedFile.name }}</span>
          </label>
        </div>
        
        <div class="form-control mt-8">
          <button 
            @click="uploadPicture" 
            class="btn btn-primary"
            :disabled="!selectedFile || isUploading"
          >
            <svg v-if="!isUploading" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            <span v-if="isUploading" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isUploading ? 'Uploading...' : 'Upload Picture' }}
          </button>
        </div>
      </div>
      
      <div v-if="uploadError" class="alert alert-error mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ uploadError }}</span>
      </div>
    </div>
    
    <!-- Pictures Gallery -->
    <div v-if="selectedBookId" class="bg-base-100 rounded-box shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-secondary">Picture Gallery</h2>
        <div class="badge badge-primary p-3 text-sm">
          Book ID: {{ selectedBookId }}
        </div>
      </div>
      
      <div v-if="isLoading" class="flex justify-center p-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      <div v-else-if="error" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ error }}</span>
      </div>
      <div v-else-if="pictures.length === 0" class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>No pictures available for this book. Upload some using the form above.</span>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="picture in pictures" :key="picture.filename" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-base-300">
          <figure class="h-64 bg-base-200">
            <img 
              :src="getImageUrl(picture.filename)" 
              :alt="picture.filename" 
              class="object-cover w-full h-full" 
              @error="handleImageError" 
            />
          </figure>
          <div class="card-body p-4">
            <div class="flex justify-between items-center">
              <h3 class="card-title text-primary truncate">{{ picture.filename }}</h3>
              <div class="badge badge-secondary">{{ formatFileSize(picture.size) }}</div>
            </div>
            <p class="text-sm opacity-70">Uploaded: {{ formatDate(picture.upload_date) }}</p>
            <div class="card-actions justify-end mt-4">
              <button 
                @click="openViewModal(picture)" 
                class="btn btn-sm btn-outline btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <button 
                @click="openEditModal(picture)" 
                class="btn btn-sm btn-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update
              </button>
              <button 
                @click="confirmDelete(picture.filename)" 
                class="btn btn-sm btn-error"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- View Image Modal -->
    <div v-if="showViewModal" class="modal modal-open">
      <div class="modal-box max-w-3xl">
        <h3 class="font-bold text-xl text-primary">{{ selectedPicture.filename }}</h3>
        <button @click="closeViewModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <div class="py-4">
          <img 
            :src="getImageUrl(selectedPicture.filename)" 
            :alt="selectedPicture.filename" 
            class="w-full rounded-lg shadow-lg" 
          />
        </div>
        
        <div class="modal-action">
          <button @click="closeViewModal" class="btn btn-ghost">Close</button>
          <a :href="getImageUrl(selectedPicture.filename)" download class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
    
    <!-- Update Image Modal -->
    <div v-if="showEditModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-secondary">Update Image</h3>
        <button @click="closeEditModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <div class="alert alert-info shadow-lg mb-4 mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <span class="text-sm">Replacing image: <strong>{{ selectedPicture.filename }}</strong></span>
          </div>
        </div>
        
        <div class="form-control w-full mt-4">
          <label class="label">
            <span class="label-text">Select a new image file</span>
          </label>
          <input 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect" 
            class="file-input file-input-bordered file-input-primary w-full" 
          />
        </div>
        
        <div v-if="updateError" class="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ updateError }}</span>
        </div>
        
        <div class="modal-action">
          <button @click="closeEditModal" class="btn btn-ghost">Cancel</button>
          <button 
            @click="updatePicture" 
            class="btn btn-secondary" 
            :disabled="!selectedFile || isUploading"
          >
            <span v-if="isUploading" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isUploading ? 'Updating...' : 'Update Image' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-error">Confirm Deletion</h3>
        <button @click="closeDeleteModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <div class="py-4">
          <p>Are you sure you want to delete the image <strong>{{ fileToDelete }}</strong>?</p>
          <p class="mt-2 text-warning">This action cannot be undone.</p>
        </div>
        
        <div v-if="deleteError" class="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ deleteError }}</span>
        </div>
        
        <div class="modal-action">
          <button @click="closeDeleteModal" class="btn btn-ghost">Cancel</button>
          <button 
            @click="confirmDelete" 
            class="btn btn-error" 
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isDeleting ? 'Deleting...' : 'Delete Image' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PicUpload',
  data() {
    return {
      // Books data
      books: [],
      selectedBookId: '',
      loadingBooks: false,
      booksError: null,
      
      // Pictures data
      pictures: [],
      isLoading: false,
      error: null,
      
      // File upload
      selectedFile: null,
      isUploading: false,
      uploadError: null,
      
      // Update modal
      showEditModal: false,
      selectedPicture: {},
      updateError: null,
      
      // View modal
      showViewModal: false,
      
      // Delete modal
      showDeleteModal: false,
      fileToDelete: null,
      isDeleting: false,
      deleteError: null
    }
  },
  created() {
    this.fetchBooks();
  },
  watch: {
    selectedBookId(newVal) {
      if (newVal) {
        this.fetchPictures();
      } else {
        this.pictures = [];
      }
    }
  },
  methods: {
    // Book methods
    async fetchBooks() {
      this.loadingBooks = true;
      this.booksError = null;
      
      try {
        const response = await axios.get('http://localhost:5000/books');
        this.books = response.data;
      } catch (error) {
        console.error('Error fetching books:', error);
        this.booksError = 'Failed to load books. Please try again later.';
      } finally {
        this.loadingBooks = false;
      }
    },
    
    // Picture methods
    async fetchPictures() {
      if (!this.selectedBookId) return;
      
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`http://localhost:5000/pictures?book_id=${this.selectedBookId}`);
        
        // Transform data if needed
        this.pictures = response.data.map(pic => {
          // Add default values if properties are missing
          return {
            ...pic,
            size: pic.size || 0,
            upload_date: pic.upload_date || new Date().toISOString()
          };
        });
      } catch (error) {
        console.error('Error fetching pictures:', error);
        this.error = 'Failed to load pictures. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0];
      this.uploadError = null;
      this.updateError = null;
    },
    
    async uploadPicture() {
      if (!this.selectedFile) {
        this.uploadError = 'Please select a file first';
        return;
      }
      
      if (!this.selectedBookId) {
        this.uploadError = 'Please select a book first';
        return;
      }
      
      this.isUploading = true;
      this.uploadError = null;
      
      try {
        const formData = new FormData();
        formData.append('picture', this.selectedFile);
        
        await axios.post(`http://localhost:5000/pictures?book_id=${this.selectedBookId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Reset file input
        this.selectedFile = null;
        
        // Refresh picture list
        await this.fetchPictures();
        
        // Success notification
        this.showToast('success', 'Picture uploaded successfully!');
      } catch (error) {
        console.error('Error uploading picture:', error);
        this.uploadError = `Failed to upload: ${error.response?.data?.message || error.message}`;
      } finally {
        this.isUploading = false;
      }
    },
    
    // Modal methods
    openViewModal(picture) {
      this.selectedPicture = picture;
      this.showViewModal = true;
    },
    
    closeViewModal() {
      this.showViewModal = false;
    },
    
    openEditModal(picture) {
      this.selectedPicture = picture;
      this.selectedFile = null;
      this.updateError = null;
      this.showEditModal = true;
    },
    
    closeEditModal() {
      this.showEditModal = false;
      this.selectedFile = null;
    },
    
    async updatePicture() {
      if (!this.selectedFile) {
        this.updateError = 'Please select a file first';
        return;
      }
      
      this.isUploading = true;
      this.updateError = null;
      
      try {
        const formData = new FormData();
        formData.append('picture', this.selectedFile);
        
        await axios.put(`http://localhost:5000/pictures?book_id=${this.selectedPicture.filename}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Close modal and reset
        this.closeEditModal();
        
        // Refresh picture list
        await this.fetchPictures();
        
        // Success notification
        this.showToast('success', 'Picture updated successfully!');
      } catch (error) {
        console.error('Error updating picture:', error);
        this.updateError = `Failed to update: ${error.response?.data?.message || error.message}`;
      } finally {
        this.isUploading = false;
      }
    },
    
    confirmDelete(filename) {
      this.fileToDelete = filename;
      this.deleteError = null;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.fileToDelete = null;
    },
    
    async confirmDelete() {
      if (!this.fileToDelete) return;
      
      this.isDeleting = true;
      this.deleteError = null;
      
      try {
        await axios.delete(`http://localhost:5000/pictures?filename=${this.fileToDelete}`);
        
        // Close modal and reset
        this.closeDeleteModal();
        
        // Refresh picture list
        await this.fetchPictures();
        
        // Success notification
        this.showToast('success', 'Picture deleted successfully!');
      } catch (error) {
        console.error('Error deleting picture:', error);
        this.deleteError = `Failed to delete: ${error.response?.data?.message || error.message}`;
      } finally {
        this.isDeleting = false;
      }
    },
    
    // Utility methods
    getImageUrl(filename) {
      return `http://localhost:5000/pictures/${filename}`;
    },
    
    handleImageError(e) {
      // Replace with placeholder if image fails to load
      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
    },
    
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return 'Unknown';
      
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return 'Invalid date';
      }
    },
    
    showToast(type, message) {
      // Use toast library if available
      if (typeof this.$toast !== 'undefined') {
        this.$toast[type](message);
      } else if (typeof this.$notification !== 'undefined') {
        this.$notification[type]({
          message: type.charAt(0).toUpperCase() + type.slice(1),
          description: message
        });
      } else {
        // Fallback to alert
        alert(message);
      }
    }
  }
}
</script>

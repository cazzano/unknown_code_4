<template>
  <div class="flex flex-col gap-8">
    <h1 class="text-4xl font-bold text-primary">Books Management</h1>
    
    <!-- Book List -->
    <div class="bg-base-100 rounded-box shadow-lg p-6">
      <h2 class="text-2xl font-bold text-secondary mb-6">Available Books</h2>
      <div v-if="loading" class="flex justify-center p-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      <div v-else-if="error" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ error }}</span>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="book in books" :key="book.books_id" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <figure class="h-48 bg-base-200">
            <img v-if="book.static_resources && book.static_resources.picture_url" 
              :src="book.static_resources.picture_url" 
              :alt="book.name"
              class="object-cover w-full h-full" />
            <div v-else class="flex items-center justify-center w-full h-full text-base-content/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-12 h-12 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
          </figure>
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h3 class="card-title text-primary">{{ book.name }}</h3>
              <div class="badge badge-neutral">ID: {{ book.books_id }}</div>
            </div>
            <div class="badge badge-secondary">{{ book.category }}</div>
            <p class="mt-2"><span class="font-semibold">Author:</span> {{ book.author_name }}</p>
            <p class="mt-1"><span class="font-semibold">Description:</span> {{ book.description }}</p>
            <div class="card-actions justify-end mt-4">
              <button @click="openEditModal(book)" class="btn btn-sm btn-secondary">Edit</button>
              <button @click="deleteBook(book.books_id)" class="btn btn-sm btn-error">Delete</button>
              <a v-if="book.static_resources && book.static_resources.download_url" 
                :href="book.static_resources.download_url" 
                target="_blank" 
                class="btn btn-sm btn-primary">
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Book Button -->
    <div class="flex justify-center">
      <button @click="openAddModal" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 mr-2 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Add New Book
      </button>
    </div>
    
    <!-- Add Book Modal -->
    <div v-if="showAddModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-primary">Add New Book</h3>
        <button @click="closeAddModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <div class="alert alert-info shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <span class="font-medium">Auto-assigned Book ID:</span> {{ getNextBookId() }}
          </div>
        </div>
        
        <form @submit.prevent="addBook" class="mt-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Book Title</span>
            </label>
            <input type="text" v-model="newBook.name" required class="input input-bordered w-full" />
          </div>
          <div class="form-control w-full mt-2">
            <label class="label">
              <span class="label-text">Author</span>
            </label>
            <input type="text" v-model="newBook.author_name" required class="input input-bordered w-full" />
          </div>
          <div class="form-control w-full mt-2">
            <label class="label">
              <span class="label-text">Category</span>
            </label>
            <input type="text" v-model="newBook.category" required class="input input-bordered w-full" />
          </div>
          <div class="form-control w-full mt-2">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea v-model="newBook.description" required class="textarea textarea-bordered h-24"></textarea>
          </div>
          <div class="modal-action">
            <button type="button" @click="closeAddModal" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Book</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Edit Book Modal -->
    <div v-if="showEditModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-secondary">Edit Book</h3>
        <button @click="closeEditModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        
        <div class="alert alert-info shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <span class="font-medium">Book ID:</span> {{ editingBook.books_id }}
          </div>
        </div>
        
        <form @submit.prevent="updateBook" class="mt-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Book Title</span>
            </label>
            <input type="text" v-model="editingBook.name" required class="input input-bordered w-full" />
          </div>
          <div class="form-control w-full mt-2">
            <label class="label">
              <span class="label-text">Author</span>
            </label>
            <input type="text" v-model="editingBook.author_name" required class="input input-bordered w-full" />
          </div>
          <div class="form-control w-full mt-2">
            <label class="label">
              <span class="label-text">Category</span>
            </label>
            <input type="text" v-model="editingBook.category" required class="input input-bordered w-full" />
          </div>
          <div class="form-control w-full mt-2">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea v-model="editingBook.description" required class="textarea textarea-bordered h-24"></textarea>
          </div>
          <div class="modal-action">
            <button type="button" @click="closeEditModal" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-secondary">Update Book</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Book',
  data() {
    return {
      books: [],
      loading: true,
      error: null,
      showAddModal: false,
      showEditModal: false,
      newBook: {
        name: '',
        author_name: '',
        category: '',
        description: ''
      },
      editingBook: {
        books_id: null,
        name: '',
        author_name: '',
        category: '',
        description: ''
      }
    };
  },
  created() {
    this.fetchBooks();
  },
  methods: {
    async fetchBooks() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('http://localhost:5000/books');
        this.books = response.data;
      } catch (error) {
        console.error('Error fetching books:', error);
        this.error = 'Failed to load books. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    
    getNextBookId() {
      // If there are no books, start with ID 1
      if (!this.books || this.books.length === 0) {
        return 1;
      }
      
      // Find the highest current book_id
      const highestId = Math.max(...this.books.map(book => book.books_id));
      
      // Return the next ID (highest + 1)
      return highestId + 1;
    },
    
    openAddModal() {
      // Reset form fields
      this.newBook = {
        name: '',
        author_name: '',
        category: '',
        description: ''
      };
      this.showAddModal = true;
    },
    
    closeAddModal() {
      this.showAddModal = false;
    },
    
    openEditModal(book) {
      this.editingBook = { ...book };
      this.showEditModal = true;
    },
    
    closeEditModal() {
      this.showEditModal = false;
    },
    
    async addBook() {
      try {
        // Add the automatically generated book_id to the new book
        const bookToAdd = {
          ...this.newBook,
          books_id: this.getNextBookId()
        };
        
        await axios.post('http://localhost:5000/books/add', bookToAdd);
        this.closeAddModal();
        await this.fetchBooks(); // Refresh book list
        
        // Use toast if available or fallback to alert
        if (typeof this.$toast !== 'undefined') {
          this.$toast.success('Book added successfully!');
        } else {
          alert('Book added successfully!');
        }
      } catch (error) {
        console.error('Error adding book:', error);
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.error('Failed to add book. Please try again.');
        } else {
          alert('Failed to add book. Please try again.');
        }
      }
    },
    
    async updateBook() {
      try {
        const bookId = this.editingBook.books_id;
        const updateData = {
          name: this.editingBook.name,
          author_name: this.editingBook.author_name,
          category: this.editingBook.category,
          description: this.editingBook.description
        };
        
        await axios.put(`http://localhost:5000/books/update/${bookId}`, updateData);
        this.closeEditModal();
        await this.fetchBooks(); // Refresh book list
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.success('Book updated successfully!');
        } else {
          alert('Book updated successfully!');
        }
      } catch (error) {
        console.error('Error updating book:', error);
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.error('Failed to update book. Please try again.');
        } else {
          alert('Failed to update book. Please try again.');
        }
      }
    },
    
    async deleteBook(bookId) {
      if (!confirm('Are you sure you want to delete this book?')) {
        return;
      }
      
      try {
        await axios.delete(`http://localhost:5000/books/delete/${bookId}`);
        await this.fetchBooks(); // Refresh book list
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.success('Book deleted successfully!');
        } else {
          alert('Book deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.error('Failed to delete book. Please try again.');
        } else {
          alert('Failed to delete book. Please try again.');
        }
      }
    }
  }
};
</script>

<template>
  <div class="static-container">
    <h1 class="text-2xl font-bold mb-6">Available Books</h1>
    
    <div v-if="loading" class="text-center py-8">
      <p>Loading books...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="book in books" :key="book.books_id" class="book-card border rounded-lg overflow-hidden shadow-md">
        <div class="book-image-container h-48 overflow-hidden bg-gray-100">
          <img 
            :src="getBookImageUrl(book)" 
            :alt="book.name" 
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
        
        <div class="p-4">
          <h2 class="text-xl font-bold mb-2">{{ book.name }}</h2>
          <p class="text-sm text-gray-700 mb-1"><span class="font-medium">Author:</span> {{ book.author_name }}</p>
          <p class="text-sm text-gray-700 mb-2"><span class="font-medium">Category:</span> {{ book.category }}</p>
          <p class="text-sm text-gray-800 mb-4">{{ book.description }}</p>
          
          <div class="flex justify-between items-center mb-2">
            <a 
              v-if="hasStaticResources(book) && book.static_resources.download_url" 
              :href="book.static_resources.download_url" 
              target="_blank" 
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Download PDF
            </a>
            <span v-else class="text-gray-500 text-sm">No PDF available</span>
            
            <button 
              @click="addStaticContent(book.books_id)" 
              class="bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded"
              :disabled="addingIds.includes(book.books_id) || deletingIds.includes(book.books_id)"
            >
              {{ addingIds.includes(book.books_id) ? 'Adding...' : hasStaticResources(book) ? 'Update' : 'Add' }}
            </button>
          </div>
          
          <div v-if="hasStaticResources(book)" class="mt-2 text-right">
            <button 
              @click="deleteStaticContent(book.books_id)" 
              class="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
              :disabled="deletingIds.includes(book.books_id) || addingIds.includes(book.books_id)"
            >
              {{ deletingIds.includes(book.books_id) ? 'Deleting...' : 'Delete Resources' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Notification -->
    <div 
      v-if="notification.show" 
      class="fixed bottom-4 right-4 p-4 rounded-md shadow-md"
      :class="notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaticPage',
  data() {
    return {
      books: [],
      loading: true,
      error: null,
      addingIds: [], // Tracks which books are currently being added
      deletingIds: [], // Tracks which books are currently being deleted
      notification: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  created() {
    this.fetchBooks()
  },
  methods: {
    async fetchBooks() {
      try {
        this.loading = true
        const response = await fetch('http://localhost:5000/books')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`)
        }
        
        this.books = await response.json()
        this.loading = false
      } catch (error) {
        console.error('Error fetching books:', error)
        this.error = 'Failed to load books. Please try again later.'
        this.loading = false
      }
    },
    
    async addStaticContent(bookId) {
      if (this.addingIds.includes(bookId) || this.deletingIds.includes(bookId)) return
      
      this.addingIds.push(bookId)
      try {
        const response = await fetch(`http://localhost:5000/books/static/add/${bookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Empty JSON body as specified
        })
        
        if (!response.ok) {
          throw new Error(`Failed to add static content: ${response.status} ${response.statusText}`)
        }
        
        // Refresh books to get updated data
        await this.fetchBooks()
        
        // Show success notification
        const book = this.books.find(b => b.books_id === bookId)
        const actionText = this.hasStaticResources(book) ? 'updated' : 'added'
        this.showNotification(`Static content ${actionText} successfully!`, 'success')
      } catch (error) {
        console.error('Error adding static content:', error)
        this.showNotification('Failed to add static content. Please try again.', 'error')
      } finally {
        // Remove bookId from addingIds
        const index = this.addingIds.indexOf(bookId)
        if (index > -1) {
          this.addingIds.splice(index, 1)
        }
      }
    },
    
    async deleteStaticContent(bookId) {
      if (this.deletingIds.includes(bookId) || this.addingIds.includes(bookId)) return
      
      // Confirm deletion
      if (!confirm('Are you sure you want to delete the static resources for this book?')) {
        return
      }
      
      this.deletingIds.push(bookId)
      try {
        const response = await fetch(`http://localhost:5000/books/static/delete/${bookId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error(`Failed to delete static content: ${response.status} ${response.statusText}`)
        }
        
        // Refresh books to get updated data
        await this.fetchBooks()
        
        // Show success notification
        this.showNotification('Static resources deleted successfully!', 'success')
      } catch (error) {
        console.error('Error deleting static content:', error)
        this.showNotification('Failed to delete static resources. Please try again.', 'error')
      } finally {
        // Remove bookId from deletingIds
        const index = this.deletingIds.indexOf(bookId)
        if (index > -1) {
          this.deletingIds.splice(index, 1)
        }
      }
    },
    
    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message,
        type
      }
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        this.notification.show = false
      }, 3000)
    },
    
    handleImageError(event) {
      // Replace broken images with a placeholder
      event.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
    },
    
    // Helper to check if a book has static resources
    hasStaticResources(book) {
      return book && book.static_resources !== null && typeof book.static_resources === 'object'
    },
    
    // Helper to get appropriate image URL
    getBookImageUrl(book) {
      if (this.hasStaticResources(book) && book.static_resources.picture_url) {
        return book.static_resources.picture_url
      }
      return 'https://via.placeholder.com/400x300?text=No+Image'
    }
  }
}
</script>

<style scoped>
.static-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.book-card {
  transition: transform 0.2s;
}

.book-card:hover {
  transform: translateY(-5px);
}
</style>

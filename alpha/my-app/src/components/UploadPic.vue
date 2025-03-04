<template>
  <div class="flex flex-col gap-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-primary text-2xl">Picture Upload</h2>
        <p class="mb-4">Upload, update, and manage your pictures</p>
        
        <!-- Upload Form -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Select a picture to upload</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              class="file-input file-input-bordered file-input-primary w-full" 
            />
            <button 
              @click="uploadPicture" 
              class="btn btn-primary" 
              :disabled="!selectedFile || isUploading"
            >
              <span v-if="isUploading">Uploading...</span>
              <span v-else>Upload</span>
            </button>
          </div>
          <div v-if="uploadError" class="text-error mt-2">{{ uploadError }}</div>
        </div>
      </div>
    </div>

    <!-- Image Gallery -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-primary text-2xl">Image Gallery</h2>
        
        <div v-if="isLoading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        
        <div v-else-if="pictures.length === 0" class="alert alert-info">
          No pictures found. Upload some pictures to see them here.
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="picture in pictures" :key="picture.filename" class="card bg-base-200 shadow-md">
            <figure class="px-4 pt-4">
              <img :src="getImageUrl(picture.filename)" alt="Picture" class="rounded-xl object-cover h-48 w-full" />
            </figure>
            <div class="card-body p-4">
              <h3 class="card-title text-sm">{{ picture.filename }}</h3>
              <div class="flex justify-between mt-2">
                <button @click="() => selectForUpdate(picture)" class="btn btn-sm btn-secondary">
                  Update
                </button>
                <button @click="() => deletePicture(picture.filename)" class="btn btn-sm btn-error">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Modal -->
    <div v-if="showUpdateModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg text-primary">Update Picture</h3>
        <p class="py-4">Select a new image to replace "{{ selectedPicture.filename }}"</p>
        
        <input 
          type="file" 
          accept="image/*" 
          @change="handleFileSelect" 
          class="file-input file-input-bordered file-input-primary w-full mb-4" 
        />
        
        <div v-if="updateError" class="text-error mb-4">{{ updateError }}</div>
        
        <div class="modal-action">
          <button @click="closeUpdateModal" class="btn btn-outline">Cancel</button>
          <button 
            @click="updatePicture" 
            class="btn btn-primary" 
            :disabled="!selectedFile || isUploading"
          >
            <span v-if="isUploading">Updating...</span>
            <span v-else>Update</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg text-error">Confirm Deletion</h3>
        <p class="py-4">Are you sure you want to delete "{{ fileToDelete }}"? This action cannot be undone.</p>
        
        <div v-if="deleteError" class="text-error mb-4">{{ deleteError }}</div>
        
        <div class="modal-action">
          <button @click="closeDeleteModal" class="btn btn-outline">Cancel</button>
          <button 
            @click="confirmDelete" 
            class="btn btn-error" 
            :disabled="isDeleting"
          >
            <span v-if="isDeleting">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PicUpload',
  data() {
    return {
      pictures: [],
      selectedFile: null,
      isLoading: false,
      isUploading: false,
      isDeleting: false,
      uploadError: null,
      updateError: null,
      deleteError: null,
      showUpdateModal: false,
      showDeleteModal: false,
      selectedPicture: {},
      fileToDelete: null,
      bookId: 1 // Default book ID - you might want to make this dynamic
    }
  },
  mounted() {
    this.fetchPictures()
  },
  methods: {
    async fetchPictures() {
      this.isLoading = true
      
      try {
        const response = await fetch('http://localhost:5000/pictures')
        if (!response.ok) {
          throw new Error(`Failed to fetch pictures: ${response.statusText}`)
        }
        
        this.pictures = await response.json()
      } catch (error) {
        console.error('Error fetching pictures:', error)
        this.$notification?.error({
          message: 'Error',
          description: 'Failed to load pictures. Please try again later.'
        })
      } finally {
        this.isLoading = false
      }
    },
    
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0]
      this.uploadError = null
      this.updateError = null
    },
    
    async uploadPicture() {
      if (!this.selectedFile) {
        this.uploadError = 'Please select a file first'
        return
      }
      
      this.isUploading = true
      this.uploadError = null
      
      try {
        const formData = new FormData()
        formData.append('picture', this.selectedFile)
        
        const response = await fetch(`http://localhost:5000/pictures?book_id=${this.bookId}`, {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }
        
        // Reset file input
        this.selectedFile = null
        
        // Refresh picture list
        await this.fetchPictures()
        
        // Success notification
        this.$notification?.success({
          message: 'Success',
          description: 'Picture uploaded successfully!'
        })
      } catch (error) {
        console.error('Error uploading picture:', error)
        this.uploadError = `Failed to upload: ${error.message}`
      } finally {
        this.isUploading = false
      }
    },
    
    selectForUpdate(picture) {
      this.selectedPicture = picture
      this.showUpdateModal = true
      this.selectedFile = null
      this.updateError = null
    },
    
    closeUpdateModal() {
      this.showUpdateModal = false
      this.selectedPicture = {}
      this.selectedFile = null
    },
    
    async updatePicture() {
      if (!this.selectedFile) {
        this.updateError = 'Please select a file first'
        return
      }
      
      this.isUploading = true
      this.updateError = null
      
      try {
        const formData = new FormData()
        formData.append('picture', this.selectedFile)
        
        const response = await fetch(`http://localhost:5000/pictures?filename=${this.selectedPicture.filename}`, {
          method: 'PUT',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Update failed: ${response.statusText}`)
        }
        
        // Close modal and reset
        this.closeUpdateModal()
        
        // Refresh picture list
        await this.fetchPictures()
        
        // Success notification
        this.$notification?.success({
          message: 'Success',
          description: 'Picture updated successfully!'
        })
      } catch (error) {
        console.error('Error updating picture:', error)
        this.updateError = `Failed to update: ${error.message}`
      } finally {
        this.isUploading = false
      }
    },
    
    deletePicture(filename) {
      this.fileToDelete = filename
      this.showDeleteModal = true
      this.deleteError = null
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false
      this.fileToDelete = null
    },
    
    async confirmDelete() {
      if (!this.fileToDelete) return
      
      this.isDeleting = true
      this.deleteError = null
      
      try {
        const response = await fetch(`http://localhost:5000/pictures?filename=${this.fileToDelete}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error(`Delete failed: ${response.statusText}`)
        }
        
        // Close modal and reset
        this.closeDeleteModal()
        
        // Refresh picture list
        await this.fetchPictures()
        
        // Success notification
        this.$notification?.success({
          message: 'Success',
          description: 'Picture deleted successfully!'
        })
      } catch (error) {
        console.error('Error deleting picture:', error)
        this.deleteError = `Failed to delete: ${error.message}`
      } finally {
        this.isDeleting = false
      }
    },
    
    getImageUrl(filename) {
      // Return URL for the image - adjust as needed for your backend
      return `http://localhost:5000/pictures/${filename}`
    }
  }
}
</script>

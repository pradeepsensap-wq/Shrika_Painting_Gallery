// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGV1XK3dXK8P8n_-Q8vVq5pZ0Z9pJ8n_k",
    authDomain: "shrika-painting-gallery.firebaseapp.com",
    projectId: "shrika-painting-gallery",
    storageBucket: "shrika-painting-gallery.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Load paintings from Firestore on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPaintings();
    
    // Add event listener to the form
    document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
    
    // Listen for real-time updates
    listenForPaintingUpdates();
});

let currentPaintingIndex = 0;
let allPaintings = [];

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('paintingTitle').value;
    const description = document.getElementById('paintingDescription').value;
    const year = document.getElementById('paintingYear').value;
    const imageInput = document.getElementById('paintingImage');
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    
    // Read the image file
    const file = imageInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const imageData = event.target.result;
        const fileName = `paintings/${Date.now()}_${file.name}`;
        const storageRef = storage.ref(fileName);
        
        // Convert base64 to blob for upload
        const blob = dataURItoBlob(imageData);
        
        // Upload image to Firebase Storage
        storageRef.put(blob).then(snapshot => {
            // Get the download URL
            return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {
            // Create painting object
            const painting = {
                title: title,
                description: description,
                year: year || 'Unknown',
                imageUrl: downloadURL,
                createdAt: new Date()
            };
            
            // Save to Firestore
            return db.collection('paintings').add(painting);
        }).then(() => {
            // Reset form
            document.getElementById('uploadForm').reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Show success message
            alert('Painting added successfully! 🎉');
        }).catch(error => {
            console.error('Error uploading painting:', error);
            alert('Error uploading painting. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    };
    
    reader.readAsDataURL(file);
}

// Convert data URI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].match(/:(.*?);/)[1];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Load and display paintings from Firestore
function loadPaintings() {
    db.collection('paintings').orderBy('createdAt', 'desc').limit(100).get().then(snapshot => {
        allPaintings = [];
        snapshot.forEach(doc => {
            allPaintings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        currentPaintingIndex = 0;
        displayCurrentPainting();
        updateButtonStates();
    }).catch(error => {
        console.error('Error loading paintings:', error);
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '<p class="error-message">Error loading paintings. Please refresh the page.</p>';
    });
}

// Listen for real-time updates from Firestore
function listenForPaintingUpdates() {
    db.collection('paintings').orderBy('createdAt', 'desc').limit(100)
        .onSnapshot(snapshot => {
            allPaintings = [];
            snapshot.forEach(doc => {
                allPaintings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            if (currentPaintingIndex >= allPaintings.length && allPaintings.length > 0) {
                currentPaintingIndex = allPaintings.length - 1;
            }
            
            displayCurrentPainting();
            updateButtonStates();
        });
}

// Display current painting
function displayCurrentPainting() {
    const gallery = document.getElementById('gallery');
    const emptyMessage = document.getElementById('emptyMessage');
    
    // Clear gallery
    gallery.innerHTML = '';
    
    if (allPaintings.length === 0) {
        emptyMessage.style.display = 'block';
        document.getElementById('prevBtn').disabled = true;
        document.getElementById('nextBtn').disabled = true;
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    const painting = allPaintings[currentPaintingIndex];
    const card = createPaintingCard(painting);
    gallery.appendChild(card);
}

// Update arrow button states
function updateButtonStates() {
    document.getElementById('prevBtn').disabled = currentPaintingIndex === 0;
    document.getElementById('nextBtn').disabled = currentPaintingIndex === allPaintings.length - 1;
}

// Create a painting card element
function createPaintingCard(painting) {
    const card = document.createElement('div');
    card.className = 'painting-card';
    
    card.innerHTML = `
        <img src="${painting.imageUrl}" alt="${painting.title}" class="painting-image">
        <div class="painting-info">
            <h3 class="painting-title">${escapeHtml(painting.title)}</h3>
            <p class="painting-year">Year: ${painting.year}</p>
            <p class="painting-description">${escapeHtml(painting.description)}</p>
            <div class="painting-actions">
                <button class="btn-view" onclick="viewPainting('${painting.id}')">View</button>
                <button class="btn-delete" onclick="deletePainting('${painting.id}')">Delete</button>
            </div>
        </div>
    `;
    
    return card;
}

// View painting in modal
function viewPainting(id) {
    const painting = allPaintings.find(p => p.id === id);
    
    if (!painting) return;
    
    const modal = document.getElementById('viewModal') || createModal();
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
        <button class="close-btn" onclick="closeModal()">&times;</button>
        <img src="${painting.imageUrl}" alt="${painting.title}" class="modal-image">
        <h2 class="modal-title">${escapeHtml(painting.title)}</h2>
        <p class="modal-year">Year Created: ${painting.year}</p>
        <p class="modal-description">${escapeHtml(painting.description)}</p>
    `;
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('viewModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Delete painting
function deletePainting(id) {
    if (confirm('Are you sure you want to delete this painting?')) {
        db.collection('paintings').doc(id).delete().then(() => {
            console.log('Painting deleted successfully');
        }).catch(error => {
            console.error('Error deleting painting:', error);
            alert('Error deleting painting. Please try again.');
        });
    }
}

// Create modal element if it doesn't exist
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'viewModal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content"></div>';
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    document.body.appendChild(modal);
    return modal;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Scroll gallery
function scrollGallery(direction) {
    if (allPaintings.length === 0) return;
    
    currentPaintingIndex += direction;
    
    // Clamp index between 0 and allPaintings.length - 1
    if (currentPaintingIndex < 0) currentPaintingIndex = 0;
    if (currentPaintingIndex >= allPaintings.length) currentPaintingIndex = allPaintings.length - 1;
    
    displayCurrentPainting();
    updateButtonStates();
}

// Load paintings from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPaintings();
    
    // Add event listener to the form
    document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
});

let currentPaintingIndex = 0;

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('paintingTitle').value;
    const description = document.getElementById('paintingDescription').value;
    const year = document.getElementById('paintingYear').value;
    const imageInput = document.getElementById('paintingImage');
    
    // Read the image file
    const file = imageInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const imageData = event.target.result;
        
        // Create painting object
        const painting = {
            id: Date.now(),
            title: title,
            description: description,
            year: year || 'Unknown',
            image: imageData
        };
        
        // Get existing paintings from localStorage temporarily
        let paintings = JSON.parse(localStorage.getItem('paintings')) || [];
        paintings.push(painting);
        
        // Save to localStorage
        localStorage.setItem('paintings', JSON.stringify(paintings));
        
        // Reset form
        document.getElementById('uploadForm').reset();
        
        // Show alert with instructions
        alert('Painting added to your gallery!\n\nTo share with friends:\n1. Export the painting as an image file\n2. Add it to the "images" folder in your GitHub repository\n3. Update paintings.json with the new painting details\n4. Push to GitHub');
        
        // Reload gallery
        loadPaintings();
    };
    
    reader.readAsDataURL(file);
}

// Load and display paintings from JSON file
function loadPaintings() {
    fetch('paintings.json')
        .then(response => response.json())
        .then(paintings => {
            const gallery = document.getElementById('gallery');
            const emptyMessage = document.getElementById('emptyMessage');
            
            if (paintings.length === 0) {
                emptyMessage.style.display = 'block';
                document.getElementById('prevBtn').disabled = true;
                document.getElementById('nextBtn').disabled = true;
                return;
            }
            
            emptyMessage.style.display = 'none';
            currentPaintingIndex = 0;
            
            // Display only the current painting
            displayCurrentPainting(paintings);
            
            // Update button states
            updateButtonStates(paintings.length);
        })
        .catch(error => {
            console.error('Error loading paintings:', error);
            document.getElementById('emptyMessage').style.display = 'block';
        });
}

// Display current painting
function displayCurrentPainting(paintings) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    if (paintings.length === 0) return;
    
    const painting = paintings[currentPaintingIndex];
    const card = createPaintingCard(painting);
    gallery.appendChild(card);
}

// Update arrow button states
function updateButtonStates(totalPaintings) {
    document.getElementById('prevBtn').disabled = currentPaintingIndex === 0;
    document.getElementById('nextBtn').disabled = currentPaintingIndex === totalPaintings - 1;
}

// Create a painting card element
function createPaintingCard(painting) {
    const card = document.createElement('div');
    card.className = 'painting-card';
    
    card.innerHTML = `
        <img src="${painting.image}" alt="${painting.title}" class="painting-image">
        <div class="painting-info">
            <h3 class="painting-title">${escapeHtml(painting.title)}</h3>
            <p class="painting-year">Year: ${painting.year}</p>
            <p class="painting-description">${escapeHtml(painting.description)}</p>
            <div class="painting-actions">
                <button class="btn-view" onclick="viewPainting(${painting.id})">View</button>
                <button class="btn-delete" onclick="deletePainting(${painting.id})">Delete</button>
            </div>
        </div>
    `;
    
    return card;
}

// View painting in modal
function viewPainting(id) {
    const paintings = JSON.parse(localStorage.getItem('paintings')) || [];
    const painting = paintings.find(p => p.id === id);
    
    if (!painting) return;
    
    const modal = document.getElementById('viewModal') || createModal();
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
        <button class="close-btn" onclick="closeModal()">&times;</button>
        <img src="${painting.image}" alt="${painting.title}" class="modal-image">
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
        let paintings = JSON.parse(localStorage.getItem('paintings')) || [];
        paintings = paintings.filter(p => p.id !== id);
        localStorage.setItem('paintings', JSON.stringify(paintings));
        loadPaintings();
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
    const paintings = JSON.parse(localStorage.getItem('paintings')) || [];
    
    if (paintings.length === 0) return;
    
    currentPaintingIndex += direction;
    
    // Clamp index between 0 and paintings.length - 1
    if (currentPaintingIndex < 0) currentPaintingIndex = 0;
    if (currentPaintingIndex >= paintings.length) currentPaintingIndex = paintings.length - 1;
    
    displayCurrentPainting(paintings);
    updateButtonStates(paintings.length);
}

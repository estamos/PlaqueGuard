// Initialize Cropper.js for both images
document.addEventListener('DOMContentLoaded', function() {
    const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
    let cropper;
    let currentImageType = '';
    
    // Initialize cropper when modal is shown
    document.getElementById('cropModal').addEventListener('shown.bs.modal', function() {
        const image = document.getElementById('modalImage');
        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
            checkCrossOrigin: false
        });
    });
    
    // Destroy cropper when modal is hidden
    document.getElementById('cropModal').addEventListener('hidden.bs.modal', function() {
        if (cropper) {
            cropper.destroy();
        }
    });
    
    // Save cropped image
    document.getElementById('saveCrop').addEventListener('click', function() {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 256,
                height: 256,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });
            
            const croppedImage = canvas.toDataURL('image/jpeg');
            
            if (currentImageType === 'systolic') {
                document.getElementById('systolicImage').src = croppedImage;
                systolicImage = croppedImage;
            } else {
                document.getElementById('diastolicImage').src = croppedImage;
                diastolicImage = croppedImage;
            }
            
            cropModal.hide();
        }
    });
    
    // Open crop modal for systolic image
    document.getElementById('cropSystolic').addEventListener('click', function() {
        currentImageType = 'systolic';
        document.getElementById('modalImage').src = document.getElementById('systolicImage').src;
        cropModal.show();
    });
    
    // Open crop modal for diastolic image
    document.getElementById('cropDiastolic').addEventListener('click', function() {
        currentImageType = 'diastolic';
        document.getElementById('modalImage').src = document.getElementById('diastolicImage').src;
        cropModal.show();
    });
});

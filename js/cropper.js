// Initialize Cropper.js for both images
document.addEventListener('DOMContentLoaded', function() {
    const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
    let cropper;
    let currentImageType = '';
    let systolicImage = null;
    let diastolicImage = null;

    // Initialize cropper when modal is shown
    document.getElementById('cropModal').addEventListener('shown.bs.modal', function() {
        const image = document.getElementById('modalImage');

        // Ensure image is loaded before initializing cropper
        if (image.complete) {
            initCropper(image);
        } else {
            image.onload = function() {
                initCropper(image);
            };
        }
    });

    function initCropper(image) {
        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(image, {
            aspectRatio: NaN, // This allows freeform cropping
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
            checkCrossOrigin: false,
            movable: true,
            rotatable: true,
            scalable: true,
            zoomable: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            ready: function() {
                // Add custom controls
                addCropperControls();
            }
        });
    }

    function addCropperControls() {
        const modalBody = document.querySelector('.modal-body');

        // Remove existing controls if any
        const existingControls = document.getElementById('cropper-controls');
        if (existingControls) {
            existingControls.remove();
        }

        // Create control buttons container
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'cropper-controls';
        controlsDiv.className = 'd-flex justify-content-center gap-2 my-3';

        // Add aspect ratio buttons
        const ratios = {
            'Freeform': NaN,
            '1:1': 1,
            '4:3': 4/3,
            '16:9': 16/9
        };

        for (const [label, ratio] of Object.entries(ratios)) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-primary';
            btn.textContent = label;
            btn.onclick = () => {
                cropper.setAspectRatio(ratio);
                if (isNaN(ratio)) {
                    cropper.setDragMode('crop'); // Reset to freeform mode
                }
            };
            controlsDiv.appendChild(btn);
        }

        // Add rotate buttons
        const rotateLeftBtn = document.createElement('button');
        rotateLeftBtn.className = 'btn btn-sm btn-outline-secondary';
        rotateLeftBtn.innerHTML = '<i class="fas fa-undo"></i>';
        rotateLeftBtn.onclick = () => cropper.rotate(-45);
        controlsDiv.appendChild(rotateLeftBtn);

        const rotateRightBtn = document.createElement('button');
        rotateRightBtn.className = 'btn btn-sm btn-outline-secondary';
        rotateRightBtn.innerHTML = '<i class="fas fa-redo"></i>';
        rotateRightBtn.onclick = () => cropper.rotate(45);
        controlsDiv.appendChild(rotateRightBtn);

        // Add reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-sm btn-outline-danger';
        resetBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Reset';
        resetBtn.onclick = () => cropper.reset();
        controlsDiv.appendChild(resetBtn);

        modalBody.appendChild(controlsDiv);
    }

    // Destroy cropper when modal is hidden
    document.getElementById('cropModal').addEventListener('hidden.bs.modal', function() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });

    // Save cropped image
    document.getElementById('saveCrop').addEventListener('click', function() {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
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

            // Check if analysis can be performed now
            if (typeof checkAnalysisReady === 'function') {
                checkAnalysisReady();
            }
        }
    });

    // Open crop modal for systolic image
    document.getElementById('cropSystolic').addEventListener('click', function() {
        const imgSrc = document.getElementById('systolicImage').src;
        if (!imgSrc) return;

        currentImageType = 'systolic';
        document.getElementById('modalImage').src = imgSrc;
        cropModal.show();
    });

    // Open crop modal for diastolic image
    document.getElementById('cropDiastolic').addEventListener('click', function() {
        const imgSrc = document.getElementById('diastolicImage').src;
        if (!imgSrc) return;

        currentImageType = 'diastolic';
        document.getElementById('modalImage').src = imgSrc;
        cropModal.show();
    });
});
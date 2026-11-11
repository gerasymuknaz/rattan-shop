// Admin JavaScript Helper
document.addEventListener('DOMContentLoaded', function () {
    // Image file upload preview
    const imageFileInput = document.getElementById('imageFile');
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreview = document.getElementById('imagePreview');
    const placeholderIcon = document.getElementById('placeholderIcon');

    if (imageFileInput && imagePreview) {
        imageFileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    if (placeholderIcon) placeholderIcon.style.display = 'none';
                };
                reader.readAsDataURL(file);
                // Clear URL input if file is chosen
                if (imageUrlInput) imageUrlInput.value = '';
            }
        });
    }

    if (imageUrlInput && imagePreview) {
        imageUrlInput.addEventListener('input', function () {
            const url = this.value.trim();
            if (url) {
                imagePreview.src = url;
                imagePreview.style.display = 'block';
                if (placeholderIcon) placeholderIcon.style.display = 'none';
            } else if (!imageFileInput || !imageFileInput.files.length) {
                // If input cleared and no file chosen
                const initialSrc = imagePreview.getAttribute('data-initial-src');
                if (initialSrc) {
                    imagePreview.src = initialSrc;
                } else {
                    imagePreview.style.display = 'none';
                    if (placeholderIcon) placeholderIcon.style.display = 'block';
                }
            }
        });
    }

    // Auto dismiss alerts after 5 seconds
    setTimeout(function () {
        $('.alert:not(.alert-permanent)').fadeOut('slow');
    }, 5000);
});


// src/utils/imageUtils.js - COMPLETE FIXED VERSION

const BASE_URL = 'http://localhost:8085';

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('❌ getImageUrl: No image path provided');
    return null;
  }

  console.log('🖼️ Processing media path:', imagePath);

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove any query parameters or fragments
  let cleanedPath = imagePath.split('?')[0].split('#')[0];

  // Ensure the path starts correctly
  if (!cleanedPath.startsWith('media/') && !cleanedPath.startsWith('/media/')) {
    // Add media/ prefix if not present
    cleanedPath = `media/${cleanedPath}`;
  }

  // Remove leading slash for consistency
  cleanedPath = cleanedPath.replace(/^\/+/, '');

  // Construct the full URL
  const fullUrl = `${BASE_URL}/${cleanedPath}`;
  console.log('✅ Final URL:', fullUrl);

  return fullUrl;
};

export const isVideoFile = (filename) => {
  if (!filename) return false;
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.webm', '.mkv'];
  // const extension = filename.toLowerCase().split('.').pop();
  return videoExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext.toLowerCase())
  );
};

export const isImageFile = (filename) => {
  if (!filename) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext.toLowerCase())
  );
};

export const getFileType = (filename) => {
  if (!filename) return 'unknown';
  if (isVideoFile(filename)) return 'video';
  if (isImageFile(filename)) return 'image';
  return 'unknown';
};

// Enhanced error handling
export const handleMediaError = (e, productName = 'Unknown', type = 'image') => {
  console.error(`❌ ${type} failed to load:`, {
    src: e.target.src,
    product: productName,
    element: e.target.tagName
  });

  // Hide the broken media element
  e.target.style.display = 'none';

  // Show placeholder
  const parent = e.target.parentNode;
  let placeholder = parent.querySelector('.placeholder-image, .image-placeholder');

  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.className = 'placeholder-image';
    placeholder.innerHTML = `
      <div class="placeholder-content">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span>Media not available</span>
      </div>
    `;
    parent.appendChild(placeholder);
  }

  placeholder.style.display = 'flex';
};

export const handleMediaLoad = (e, productName = 'Unknown') => {
  console.log('✅ Media loaded successfully:', {
    src: e.target.src,
    product: productName,
    element: e.target.tagName
  });

  // Hide any placeholder
  const parent = e.target.parentNode;
  const placeholder = parent.querySelector('.placeholder-image, .image-placeholder');
  if (placeholder) {
    placeholder.style.display = 'none';
  }

  // Show the media element
  e.target.style.display = 'block';
  e.target.style.opacity = '1';
};

// Test if URL is accessible
export const testMediaUrl = async (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, 3000);

    fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response.ok);
      })
      .catch(error => {
        console.log('Test fetch error:', error);
        clearTimeout(timeoutId);
        resolve(false);
      });
  });
};

// Get placeholder image
export const getPlaceholderImage = (width = 300, height = 400) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f0f0f0'/%3E%3Ctext x='150' y='200' font-family='Arial' font-size='14' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E`;
};

// Preload images
export const preloadImages = async (imageUrls) => {
  const promises = imageUrls.map(url => {
    if (!url) return Promise.resolve();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = () => {
        console.log('Failed to preload:', url);
        resolve();
      };
      img.src = url;
    });
  });

  await Promise.all(promises);
};

// Debug function
export const debugImageUrls = async (product) => {
  if (!product || !product.images) return;

  console.group('🔍 Image URL Debug for:', product.name);
  for (let i = 0; i < product.images.length; i++) {
    const imgPath = product.images[i];
    const url = getImageUrl(imgPath);
    const type = getFileType(imgPath);

    console.log(`Media ${i}:`, {
      original: imgPath,
      constructed: url,
      type: type
    });

    if (url) {
      const loaded = await testMediaUrl(url);
      console.log(`Media ${i} (${type}):`, loaded ? '✅ Accessible' : '❌ Not accessible');
    } else {
      console.log(`Media ${i}: ❌ No URL generated`);
    }
  }
  console.groupEnd();
};
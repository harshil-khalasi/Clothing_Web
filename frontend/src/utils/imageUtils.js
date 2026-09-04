/**
 * Universal image URL resolver for local & production environments.
 * Converts 'localhost:5000' or relative '/uploads/...' paths to use current host's IP/hostname,
 * ensuring image display works seamlessly across desktop, mobile devices, and local LAN networks.
 */
export const getImageUrl = (url) => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
  }

  // If url is an array, take the first element
  if (Array.isArray(url)) {
    return getImageUrl(url[0]);
  }

  let finalUrl = url;

  // Replace hardcoded localhost with the actual hostname (crucial for mobile testing on LAN)
  if (finalUrl.includes('localhost:5000')) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    finalUrl = finalUrl.replace('localhost', currentHost);
  }

  // If it's a relative uploads path
  if (finalUrl.startsWith('/uploads') || finalUrl.startsWith('uploads/')) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const cleanPath = finalUrl.startsWith('/') ? finalUrl : `/${finalUrl}`;
    finalUrl = `http://${currentHost}:5000${cleanPath}`;
  }

  return finalUrl;
};

export const handleImageError = (e, fallbackUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800') => {
  if (e?.target) {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = fallbackUrl;
  }
};

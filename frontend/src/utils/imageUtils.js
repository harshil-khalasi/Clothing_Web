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

  const getBackendBase = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl) return apiUrl.replace(/\/api\/?$/, '');
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${currentHost}:5000`;
  };

  const backendBase = getBackendBase();

  // Replace hardcoded localhost:5000 with the actual backend base URL
  if (finalUrl.includes('localhost:5000')) {
    finalUrl = finalUrl.replace(/https?:\/\/localhost:5000/, backendBase);
  }

  // If it's a relative uploads path
  if (finalUrl.startsWith('/uploads') || finalUrl.startsWith('uploads/')) {
    const cleanPath = finalUrl.startsWith('/') ? finalUrl : `/${finalUrl}`;
    finalUrl = `${backendBase}${cleanPath}`;
  }

  return finalUrl;
};

export const handleImageError = (e, fallbackUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800') => {
  if (e?.target) {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = fallbackUrl;
  }
};

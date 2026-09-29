/**
 * Resolves full URL for images that might be stored as relative paths on the backend
 * @param {string} imagePath - relative path (e.g. /uploads/blogs/image.jpg) or full URL
 * @returns {string|null} - absolute URL or original path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (typeof imagePath !== 'string') return imagePath;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
  const cleanBackend = backendUrl.replace(/\/+$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBackend}${cleanPath}`;
};

export default getImageUrl;

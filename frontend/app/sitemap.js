import { getBlogs } from '@/lib/api/blog';
import { getServices, getAllLocationServices } from '@/lib/api/service';
import { getLocations } from '@/lib/api/location';

const BASE_URL = process.env.NEXT_FRONTEND_BASE_URL;
console.log(BASE_URL, "HOST_URL");

export default async function sitemap() {
  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/blogs',
    '/gallery',
    '/contact',
    '/privacy_policy',
    '/products',
    '/projects',
    '/solar',
    '/thank-you',
    '/data-deletion',
    '/locations'
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes - Blogs
  let blogRoutes = [];
  try {
    const blogsData = await getBlogs();
    const blogs = blogsData?.data || [];
    blogRoutes = blogs.map((blog) => ({
      url: `${BASE_URL}/blogs/${blog.slug}`,
      lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  // Dynamic routes - Services
  let serviceRoutes = [];
  try {
    const servicesData = await getServices();
    const services = servicesData?.items || [];
    serviceRoutes = services.map((service) => ({
      url: `${BASE_URL}/services/${service.slug}`,
      lastModified: new Date(service.updatedAt || service.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching services for sitemap:', error);
  }

  // Dynamic routes - Location Services
  let locationServiceRoutes = [];
  try {
    const locationServicesData = await getAllLocationServices();
    const locationServices = locationServicesData?.items || [];
    locationServiceRoutes = locationServices.map((locationService) => ({
      url: `${BASE_URL}/services/${locationService.slug}`,
      lastModified: new Date(locationService.updatedAt || locationService.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching location services for sitemap:', error);
  }

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...serviceRoutes,
    ...locationServiceRoutes,
  ];
}

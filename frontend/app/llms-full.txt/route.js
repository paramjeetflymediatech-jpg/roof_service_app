import { getBlogs } from '@/lib/api/blog';
import { getServices } from '@/lib/api/service';

const BASE_URL = process.env.NEXT_FRONTEND_BASE_URL;
console.log(BASE_URL, "url");

export async function GET() {
  let content = `# Mainstreet Roofing Solutions - Full Content\n\n`;
  content += `Comprehensive details about our roofing services and insights.\n\n`;

  try {
    const servicesData = await getServices();
    const services = servicesData?.items || [];
    
    if (services.length > 0) {
      content += `# SERVICES\n\n`;
      services.forEach((service) => {
        content += `## ${service.name || service.title}\n`;
        content += `${(service.description || service.shortDescription || '').replace(/<[^>]*>?/gm, '')}\n`;
        content += `URL: ${BASE_URL}/services/${service.slug}\n\n`;
      });
    }
  } catch (error) {
    console.error('Error fetching services for llms-full.txt:', error);
  }

  try {
    const blogsData = await getBlogs();
    const blogs = blogsData?.data || [];

    if (blogs.length > 0) {
      content += `# BLOG POSTS\n\n`;
      blogs.forEach((blog) => {
        content += `## ${blog.title}\n`;
        content += `${(blog.content || blog.excerpt || '').replace(/<[^>]*>?/gm, '')}\n`;
        content += `URL: ${BASE_URL}/blogs/${blog.slug}\n\n`;
      });
    }
  } catch (error) {
    console.error('Error fetching blogs for llms-full.txt:', error);
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

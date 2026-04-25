import { getBlogs } from '@/lib/api/blog';
import { getServices } from '@/lib/api/service';

const BASE_URL = process.env.NEXT_FRONTEND_BASE_URL;
console.log(BASE_URL, "url");
export async function GET() {
  let content = `# Mainstreet Roofing Solutions\n\n`;
  content += `Welcome to Mainstreet Roofing LTD - Premium Roofing Solutions. We are a family-run business with over 20 years of experience serving Accrington, Burnley, Hyndburn, Blackburn, and surrounding areas.\n\n`;

  try {
    const servicesData = await getServices();
    const services = servicesData?.items || [];
    
    if (services.length > 0) {
      content += `## Our Services\n\n`;
      services.forEach((service) => {
        content += `### ${service.name || service.title}\n`;
        content += `${(service.shortDescription || service.description || '').replace(/<[^>]*>?/gm, '')}\n`;
        content += `[Learn More](${BASE_URL}/services/${service.slug})\n\n`;
      });
    }
  } catch (error) {
    console.error('Error fetching services for llms.txt:', error);
  }

  try {
    const blogsData = await getBlogs();
    const blogs = blogsData?.data || [];

    if (blogs.length > 0) {
      content += `## Latest Blogs & Insights\n\n`;
      blogs.forEach((blog) => {
        content += `### ${blog.title}\n`;
        content += `${(blog.excerpt || blog.content || '').substring(0, 200).replace(/<[^>]*>?/gm, '')}...\n`;
        content += `[Read More](${BASE_URL}/blogs/${blog.slug})\n\n`;
      });
    }
  } catch (error) {
    console.error('Error fetching blogs for llms.txt:', error);
  }

  content += `## Contact Information\n\n`;
  content += `- Phone: [604-720-4313](tel:604-720-4313)\n`;
  content += `- Email: [mainstreetroofing604@gmail.com](mailto:mainstreetroofing604@gmail.com)\n`;
  content += `- Website: ${BASE_URL}\n`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

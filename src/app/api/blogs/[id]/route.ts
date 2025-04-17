import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Blog } from '@/lib/db/models/Blog';
import { authMiddleware } from '@/lib/auth/middleware';
import { deleteImage } from '@/lib/cloudinary';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a single blog
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const auth = await authMiddleware(request);

    if ('error' in auth) {
      return auth;
    }

    const { id } = params;

    // Connect to database
    await connectToDatabase();

    // Get blog
    const blog = await Blog.findById(id).populate('author', 'name email');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PATCH - Update a blog
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const auth = await authMiddleware(request);

    if ('error' in auth) {
      return auth;
    }

    const { id } = params;
    const data = await request.json();

    // Connect to database
    await connectToDatabase();

    // Find blog
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check authorization (only author or admin can update)
    if (blog.author.toString() !== auth.userId && auth.userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to update this blog' },
        { status: 403 }
      );
    }

    // Check if slug is being changed and already exists
    if (data.slug && data.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: data.slug });

      if (existingBlog) {
        return NextResponse.json(
          { error: 'A blog with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    ).populate('author', 'name email');

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const auth = await authMiddleware(request);

    if ('error' in auth) {
      return auth;
    }

    const { id } = params;

    // Connect to database
    await connectToDatabase();

    // Find blog
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check authorization (only author or admin can delete)
    if (blog.author.toString() !== auth.userId && auth.userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this blog' },
        { status: 403 }
      );
    }

    // Delete cover image from Cloudinary if it's from Cloudinary
    if (blog.coverImage && blog.coverImage.includes('cloudinary')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = blog.coverImage.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `blog_images/${publicIdWithExt.split('.')[0]}`;

        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting cover image:', error);
        // Continue with blog deletion even if image deletion fails
      }
    }

    // Delete blog
    await Blog.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Blog deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}

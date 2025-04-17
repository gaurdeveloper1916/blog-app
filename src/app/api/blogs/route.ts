import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Blog } from '@/lib/db/models/Blog';
import { authMiddleware } from '@/lib/auth/middleware';

// GET all blogs
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await authMiddleware(request);

    if ('error' in auth) {
      return auth;
    }

    // Connect to database
    await connectToDatabase();

    // Get search params
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Create query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get blogs
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');

    // Get total count
    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await authMiddleware(request);

    if ('error' in auth) {
      return auth;
    }

    // Connect to database
    await connectToDatabase();

    // Get blog data
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content || !data.excerpt || !data.coverImage) {
      return NextResponse.json(
        { error: 'Title, content, excerpt, and cover image are required' },
        { status: 400 }
      );
    }

    // Create slug from title if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: data.slug });

    if (existingBlog) {
      return NextResponse.json(
        { error: 'A blog with this slug already exists' },
        { status: 409 }
      );
    }

    // Create blog
    const blog = await Blog.create({
      ...data,
      author: auth.userId,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}

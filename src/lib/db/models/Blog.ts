import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  content: {
    type: Object,
    required: [true, 'Content is required'],
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
});

// Update timestamps
blogSchema.pre('findOneAndUpdate', function () {
  this.set({ updatedAt: Date.now() });

  // If status is being set to published and publishedAt is not set, set it
  const update = this.getUpdate() as any;
  if (update?.status === 'published' && !update.publishedAt) {
    this.set({ publishedAt: Date.now() });
  }
});

export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

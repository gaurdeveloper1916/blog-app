'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/editor/ImageUpload';
import { Loader2, Save, ArrowLeft, EyeOff, Eye } from 'lucide-react';
import Link from 'next/link';
import TinyEditor from '../../../../components/editor/Tinyeditor';

const blogSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  slug: z.string().min(5, { message: 'Slug must be at least 5 characters' }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  excerpt: z.string().min(10, { message: 'Excerpt must be at least 10 characters' }),
  content: z.any(),
  coverImage: z.string().min(1, { message: 'Cover image is required' }),
  status: z.enum(['draft', 'published']),
});


export default function EditBlogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: {},
      coverImage: '',
      status: 'draft',
    },
  });

  const generateSlug = () => {
    const title = form.getValues('title');
    if (!title) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    form.setValue('slug', slug, { shouldValidate: true });
  };

  const handleUploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleCoverImageUpload = (url) => {
    form.setValue('coverImage', url, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/blogs', {
        method: 'PUT', // or PATCH if preferred
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update blog');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: `Blog ${data.status === 'published' ? 'updated & published' : 'updated as draft'} successfully`,
      });

      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update blog',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/blogs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title Field */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter blog title"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!form.getValues('slug') || form.getValues('slug') === form.getValues('title').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
                                setTimeout(generateSlug, 300);
                              }
                            }}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Slug Field */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="blog-post-slug"
                              {...field}
                              disabled={isSubmitting}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generateSlug}
                              disabled={!form.getValues('title') || isSubmitting}
                            >
                              Generate
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Excerpt Field */}
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief summary of the blog post"
                            className="resize-none min-h-[80px]"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Cover Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={handleCoverImageUpload}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Content Editor */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {/* <RichTextEditor
                            initialContent={field.value}
                            onChange={field.onChange}
                            handleUploadImage={handleUploadImage}
                          /> */}
                          <TinyEditor
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setValue('status', 'draft');
                    form.handleSubmit(onSubmit)();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting && form.getValues('status') === 'draft' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <EyeOff className="mr-2 h-4 w-4" />
                  Update Draft
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    form.setValue('status', 'published');
                    form.handleSubmit(onSubmit)();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting && form.getValues('status') === 'published' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Eye className="mr-2 h-4 w-4" />
                  Update & Publish
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

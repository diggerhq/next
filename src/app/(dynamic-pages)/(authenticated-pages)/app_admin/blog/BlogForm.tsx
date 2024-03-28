'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableInsertPayload, TableUpdatePayload } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';
import { Control, Controller, useController, useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import slugify from 'slugify';

import {
  internalBlogPostSchema,
  InternalBlogPostSchema,
} from '@/utils/zod-schemas/internalBlog';
import Trash from 'lucide-react/dist/esm/icons/trash';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UploadBlogImage } from './post/UploadBlogImage';

import { TipTapEditor } from '@/components/TipTapEditor';
import { Editor } from '@tiptap/core';
import { toast } from 'sonner';

const defaultContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Example ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'bold',
            },
          ],
          text: 'Text',
        },
      ],
    },
  ],
};

const darkThemeStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: '#1F2937', // slate-900 from Tailwind's color palette
    borderColor: '#374151', // gray-600 from Tailwind's color palette
    color: '#D1D5DB', // slate-200 from Tailwind's color palette
    '&:hover': {
      borderColor: '#4B5563', // slate-600 from Tailwind's color palette
    },
  }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected
      ? '#374151' // slate-700 from Tailwind's color palette
      : isFocused
        ? '#111827' // slate-950 from Tailwind's color palette
        : '#1F2937', // slate-900 from Tailwind's color palette
    color: '#D1D5DB', // slate-200 from Tailwind's color palette
  }),
  singleValue: (styles) => ({
    ...styles,
    color: '#D1D5DB', // slate-200 from Tailwind's color palette
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: '#374151', // slate-700 from Tailwind's color palette
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: '#D1D5DB', // slate-200 from Tailwind's color palette
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: '#D1D5DB', // slate-200 from Tailwind's color palette
    '&:hover': {
      backgroundColor: '#F87171', // red-400 from Tailwind's color palette
      color: '#D1D5DB', // slate-200 from Tailwind's color palette
    },
  }),
  clearIndicator: (styles) => ({
    ...styles,
    color: '#D1D5DB', // slate-200 from Tailwind's color palette
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: '#1F2937', // slate-900 from Tailwind's color palette
  }),
};

const baseDefaultValues: Partial<InternalBlogPostSchema> = {
  status: 'draft',
  is_featured: false,
  title: '',
  json_content: defaultContent,
  tag_ids: [],
};

type CreateBlogFormProps = {
  mode: 'create';
  onSubmit: (
    authorId: string | undefined,
    data: TableInsertPayload<'internal_blog_posts'>,
    tagIds: number[],
  ) => Promise<unknown>;
};

const TipTapWrapper = ({
  control,
}: {
  control: Control<InternalBlogPostSchema>;
}) => {
  const { field: contentField } = useController({
    name: 'content',
    control,
  });

  return (
    <Controller
      control={control}
      name="json_content"
      render={({ field }) => {
        return (
          <TipTapEditor
            value={field.value}
            onChange={(editor: Editor) => {
              console.log(editor.getJSON());
              field.onChange(editor.getJSON());
              contentField.onChange(editor.getHTML());
            }}
            onBlur={field.onBlur}
          />
        );
      }}
    />
  );
};

export type EditBlogFormProps = {
  mode: 'update';
  onSubmit: (
    authorId: string | undefined,
    postId: string,
    data: TableUpdatePayload<'internal_blog_posts'>,
    tagIds: number[],
  ) => Promise<unknown>;
  initialBlogPost: Partial<InternalBlogPostSchema>;
  postId: string;
};

type BlogFormProps = {
  authors: Table<'internal_blog_author_profiles'>[];
  tags: Table<'internal_blog_post_tags'>[];
} & (CreateBlogFormProps | EditBlogFormProps);

export const BlogForm = ({ authors, tags, ...rest }: BlogFormProps) => {
  const { theme } = useTheme(); // Get the current theme
  const initialBlogPost = 'initialBlogPost' in rest ? rest.initialBlogPost : {};
  const defaultValues = Object.assign({}, baseDefaultValues, initialBlogPost);
  const router = useRouter();
  const { control, handleSubmit, formState, watch, setValue } =
    useForm<InternalBlogPostSchema>({
      resolver: zodResolver(internalBlogPostSchema),
      defaultValues,
    });
  const { isValid } = formState;
  const titleValue = watch('title');
  useEffect(() => {
    // remove special characters including spaces and question marks
    const slug = slugify(titleValue, {
      lower: true,
      strict: true,
      replacement: '-',
    });
    setValue('slug', slug);
  }, [setValue, titleValue]);

  const toastRef = useRef<string | number | null>(null);
  const { mutate: submitPostMutation, isLoading: isSubmittingPost } =
    useMutation(
      async (data: InternalBlogPostSchema) => {
        const { author_id, tag_ids, ...restPayload } = data;
        console.log(restPayload.json_content);
        if (rest.mode === 'create') {
          return rest.onSubmit(
            author_id,
            {
              ...restPayload,
              json_content:
                typeof restPayload.json_content === 'object' &&
                  restPayload.json_content !== null
                  ? restPayload.json_content
                  : JSON.parse(restPayload.json_content),
            },
            tag_ids,
          );
        } else {
          return rest.onSubmit(author_id, rest.postId, {
            ...restPayload,
            json_content:
              typeof restPayload.json_content === 'object' &&
                restPayload.json_content !== null
                ? restPayload.json_content
                : JSON.parse(restPayload.json_content),
          }, tag_ids);
        }
      },
      {
        onMutate: () => {
          if (rest.mode === 'update') {
            const toastId = toast.loading('Updating blog post...');
            toastRef.current = toastId;
          } else {
            const toastId = toast.loading('Creating blog post...');
            toastRef.current = toastId;
          }
        },
        onSuccess: () => {
          router.refresh();
          if (rest.mode === 'update') {
            toast.success('Blog post updated successfully', {
              id: toastRef.current ?? undefined,
            });
          } else {
            toast.success('Blog post created', {
              id: toastRef.current ?? undefined,
            });
            router.push('/app_admin/blog');
          }
          toastRef.current = null;
        },
        onError: (error) => {
          let message = `Failed`;
          if (error instanceof Error) {
            message += `: ${error.message}`;
          } else if (typeof error === 'string') {
            message += `: ${error}`;
          }

          toast.error(message, {
            id: toastRef.current ?? undefined,
          });
          toastRef.current = null;
        },
      },
    );

  function onSubmit(data: InternalBlogPostSchema) {
    if (!data.author_id) {
      delete data.author_id;
    }
    submitPostMutation(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <Label>Cover Image </Label>
        {/* <Controller
          control={control}
          name="cover_image"
          render={({ field }) => (
            <Input {...field} placeholder="Cover Image URL" />
          )}
        />
         */}
        <Controller
          control={control}
          name="cover_image"
          render={({ field }) => {
            return (
              <>
                {field.value ? (
                  <div className="relative">
                    <div className="relative rounded-lg overflow-hidden h-72 bg-gray-900 dark:bg-slate-950">
                      <Image
                        src={field.value}
                        fill
                        alt="Cover Image"
                        style={{
                          objectFit: 'contain',
                        }}
                      />
                    </div>

                    <Button
                      variant="destructive"
                      className="absolute top-2 right-2 "
                      onClick={() => {
                        field.onChange(null);
                      }}
                    >
                      <Trash></Trash>
                    </Button>
                  </div>
                ) : (
                  <UploadBlogImage onUpload={(path) => field.onChange(path)} />
                )}
              </>
            );
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => {
            return <Input {...field} placeholder="Title" />;
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <TipTapWrapper control={control} />
      </div>
      <div className="space-y-2">
        <Label>Summary</Label>
        <Controller
          control={control}
          name="summary"
          render={({ field }) => <Textarea {...field} placeholder="Summary" />}
        />
      </div>
      <div className="flex items-end space-x-2">
        <Label>Is Featured</Label>
        <Controller
          control={control}
          name="is_featured"
          render={({ field }) => (
            <Switch
              disabled={isSubmittingPost}
              checked={field.value}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Author</Label>
        <Controller
          control={control}
          name="author_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                {authors.map((admin) => (
                  <SelectItem key={admin.user_id} value={admin.user_id}>
                    {admin.display_name || `User ${admin.user_id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <Controller
          control={control}
          name="tag_ids"
          render={({ field }) => (
            // <Select value={field.value} onValueChange={field.onChange}>
            //   <SelectTrigger>
            //     <SelectValue placeholder="Select author" />
            //   </SelectTrigger>
            //   <SelectContent>
            //     {authors.map((admin) => (
            //       <SelectItem key={admin.user_id} value={admin.user_id}>
            //         {admin.display_name || `User ${admin.user_id}`}
            //       </SelectItem>
            //     ))}
            //   </SelectContent>
            // </Select>
            <ReactSelect
              closeMenuOnSelect={false}
              value={field.value.map((tagId) => ({
                label: tags.find((tag) => tag.id === tagId)?.name ?? '',
                value: tagId,
              }))}
              isMulti
              name={field.name}
              onBlur={field.onBlur}
              onChange={(values) => {
                field.onChange(values.map((value) => value.value));
              }}
              options={tags.map((tag) => ({
                label: tag.name,
                value: tag.id,
              }))}
              styles={theme === 'dark' ? darkThemeStyles : {}} // Apply the dark theme styles only if the current theme is 'dark'
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Controller
          control={control}
          name="slug"
          render={({ field }) => (
            <Input disabled {...field} placeholder="Slug" />
          )}
        />
      </div>
      <Button disabled={!isValid || isSubmittingPost} type="submit">
        {isSubmittingPost ? 'Submitting...' : 'Submit Post'}
      </Button>
    </form>
  );
};

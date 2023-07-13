import {
  AppSupabaseClient,
  TableInsertPayload,
  TableUpdatePayload,
} from '@/types';

export const createAuthorProfile = async (
  supabaseClient: AppSupabaseClient,
  payload: TableInsertPayload<'internal_blog_author_profiles'>
) => {
  const { error } = await supabaseClient
    .from('internal_blog_author_profiles')
    .insert(payload);

  if (error) {
    throw error;
  }
};

export const createBlogPost = async (
  supabaseClient: AppSupabaseClient,
  authorId: string,
  payload: TableInsertPayload<'internal_blog_posts'>
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_posts')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  // assign to author
  await supabaseClient.from('internal_blog_author_posts').insert({
    author_id: authorId,
    post_id: data.id,
  });

  return data;
};

export const getBlogPostById = async (
  supabaseClient: AppSupabaseClient,
  postId: string
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_posts')
    .select(
      '*, internal_blog_author_posts(*, internal_blog_author_profiles(*))'
    )
    .eq('id', postId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getBlogPostBySlug = async (
  supabaseClient: AppSupabaseClient,
  slug: string
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_posts')
    .select(
      '*, internal_blog_author_posts(*, internal_blog_author_profiles(*))'
    )
    .eq('slug', slug)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getPublishedBlogPostBySlug = async (
  supabaseClient: AppSupabaseClient,
  slug: string
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_posts')
    .select(
      '*, internal_blog_author_posts(*, internal_blog_author_profiles(*))'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getBlogPostsByAuthorId = async (
  supabaseClient: AppSupabaseClient,
  authorId: string
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_author_posts')
    .select('*, internal_blog_posts(*)')
    .eq('author_id', authorId);

  if (error) {
    throw error;
  }

  return data;
};

export const updateAuthorProfile = async (
  supabaseClient: AppSupabaseClient,

  userId: string,
  payload: Partial<TableUpdatePayload<'internal_blog_author_profiles'>>
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_author_profiles')
    .update(payload)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateBlogPost = async (
  supabaseClient: AppSupabaseClient,

  postId: string,
  authorId: string,
  payload: Partial<TableUpdatePayload<'internal_blog_posts'>>
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_posts')
    .update(payload)
    .eq('id', postId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const { data: oldAuthors, error: oldAuthorsError } = await supabaseClient
    .from('internal_blog_author_posts')
    .select('*')
    .eq('post_id', postId);
  if (oldAuthorsError) {
    throw oldAuthorsError;
  }

  for (const oldAuthor of oldAuthors) {
    const { error: deleteError } = await supabaseClient
      .from('internal_blog_author_posts')
      .delete()
      .eq('author_id', oldAuthor.author_id)
      .eq('post_id', postId);
    if (deleteError) {
      throw deleteError;
    }
  }

  // assign new author to the post
  await assignBlogPostToAuthor(supabaseClient, authorId, postId);

  return data;
};

export const assignBlogPostToAuthor = async (
  supabaseClient: AppSupabaseClient,

  authorId: string,
  postId: string
) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_author_posts')
    .insert({
      author_id: authorId,
      post_id: postId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getAllBlogPosts = async (supabaseClient: AppSupabaseClient) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_posts')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
};

export const getAllAuthors = async (supabaseClient: AppSupabaseClient) => {
  const { data, error } = await supabaseClient
    .from('internal_blog_author_profiles')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
};

export const getAllAppAdmins = async (supabaseClient: AppSupabaseClient) => {
  const { data: userIds, error } = await supabaseClient.rpc(
    'get_all_app_admins'
  );

  if (error) {
    throw error;
  }

  // get user profiles from user ids
  const { data: userProfiles, error: error2 } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .in(
      'id',
      userIds.map((userId) => userId.user_id)
    );

  if (error2) {
    throw error2;
  }

  return userProfiles;
};

export const deleteBlogPost = async (
  supabaseClient: AppSupabaseClient,
  postId: string
) => {
  const { error } = await supabaseClient
    .from('internal_blog_posts')
    .delete()
    .eq('id', postId);

  // We don't need to manually remove the author from the post, because of the foreign key constraint
  // cascade delete will remove the author from the post automatically

  if (error) {
    throw error;
  }

  return;
};

export const deleteAuthorProfile = async (
  supabaseClient: AppSupabaseClient,
  userId: string
) => {
  const { error } = await supabaseClient
    .from('internal_blog_author_profiles')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return;
};

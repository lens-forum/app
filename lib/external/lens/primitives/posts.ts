import { client } from "@/lib/external/lens/protocol-client";
import { APP_ADDRESS } from "@/lib/shared/constants";
import { Address } from "@/types/common";
import type { Post as LensPost, Post, PostId, PublicClient, SessionClient } from "@lens-protocol/client";
import { PostReferenceType, ReferenceRelevancyFilter, evmAddress } from "@lens-protocol/client";
import { fetchPost as fetchLensPost, fetchPostReferences, fetchPosts } from "@lens-protocol/client/actions";

export interface PaginatedPostsResult {
  posts: LensPost[];
  pageInfo: any;
}

/**
 * Fetch a single post from Lens Protocol, allowing custom client (sessionClient)
 */
export async function fetchPost(postId: string, lensClient: SessionClient | PublicClient): Promise<Post> {
  const result = await fetchLensPost(lensClient, { post: postId });
  if (result.isErr()) {
    throw new Error(`Failed to fetch post: ${result.error.message}`);
  }
  return result.value as Post;
}

/**
 * Batch fetch multiple posts from Lens Protocol
 */
export async function fetchPostsBatch(postIds: string[], sessionClient?: SessionClient): Promise<Post[]> {
  if (!postIds.length) return [];
  const lensClient = sessionClient ?? client;
  const result = await fetchPosts(lensClient, { filter: { posts: postIds } });
  if (!result.isOk() || !result.value.items) return [];

  return (result.value.items as Post[]).filter(post => post && post.__typename === "Post" && postIds.includes(post.id));
}

/**
 * Fetch posts for a thread with pagination
 */
export async function fetchPostsByFeed(
  threadAddress: string,
  sessionClient?: SessionClient,
): Promise<PaginatedPostsResult> {
  const params: any = {
    filter: {
      feeds: [{ feed: evmAddress(threadAddress) }],
    },
  };

  const lensClient = sessionClient ?? client;
  const result = await fetchPosts(lensClient, params);

  if (!result.isOk() || !result.value.items) {
    return { posts: [], pageInfo: { prev: null, next: null } };
  }

  const posts = result.value.items as LensPost[];

  const validPosts = posts.filter(
    (item: any) => item && item.__typename === "Post" && item.author && item.author.address,
  ) as LensPost[];

  const sortedPosts = validPosts.toSorted((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return aTime - bTime;
  });

  return {
    posts: sortedPosts,
    pageInfo: result.value.pageInfo,
  };
}

/**
 * Fetch all posts for a thread (non-paginated)
 */
export async function fetchCommentsByPostId(postId: PostId): Promise<LensPost[]> {
  const result = await fetchPostReferences(client, {
    referencedPost: postId,
    referenceTypes: [PostReferenceType.CommentOn],
    relevancyFilter: ReferenceRelevancyFilter.Relevant,
  });

  if (!result.isOk() || !result.value.items) return [];

  const validPosts = result.value.items.filter(
    (item: any) => item && item.__typename === "Post" && item.author && item.author.address,
  ) as LensPost[];

  // Sort by timestamp (oldest first)
  validPosts.sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return aTime - bTime;
  });

  return validPosts;
}

/**
 * Fetch latest posts by author
 */
export async function fetchPostsByAuthor(author: Address, limit: number = 10): Promise<LensPost[]> {
  const result = await fetchPosts(client, {
    filter: {
      authors: [evmAddress(author)],
      apps: [evmAddress(APP_ADDRESS)],
    },
  });

  if (!result.isOk() || !result.value.items) return [];

  const validPosts = result.value.items.filter(
    (item: any) => item && item.__typename === "Post" && item.author && item.author.address,
  ) as LensPost[];

  // Sort by timestamp (newest first)
  validPosts.sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return bTime - aTime;
  });

  return validPosts.slice(0, limit);
}

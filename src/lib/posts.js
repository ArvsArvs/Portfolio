// One place that defines how posts are loaded and shaped, so the Feed and
// Profile pages can't drift apart.

// `profiles!author_id` tells Supabase to use the author link (likes and comments
// also connect posts to profiles, which would otherwise be ambiguous).
export const POST_SELECT = `id, caption, created_at, author_id,
  profiles!author_id ( username, avatar_url ),
  post_media ( id, media_url, media_type, position ),
  post_hashtags ( hashtags ( tag ) ),
  likes ( user_id ),
  comments ( id, body, created_at, author_id, profiles!author_id ( username, avatar_url ) )`

export function mapPost(p, userId) {
  return {
    id: p.id,
    caption: p.caption,
    created_at: p.created_at,
    author_id: p.author_id,
    author: p.profiles,
    media: [...p.post_media].sort((a, b) => a.position - b.position),
    hashtags: p.post_hashtags.map((ph) => ph.hashtags.tag),
    like_count: p.likes.length,
    liked_by_me: userId ? p.likes.some((l) => l.user_id === userId) : false,
    comments: [...p.comments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
  }
}

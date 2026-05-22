import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, AppBar, Toolbar } from '@mui/material';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/ui/PostCard.jsx';

function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('godfood_posts')
      .select(`
        *,
        godfood_users (id, username, display_name, profile_image_url),
        godfood_post_images (image_url, image_order)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      const postsWithVotes = await Promise.all(
        data.map(async post => {
          const { data: vote } = await supabase
            .from('godfood_votes')
            .select('vote_type')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();
          return { ...post, my_vote: vote?.vote_type || null };
        })
      );
      setPosts(postsWithVotes);
    }
    setLoading(false);
  }

  async function handleVote(postId, voteType, prevVote) {
    if (prevVote === voteType) {
      await supabase.from('godfood_votes').delete().eq('post_id', postId).eq('user_id', user.id);
      await supabase.rpc('update_vote_counts', { p_post_id: postId, p_type: voteType, p_delta: -1 });
    } else {
      await supabase.from('godfood_votes').upsert({ post_id: postId, user_id: user.id, vote_type: voteType });
      await supabase.rpc('update_vote_counts', { p_post_id: postId, p_type: voteType, p_delta: 1 });
      if (prevVote) {
        await supabase.rpc('update_vote_counts', { p_post_id: postId, p_type: prevVote, p_delta: -1 });
      }
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant='h6' sx={{ fontWeight: 900, color: '#aaff00', letterSpacing: '-0.5px' }}>
            GodFood
          </Typography>
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress sx={{ color: '#aaff00' }} />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', pt: 10, px: 4 }}>
          <Typography variant='h6' sx={{ color: 'text.secondary', mb: 1 }}>아직 게시글이 없어요</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>첫 번째 맛집을 소개해보세요!</Typography>
        </Box>
      ) : (
        <Box>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onVote={handleVote} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default HomePage;

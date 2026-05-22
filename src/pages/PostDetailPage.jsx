import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, IconButton, Divider, TextField, Button,
  Chip, CircularProgress, AppBar, Toolbar, Skeleton, Icon,
} from '@mui/material';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRelativeTime } from '../utils/formatDate.js';

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    const [{ data: postData }, { data: voteData }, { data: commentData }, { data: hashData }] = await Promise.all([
      supabase.from('godfood_posts').select('*, godfood_users (id, username, display_name, profile_image_url), godfood_post_images (image_url, image_order)').eq('id', id).single(),
      supabase.from('godfood_votes').select('vote_type').eq('post_id', id).eq('user_id', user.id).single(),
      supabase.from('godfood_comments').select('*, godfood_users (username, display_name, profile_image_url)').eq('post_id', id).eq('is_deleted', false).order('created_at'),
      supabase.from('godfood_post_hashtags').select('godfood_hashtags (name)').eq('post_id', id),
    ]);
    if (postData) setPost(postData);
    if (voteData) setMyVote(voteData.vote_type);
    if (commentData) setComments(commentData);
    if (hashData) setHashtags(hashData.map(h => h.godfood_hashtags?.name).filter(Boolean));
    setLoading(false);
  }

  async function handleVote(type) {
    const prev = myVote;
    const next = prev === type ? null : type;
    setMyVote(next);
    setPost(p => ({
      ...p,
      likes_count: p.likes_count + (type === 'like' ? (prev === 'like' ? -1 : 1) : (prev === 'like' ? -1 : 0)),
      dislikes_count: p.dislikes_count + (type === 'dislike' ? (prev === 'dislike' ? -1 : 1) : (prev === 'dislike' ? -1 : 0)),
    }));
    if (prev === type) await supabase.from('godfood_votes').delete().eq('post_id', id).eq('user_id', user.id);
    else await supabase.from('godfood_votes').upsert({ post_id: id, user_id: user.id, vote_type: type });
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { data } = await supabase.from('godfood_comments').insert({ post_id: id, user_id: user.id, content: newComment.trim() }).select('*, godfood_users (username, display_name, profile_image_url)').single();
    if (data) { setComments(prev => [...prev, data]); setNewComment(''); setPost(p => ({ ...p, comments_count: p.comments_count + 1 })); }
  }

  const images = post?.godfood_post_images?.sort((a, b) => a.image_order - b.image_order) || [];
  const inputSx = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2a2a2a' }, '&:hover fieldset': { borderColor: '#aaff00' }, '&.Mui-focused fieldset': { borderColor: '#aaff00' } } };

  if (loading) return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar><IconButton onClick={() => navigate(-1)}><Icon>arrow_back</Icon></IconButton></Toolbar>
      </AppBar>
      <Skeleton variant='rectangular' height={300} sx={{ bgcolor: '#1a1a1a' }} />
    </Box>
  );
  if (!post) return null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.primary' }}><Icon>arrow_back</Icon></IconButton>
          <Typography variant='body1' sx={{ fontWeight: 700, ml: 1 }}>게시글</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', alignItems: 'center', p: '12px 16px', gap: 1.5 }}>
        <Avatar src={post.godfood_users?.profile_image_url} sx={{ width: 40, height: 40, bgcolor: '#aaff00', color: '#000', fontWeight: 700 }}>
          {post.godfood_users?.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 700 }}>{post.godfood_users?.display_name || post.godfood_users?.username}</Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>@{post.godfood_users?.username} · {formatRelativeTime(post.created_at)}</Typography>
        </Box>
      </Box>

      {images.length > 0 && (
        <Box sx={{ position: 'relative' }}>
          <Box component='img' src={images[imgIndex].image_url} alt='게시글 이미지' sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
          {images.length > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, position: 'absolute', bottom: 8, left: 0, right: 0 }}>
              {images.map((_, i) => (
                <Box key={i} onClick={() => setImgIndex(i)}
                  sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: i === imgIndex ? '#aaff00' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }} />
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ px: 2, pt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size='small' onClick={() => handleVote('like')} sx={{ color: myVote === 'like' ? '#aaff00' : 'text.secondary', p: 0.5 }}>
              <Icon sx={{ fontSize: 20 }}>thumb_up</Icon>
            </IconButton>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>{post.likes_count}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size='small' onClick={() => handleVote('dislike')} sx={{ color: myVote === 'dislike' ? '#ff4444' : 'text.secondary', p: 0.5 }}>
              <Icon sx={{ fontSize: 20 }}>thumb_down</Icon>
            </IconButton>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>{post.dislikes_count}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
          <Icon sx={{ fontSize: 16, color: '#aaff00', mt: 0.25 }}>location_on</Icon>
          <Box>
            <Typography variant='body2' sx={{ color: '#aaff00', fontWeight: 700 }}>{post.location_name}</Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>{post.location_address}</Typography>
          </Box>
        </Box>

        {post.caption && <Typography variant='body2' sx={{ color: 'text.primary', mb: 1, lineHeight: 1.6 }}>{post.caption}</Typography>}

        {hashtags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {hashtags.map(tag => <Chip key={tag} label={`#${tag}`} size='small' sx={{ bgcolor: '#1a2a0a', color: '#aaff00', fontSize: 12 }} />)}
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />

      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Typography variant='body2' sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>댓글 {post.comments_count}개</Typography>
        {comments.map(c => (
          <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <Avatar src={c.godfood_users?.profile_image_url} sx={{ width: 32, height: 32, bgcolor: '#aaff00', color: '#000', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {c.godfood_users?.display_name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='caption' sx={{ fontWeight: 700 }}>{c.godfood_users?.display_name || c.godfood_users?.username}</Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>{formatRelativeTime(c.created_at)}</Typography>
              </Box>
              <Typography variant='body2' sx={{ color: 'text.primary', lineHeight: 1.5 }}>{c.content}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box component='form' onSubmit={handleComment}
        sx={{ position: 'sticky', bottom: 56, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', px: 2, py: 1, display: 'flex', gap: 1 }}>
        <TextField placeholder='댓글 달기...' value={newComment} onChange={e => setNewComment(e.target.value)} fullWidth size='small' sx={inputSx} />
        <IconButton type='submit' disabled={!newComment.trim()} sx={{ color: '#aaff00' }}><Icon>send</Icon></IconButton>
      </Box>
    </Box>
  );
}

export default PostDetailPage;

/**
 * PostCard 컴포넌트 - 피드에 표시되는 게시글 카드
 *
 * Props:
 * @param {object} post - 게시글 데이터 [Required]
 * @param {function} onVote - 추천/비추천 클릭 핸들러 [Optional]
 *
 * Example usage:
 * <PostCard post={postData} onVote={handleVote} />
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Icon } from '@mui/material';
import { formatRelativeTime } from '../../utils/formatDate.js';

function PostCard({ post, onVote }) {
  const navigate = useNavigate();
  const [myVote, setMyVote] = useState(post.my_vote || null);
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [dislikes, setDislikes] = useState(post.dislikes_count || 0);

  const thumbnail = post.godfood_post_images?.[0]?.image_url || null;
  const author = post.godfood_users;

  async function handleVote(type) {
    if (!onVote) return;
    const prev = myVote;
    const newVote = prev === type ? null : type;
    setMyVote(newVote);
    if (type === 'like') {
      setLikes(l => prev === 'like' ? l - 1 : l + 1);
      if (prev === 'dislike') setDislikes(d => d - 1);
    } else {
      setDislikes(d => prev === 'dislike' ? d - 1 : d + 1);
      if (prev === 'like') setLikes(l => l - 1);
    }
    await onVote(post.id, type, prev);
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: '12px 16px 8px', gap: 1.5 }}>
        <Avatar
          src={author?.profile_image_url}
          sx={{ width: 36, height: 36, bgcolor: '#aaff00', color: '#000', fontSize: 14, fontWeight: 700 }}
        >
          {author?.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
            {author?.display_name || author?.username}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            @{author?.username} · {formatRelativeTime(post.created_at)}
          </Typography>
        </Box>
      </Box>

      {thumbnail && (
        <Box onClick={() => navigate(`/post/${post.id}`)} sx={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', bgcolor: '#1a1a1a' }}>
          <Box component='img' src={thumbnail} alt='게시글 이미지' sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      )}

      <Box sx={{ p: '8px 16px 4px' }} onClick={() => navigate(`/post/${post.id}`)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Icon sx={{ fontSize: 14, color: '#aaff00' }}>location_on</Icon>
          <Typography variant='caption' sx={{ color: '#aaff00', fontWeight: 600 }}>{post.location_name}</Typography>
        </Box>
        {post.caption && (
          <Typography variant='body2' sx={{ color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.caption}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1.5, gap: 1 }}>
        <IconButton size='small' onClick={() => handleVote('like')} sx={{ color: myVote === 'like' ? '#aaff00' : 'text.secondary', p: 0.5 }}>
          <Icon sx={{ fontSize: 18 }}>thumb_up</Icon>
        </IconButton>
        <Typography variant='caption' sx={{ color: 'text.secondary', minWidth: 16 }}>{likes}</Typography>

        <IconButton size='small' onClick={() => handleVote('dislike')} sx={{ color: myVote === 'dislike' ? '#ff4444' : 'text.secondary', p: 0.5 }}>
          <Icon sx={{ fontSize: 18 }}>thumb_down</Icon>
        </IconButton>
        <Typography variant='caption' sx={{ color: 'text.secondary', minWidth: 16 }}>{dislikes}</Typography>

        <IconButton size='small' onClick={() => navigate(`/post/${post.id}`)} sx={{ color: 'text.secondary', p: 0.5, ml: 0.5 }}>
          <Icon sx={{ fontSize: 18 }}>chat_bubble_outline</Icon>
        </IconButton>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>{post.comments_count}</Typography>
      </Box>
    </Box>
  );
}

export default PostCard;

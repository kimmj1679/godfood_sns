import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Avatar, Typography, Button, Grid, Tab, Tabs,
  AppBar, Toolbar, IconButton, CircularProgress, Divider, Icon,
} from '@mui/material';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

function MyPage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchPosts(); }, [user]);

  async function fetchPosts() {
    const { data } = await supabase.from('godfood_posts').select('id, location_name, godfood_post_images (image_url, image_order)').eq('user_id', user.id).eq('is_deleted', false).order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  }

  const statItem = (value, label) => (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>{value}</Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant='body1' sx={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>@{profile?.username || '...'}</Typography>
          <IconButton onClick={signOut} sx={{ color: 'text.secondary' }}><Icon>settings</Icon></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 2, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Avatar src={profile?.profile_image_url} sx={{ width: 80, height: 80, bgcolor: '#aaff00', color: '#000', fontSize: 28, fontWeight: 900 }}>
            {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, display: 'flex', gap: 0 }}>
            {statItem(posts.length, '게시물')}
            {statItem(profile?.followers_count ?? 0, '팔로워')}
            {statItem(profile?.following_count ?? 0, '팔로잉')}
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>{profile?.display_name || profile?.username || '이름 없음'}</Typography>
          {profile?.bio && <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>{profile.bio}</Typography>}
        </Box>
        <Button variant='outlined' fullWidth sx={{ borderColor: '#2a2a2a', color: 'text.primary', fontWeight: 600, '&:hover': { borderColor: '#aaff00', color: '#aaff00' } }}>프로필 편집</Button>
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { color: 'text.secondary', minWidth: 0, flex: 1 }, '& .Mui-selected': { color: '#aaff00' }, '& .MuiTabs-indicator': { backgroundColor: '#aaff00' } }}>
        <Tab icon={<Icon>grid_on</Icon>} />
        <Tab icon={<Icon>favorite</Icon>} />
      </Tabs>
      <Divider sx={{ borderColor: 'divider' }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress sx={{ color: '#aaff00' }} /></Box>
      ) : tab === 0 ? (
        posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}><Typography variant='body2' sx={{ color: 'text.secondary' }}>아직 게시글이 없어요</Typography></Box>
        ) : (
          <Grid container spacing={0.25} sx={{ p: 0.25 }}>
            {posts.map(post => {
              const img = post.godfood_post_images?.[0]?.image_url;
              return (
                <Grid size={{ xs: 4 }} key={post.id}>
                  <Box onClick={() => navigate(`/post/${post.id}`)} sx={{ aspectRatio: '1/1', bgcolor: '#1a1a1a', overflow: 'hidden', cursor: 'pointer' }}>
                    {img ? <Box component='img' src={img} alt='' sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10, textAlign: 'center', px: 0.5 }}>{post.location_name}</Typography></Box>}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )
      ) : (
        <Box sx={{ textAlign: 'center', pt: 8 }}><Typography variant='body2' sx={{ color: 'text.secondary' }}>좋아요한 게시글이 없어요</Typography></Box>
      )}
    </Box>
  );
}

export default MyPage;

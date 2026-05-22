import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, TextField, InputAdornment,
  Grid, CircularProgress, Icon,
} from '@mui/material';
import { supabase } from '../lib/supabase.js';

function ExplorePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('godfood_posts').select('id, location_name, godfood_post_images (image_url, image_order)').eq('is_deleted', false).order('likes_count', { ascending: false }).limit(60);
    if (data) setPosts(data);
    setLoading(false);
  }

  const filtered = posts.filter(p => search === '' || p.location_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <TextField
            placeholder='맛집 이름으로 검색'
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth size='small'
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#1e1e1e', borderRadius: 2, '& fieldset': { border: 'none' } } }}
            InputProps={{ startAdornment: <InputAdornment position='start'><Icon sx={{ color: 'text.secondary', fontSize: 20 }}>search</Icon></InputAdornment> }}
          />
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#aaff00' }} /></Box>
      ) : (
        <Grid container spacing={0.25} sx={{ p: 0.25 }}>
          {filtered.map(post => {
            const img = post.godfood_post_images?.[0]?.image_url;
            return (
              <Grid size={{ xs: 4 }} key={post.id}>
                <Box onClick={() => navigate(`/post/${post.id}`)} sx={{ aspectRatio: '1/1', bgcolor: '#1a1a1a', overflow: 'hidden', cursor: 'pointer' }}>
                  {img ? <Box component='img' src={img} alt={post.location_name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10, textAlign: 'center', px: 0.5 }}>{post.location_name}</Typography>
                      </Box>}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default ExplorePage;

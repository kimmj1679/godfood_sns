import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography, TextField,
  Button, Grid, CircularProgress, Chip, Alert, Stepper, Step, StepLabel, Icon,
} from '@mui/material';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
const STEPS = ['위치 입력', '내용 작성', '이미지 선택'];

function PostCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState({ name: '', address: '', latitude: '', longitude: '' });
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const inputSx = {
    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2a2a2a' }, '&:hover fieldset': { borderColor: '#aaff00' }, '&.Mui-focused fieldset': { borderColor: '#aaff00' } },
    '& .MuiInputLabel-root.Mui-focused': { color: '#aaff00' },
  };

  async function fetchUnsplash() {
    setLoadingImages(true);
    setSelectedImages([]);
    try {
      const query = encodeURIComponent(location.name || '맛집 음식');
      let images = [];
      if (UNSPLASH_ACCESS_KEY) {
        const res = await fetch(`https://api.unsplash.com/photos/random?query=${query}&count=12&orientation=squarish`, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } });
        const data = await res.json();
        images = Array.isArray(data) ? data.map(img => ({ id: img.id, url: img.urls.regular, thumb: img.urls.small })) : [];
      }
      if (images.length === 0) {
        images = Array.from({ length: 12 }, (_, i) => ({ id: `p-${i}`, url: `https://picsum.photos/seed/${location.name || 'food'}-${i}/600/600`, thumb: `https://picsum.photos/seed/${location.name || 'food'}-${i}/200/200` }));
      }
      setUnsplashImages(images);
    } catch {
      setUnsplashImages(Array.from({ length: 12 }, (_, i) => ({ id: `p-${i}`, url: `https://picsum.photos/seed/food-${i}/600/600`, thumb: `https://picsum.photos/seed/food-${i}/200/200` })));
    }
    setLoadingImages(false);
  }

  function addHashtag() {
    const tag = hashtagInput.replace(/^#/, '').trim();
    if (tag && !hashtags.includes(tag)) setHashtags(prev => [...prev, tag]);
    setHashtagInput('');
  }

  function toggleImage(img) {
    setSelectedImages(prev => prev.find(i => i.id === img.id) ? prev.filter(i => i.id !== img.id) : [...prev, img]);
  }

  async function handleSubmit() {
    if (selectedImages.length === 0) { setError('이미지를 1개 이상 선택해주세요.'); return; }
    setSubmitting(true);
    setError('');
    const { data: post, error: postError } = await supabase.from('godfood_posts').insert({
      user_id: user.id, caption, location_name: location.name, location_address: location.address,
      latitude: location.latitude ? parseFloat(location.latitude) : null, longitude: location.longitude ? parseFloat(location.longitude) : null,
    }).select().single();
    if (postError) { setError('게시글 저장 실패: ' + postError.message); setSubmitting(false); return; }
    await supabase.from('godfood_post_images').insert(selectedImages.map((img, order) => ({ post_id: post.id, image_url: img.url, image_order: order })));
    for (const tag of hashtags) {
      const { data: existing } = await supabase.from('godfood_hashtags').select('id').eq('name', tag).single();
      let tagId = existing?.id;
      if (!tagId) { const { data: newTag } = await supabase.from('godfood_hashtags').insert({ name: tag }).select('id').single(); tagId = newTag?.id; }
      if (tagId) await supabase.from('godfood_post_hashtags').insert({ post_id: post.id, hashtag_id: tagId });
    }
    setSubmitting(false);
    navigate(`/post/${post.id}`);
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.primary' }}><Icon>arrow_back</Icon></IconButton>
          <Typography variant='body1' sx={{ fontWeight: 700, ml: 1, flex: 1 }}>게시글 작성</Typography>
          {step === 2 && (
            <Button onClick={handleSubmit} disabled={submitting} sx={{ color: '#aaff00', fontWeight: 700 }}>
              {submitting ? <CircularProgress size={16} sx={{ color: '#aaff00' }} /> : '완료'}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 2, pt: 2 }}>
        <Stepper activeStep={step} sx={{ mb: 3, '& .MuiStepLabel-label': { color: 'text.secondary', fontSize: 12 }, '& .MuiStepLabel-label.Mui-active': { color: '#aaff00' }, '& .MuiStepIcon-root.Mui-active': { color: '#aaff00' }, '& .MuiStepIcon-root.Mui-completed': { color: '#aaff00' } }}>
          {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {error && <Alert severity='error' sx={{ mb: 2, bgcolor: '#2a0a0a' }}>{error}</Alert>}

        {step === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>* 맛집 위치는 필수 입력 항목입니다</Typography>
            <TextField label='맛집 이름 *' value={location.name} onChange={e => setLocation(p => ({ ...p, name: e.target.value }))} fullWidth sx={inputSx} />
            <TextField label='맛집 주소 *' value={location.address} onChange={e => setLocation(p => ({ ...p, address: e.target.value }))} fullWidth sx={inputSx} />
            <TextField label='위도 (선택)' value={location.latitude} onChange={e => setLocation(p => ({ ...p, latitude: e.target.value }))} fullWidth sx={inputSx} type='number' />
            <TextField label='경도 (선택)' value={location.longitude} onChange={e => setLocation(p => ({ ...p, longitude: e.target.value }))} fullWidth sx={inputSx} type='number' />
            <Button variant='contained' disabled={!location.name.trim() || !location.address.trim()} onClick={() => setStep(1)} sx={{ bgcolor: '#aaff00', color: '#000', fontWeight: 700, py: 1.5, '&:hover': { bgcolor: '#ccff33' } }}>다음</Button>
          </Box>
        )}

        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label='내용' value={caption} onChange={e => setCaption(e.target.value)} fullWidth multiline rows={4} placeholder='맛집을 소개해주세요' sx={inputSx} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label='해시태그' value={hashtagInput} onChange={e => setHashtagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHashtag(); } }} placeholder='#맛집' fullWidth size='small' sx={inputSx} />
              <Button onClick={addHashtag} sx={{ color: '#aaff00', whiteSpace: 'nowrap' }}>추가</Button>
            </Box>
            {hashtags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {hashtags.map(tag => <Chip key={tag} label={`#${tag}`} size='small' onDelete={() => setHashtags(prev => prev.filter(t => t !== tag))} sx={{ bgcolor: '#1a2a0a', color: '#aaff00' }} />)}
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setStep(0)} sx={{ color: 'text.secondary', flex: 1 }}>이전</Button>
              <Button variant='contained' onClick={() => { setStep(2); fetchUnsplash(); }} sx={{ bgcolor: '#aaff00', color: '#000', fontWeight: 700, flex: 2, '&:hover': { bgcolor: '#ccff33' } }}>다음</Button>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>이미지 선택 ({selectedImages.length}개 선택됨)</Typography>
              <IconButton size='small' onClick={fetchUnsplash} sx={{ color: '#aaff00' }}><Icon fontSize='small'>refresh</Icon></IconButton>
            </Box>
            {loadingImages ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#aaff00' }} /></Box>
            ) : (
              <Grid container spacing={0.5}>
                {unsplashImages.map(img => {
                  const selected = selectedImages.find(i => i.id === img.id);
                  return (
                    <Grid size={{ xs: 4 }} key={img.id}>
                      <Box onClick={() => toggleImage(img)} sx={{ position: 'relative', aspectRatio: '1/1', cursor: 'pointer', border: selected ? '2px solid #aaff00' : '2px solid transparent', borderRadius: 1, overflow: 'hidden' }}>
                        <Box component='img' src={img.thumb} alt='' sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {selected && <Box sx={{ position: 'absolute', top: 4, right: 4 }}><Icon sx={{ color: '#aaff00', fontSize: 20 }}>check_circle</Icon></Box>}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
            <Button onClick={() => setStep(1)} sx={{ color: 'text.secondary', mt: 2 }}>이전</Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default PostCreatePage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography, TextField,
  Button, Avatar, CircularProgress, Icon, Alert,
} from '@mui/material';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#2a2a2a' },
    '&:hover fieldset': { borderColor: '#aaff00' },
    '&.Mui-focused fieldset': { borderColor: '#aaff00' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#aaff00' },
};

function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile?.profile_image_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!displayName.trim() || !username.trim()) {
      setError('닉네임과 사용자명은 필수입니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let profileImageUrl = profile?.profile_image_url || null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        profileImageUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('godfood_users')
        .update({
          display_name: displayName.trim(),
          username: username.trim(),
          bio: bio.trim(),
          profile_image_url: profileImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      await fetchProfile(user.id);
      navigate('/my');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/my')} sx={{ color: 'text.primary' }}>
            <Icon>arrow_back</Icon>
          </IconButton>
          <Typography variant='body1' sx={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>프로필 편집</Typography>
          <Button onClick={handleSave} disabled={loading} sx={{ color: '#aaff00', fontWeight: 700, minWidth: 48 }}>
            {loading ? <CircularProgress size={18} sx={{ color: '#aaff00' }} /> : '저장'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        {error && (
          <Alert severity='error' sx={{ width: '100%', bgcolor: '#2a0a0a', color: '#ff6b6b' }}>{error}</Alert>
        )}

        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={imagePreview}
            sx={{ width: 90, height: 90, bgcolor: '#aaff00', color: '#000', fontSize: 32, fontWeight: 900 }}
          >
            {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </Avatar>
          <Box
            component='label'
            sx={{
              position: 'absolute', bottom: 0, right: 0,
              bgcolor: '#aaff00', borderRadius: '50%',
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon sx={{ fontSize: 16, color: '#000' }}>camera_alt</Icon>
            <input type='file' accept='image/*' hidden onChange={handleImageChange} />
          </Box>
        </Box>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label='닉네임 (표시 이름)'
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            fullWidth
            sx={inputSx}
          />
          <TextField
            label='사용자명 (@아이디)'
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            sx={inputSx}
          />
          <TextField
            label='소개'
            value={bio}
            onChange={e => setBio(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={inputSx}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ProfileEditPage;

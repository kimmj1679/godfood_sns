import { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button,
  Tab, Tabs, Alert, InputAdornment, IconButton, CircularProgress, Icon,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', username: '', password: '', passwordConfirm: '' });

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    if (signupForm.password !== signupForm.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (signupForm.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setLoading(true);
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.username);
    if (error) setError(error.message);
    else setError('이메일 인증 링크를 확인해주세요!');
    setLoading(false);
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#2a2a2a' },
      '&:hover fieldset': { borderColor: '#aaff00' },
      '&.Mui-focused fieldset': { borderColor: '#aaff00' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#aaff00' },
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth='sm' sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 900, color: '#aaff00', letterSpacing: '-1px' }}>GodFood</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>맛집을 발견하고 공유하세요</Typography>
        </Box>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setError(''); }}
            sx={{ mb: 3, '& .MuiTab-root': { color: 'text.secondary' }, '& .Mui-selected': { color: '#aaff00' }, '& .MuiTabs-indicator': { backgroundColor: '#aaff00' } }}
          >
            <Tab label='로그인' />
            <Tab label='회원가입' />
          </Tabs>

          {error && (
            <Alert severity={error.includes('인증') ? 'success' : 'error'} sx={{ mb: 2, bgcolor: error.includes('인증') ? '#0a2a0a' : '#2a0a0a' }}>
              {error}
            </Alert>
          )}

          {tab === 0 ? (
            <Box component='form' onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label='이메일' type='email' value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required fullWidth sx={inputSx} />
              <TextField
                label='비밀번호' type={showPw ? 'text' : 'password'} value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required fullWidth sx={inputSx}
                InputProps={{ endAdornment: <InputAdornment position='end'><IconButton onClick={() => setShowPw(p => !p)} edge='end'><Icon>{showPw ? 'visibility_off' : 'visibility'}</Icon></IconButton></InputAdornment> }}
              />
              <Button type='submit' variant='contained' fullWidth disabled={loading} sx={{ mt: 1, py: 1.5, bgcolor: '#aaff00', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#ccff33' } }}>
                {loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : '로그인'}
              </Button>
            </Box>
          ) : (
            <Box component='form' onSubmit={handleSignup} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label='이메일' type='email' value={signupForm.email} onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} required fullWidth sx={inputSx} />
              <TextField label='사용자명 (@아이디)' value={signupForm.username} onChange={e => setSignupForm(p => ({ ...p, username: e.target.value }))} required fullWidth sx={inputSx} />
              <TextField
                label='비밀번호' type={showPw ? 'text' : 'password'} value={signupForm.password}
                onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))} required fullWidth sx={inputSx}
                InputProps={{ endAdornment: <InputAdornment position='end'><IconButton onClick={() => setShowPw(p => !p)} edge='end'><Icon>{showPw ? 'visibility_off' : 'visibility'}</Icon></IconButton></InputAdornment> }}
              />
              <TextField label='비밀번호 확인' type='password' value={signupForm.passwordConfirm} onChange={e => setSignupForm(p => ({ ...p, passwordConfirm: e.target.value }))} required fullWidth sx={inputSx} />
              <Button type='submit' variant='contained' fullWidth disabled={loading} sx={{ mt: 1, py: 1.5, bgcolor: '#aaff00', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#ccff33' } }}>
                {loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : '회원가입'}
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default AuthPage;

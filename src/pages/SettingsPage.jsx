import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Icon,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Switch, Divider, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert,
} from '@mui/material';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

const itemSx = {
  px: 2, py: 0.5,
  '&:hover': { bgcolor: '#1a1a1a' },
  borderRadius: 1,
};

const sectionLabel = (label) => (
  <Typography variant='caption' sx={{ color: '#aaff00', fontWeight: 700, px: 2, pt: 2, pb: 0.5, display: 'block', letterSpacing: 1 }}>
    {label}
  </Typography>
);

function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [privateAccount, setPrivateAccount] = useState(false);
  const [notiLike, setNotiLike] = useState(true);
  const [notiComment, setNotiComment] = useState(true);
  const [notiFollow, setNotiFollow] = useState(true);

  const [pwDialog, setPwDialog] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  async function handleChangePassword() {
    if (newPw.length < 6) { setPwError('비밀번호는 6자 이상이어야 합니다.'); return; }
    if (newPw !== newPwConfirm) { setPwError('비밀번호가 일치하지 않습니다.'); return; }
    setPwLoading(true);
    setPwError('');
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) setPwError(error.message);
    else { setPwSuccess(true); setTimeout(() => { setPwDialog(false); setPwSuccess(false); setNewPw(''); setNewPwConfirm(''); }, 1500); }
    setPwLoading(false);
  }

  async function handleLogout() {
    await signOut();
    navigate('/auth', { replace: true });
  }

  async function handleDeleteAccount() {
    await supabase.from('godfood_users').delete().eq('id', user.id);
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/my')} sx={{ color: 'text.primary' }}>
            <Icon>arrow_back</Icon>
          </IconButton>
          <Typography variant='body1' sx={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>설정</Typography>
          <Box sx={{ width: 40 }} />
        </Toolbar>
      </AppBar>

      {/* 계정 정보 */}
      <Box sx={{ px: 2, py: 2, bgcolor: 'background.paper', mx: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>로그인 계정</Typography>
        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600, mt: 0.25 }}>{user?.email}</Typography>
      </Box>

      {/* 계정 섹션 */}
      {sectionLabel('계정')}
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton sx={itemSx} onClick={() => navigate('/profile/edit')}>
            <ListItemIcon sx={{ minWidth: 40 }}><Icon sx={{ color: 'text.secondary' }}>person</Icon></ListItemIcon>
            <ListItemText primary='프로필 편집' primaryTypographyProps={{ variant: 'body2' }} />
            <Icon sx={{ color: 'text.secondary', fontSize: 18 }}>chevron_right</Icon>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={itemSx} onClick={() => { setPwDialog(true); setPwError(''); setPwSuccess(false); }}>
            <ListItemIcon sx={{ minWidth: 40 }}><Icon sx={{ color: 'text.secondary' }}>lock</Icon></ListItemIcon>
            <ListItemText primary='비밀번호 변경' primaryTypographyProps={{ variant: 'body2' }} />
            <Icon sx={{ color: 'text.secondary', fontSize: 18 }}>chevron_right</Icon>
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: 'divider', my: 1 }} />

      {/* 개인정보 보호 */}
      {sectionLabel('개인정보 보호')}
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton sx={itemSx} onClick={() => setPrivateAccount(p => !p)}>
            <ListItemIcon sx={{ minWidth: 40 }}><Icon sx={{ color: 'text.secondary' }}>lock_person</Icon></ListItemIcon>
            <ListItemText
              primary='비공개 계정'
              secondary='나를 팔로우한 사람만 게시물을 볼 수 있어요'
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption', sx: { color: 'text.secondary' } }}
            />
            <Switch checked={privateAccount} onChange={e => setPrivateAccount(e.target.checked)} size='small'
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#aaff00' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#aaff0066' } }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: 'divider', my: 1 }} />

      {/* 알림 */}
      {sectionLabel('알림')}
      <List disablePadding>
        {[
          { label: '좋아요 알림', icon: 'favorite', state: notiLike, set: setNotiLike },
          { label: '댓글 알림', icon: 'chat_bubble', state: notiComment, set: setNotiComment },
          { label: '팔로우 알림', icon: 'person_add', state: notiFollow, set: setNotiFollow },
        ].map(item => (
          <ListItem disablePadding key={item.label}>
            <ListItemButton sx={itemSx} onClick={() => item.set(p => !p)}>
              <ListItemIcon sx={{ minWidth: 40 }}><Icon sx={{ color: 'text.secondary' }}>{item.icon}</Icon></ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
              <Switch checked={item.state} onChange={e => item.set(e.target.checked)} size='small'
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#aaff00' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#aaff0066' } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'divider', my: 1 }} />

      {/* 앱 정보 */}
      {sectionLabel('앱 정보')}
      <List disablePadding>
        <ListItem sx={{ px: 2, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><Icon sx={{ color: 'text.secondary' }}>info</Icon></ListItemIcon>
          <ListItemText primary='버전' secondary='1.0.0' primaryTypographyProps={{ variant: 'body2' }} secondaryTypographyProps={{ variant: 'caption' }} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={itemSx}>
            <ListItemIcon sx={{ minWidth: 40 }}><Icon sx={{ color: 'text.secondary' }}>description</Icon></ListItemIcon>
            <ListItemText primary='이용약관' primaryTypographyProps={{ variant: 'body2' }} />
            <Icon sx={{ color: 'text.secondary', fontSize: 18 }}>chevron_right</Icon>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={itemSx}>
            <ListItemIcon sx={{ minWidth: 40 }}><Icon sx={{ color: 'text.secondary' }}>privacy_tip</Icon></ListItemIcon>
            <ListItemText primary='개인정보 처리방침' primaryTypographyProps={{ variant: 'body2' }} />
            <Icon sx={{ color: 'text.secondary', fontSize: 18 }}>chevron_right</Icon>
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: 'divider', my: 1 }} />

      {/* 로그아웃 */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Button
          fullWidth variant='outlined'
          onClick={() => setLogoutDialog(true)}
          startIcon={<Icon>logout</Icon>}
          sx={{ py: 1.5, borderColor: '#ff4444', color: '#ff4444', fontWeight: 700, '&:hover': { bgcolor: '#ff444422', borderColor: '#ff4444' } }}
        >
          로그아웃
        </Button>
      </Box>

      {/* 계정 탈퇴 */}
      <Box sx={{ px: 2, pt: 0.5 }}>
        <Button
          fullWidth
          onClick={() => setDeleteDialog(true)}
          sx={{ py: 1, color: '#666', fontWeight: 400, fontSize: 13, textDecoration: 'underline', '&:hover': { color: '#ff4444', bgcolor: 'transparent' } }}
        >
          계정 탈퇴
        </Button>
      </Box>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={pwDialog} onClose={() => setPwDialog(false)} PaperProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 2, width: '100%', mx: 2 } }}>
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>비밀번호 변경</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {pwError && <Alert severity='error' sx={{ bgcolor: '#2a0a0a' }}>{pwError}</Alert>}
          {pwSuccess && <Alert severity='success' sx={{ bgcolor: '#0a2a0a' }}>비밀번호가 변경되었습니다!</Alert>}
          <TextField label='새 비밀번호' type='password' value={newPw} onChange={e => setNewPw(e.target.value)} fullWidth sx={inputSx} />
          <TextField label='비밀번호 확인' type='password' value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} fullWidth sx={inputSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPwDialog(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={handleChangePassword} disabled={pwLoading} variant='contained'
            sx={{ bgcolor: '#aaff00', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#ccff33' } }}>
            {pwLoading ? <CircularProgress size={18} sx={{ color: '#000' }} /> : '변경'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 로그아웃 확인 다이얼로그 */}
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)} PaperProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 2, width: '100%', mx: 2 } }}>
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>로그아웃</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>정말 로그아웃 하시겠어요?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutDialog(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={handleLogout} variant='contained' sx={{ bgcolor: '#ff4444', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#ff6666' } }}>
            로그아웃
          </Button>
        </DialogActions>
      </Dialog>

      {/* 계정 탈퇴 확인 다이얼로그 */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} PaperProps={{ sx: { bgcolor: '#1a1a1a', borderRadius: 2, width: '100%', mx: 2 } }}>
        <DialogTitle sx={{ color: '#ff4444', fontWeight: 700 }}>계정 탈퇴</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            계정을 삭제하면 모든 게시물과 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없어요.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={handleDeleteAccount} variant='contained' sx={{ bgcolor: '#ff4444', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#ff6666' } }}>
            탈퇴하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SettingsPage;

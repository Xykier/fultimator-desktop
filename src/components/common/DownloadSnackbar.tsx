import {
    Box,
    Snackbar,
    IconButton,
    Tooltip,
    Typography,
    useTheme,
    Paper,
  } from '@mui/material';
  import { Close, FolderOpen, InsertDriveFile } from '@mui/icons-material';
  import { useTranslate } from '../../translation/translate';
  
  interface DownloadSnackbarProps {
    open: boolean;
    onClose: () => void;
    filePath: string;
  }
  
  const DownloadSnackbar: React.FC<DownloadSnackbarProps> = ({
    open,
    onClose,
    filePath,
  }) => {
    const theme = useTheme();
    const { t } = useTranslate();
  
    const isDarkMode = theme.palette.mode === 'dark';
    const iconColor = isDarkMode
      ? theme.palette.secondary.main
      : theme.palette.primary.main;
  
    const handleOpenFile = async () => {
      try {
        if (filePath) await window.electron.openFile(filePath);
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    };
  
    const handleShowInFolder = async (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      event.stopPropagation(); // prevent triggering the parent click
      try {
        if (filePath) await window.electron.showFileInFolder(filePath);
      } catch (error) {
        console.error('Failed to show file in folder:', error);
      }
    };
  
    const handleDismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation(); // prevent triggering the parent click
      onClose();
    };
  
    return (
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Paper
          elevation={6}
          onClick={filePath ? handleOpenFile : undefined}
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            minWidth: 320,
            boxShadow: theme.shadows[8],
            cursor: filePath ? 'pointer' : 'default',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: isDarkMode
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
            },
            '&:active': {
              backgroundColor: isDarkMode
                ? theme.palette.grey[700]
                : theme.palette.grey[200],
            },
          }}
        >
          <InsertDriveFile fontSize="medium" sx={{ color: iconColor }} />
  
          <Box flex="1">
            <Typography variant="subtitle2" fontWeight={500}>
              {filePath ? t('File saved') : t('Copied to clipboard')}
            </Typography>
            {filePath && (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: '220px' }}
              >
                {filePath}
              </Typography>
            )}
          </Box>
  
          {filePath && (
            <Tooltip title={t('Show in folder')}>
              <IconButton size="small" onClick={handleShowInFolder} sx={{ color: iconColor }}>
                <FolderOpen fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
  
          <Tooltip title={t('Dismiss')}>
            <IconButton size="small" onClick={handleDismiss} sx={{ color: theme.palette.text.secondary }}>
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
      </Snackbar>
    );
  };
  
  export default DownloadSnackbar;
  
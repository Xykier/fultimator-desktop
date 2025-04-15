import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Tag as TagIcon, Close as CloseIcon } from '@mui/icons-material';
import { ImageHandler } from '../../../components/common/ImageHandler';

const CampaignDialog = ({
  open,
  onClose,
  onCreate,
  campaign,
  onInputChange,
  onImageUpdate,
  onTagInput,
  actionInProgress,
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !campaign.tags.includes(newTag)) {
      const updatedTags = [...campaign.tags, newTag];
      onTagInput({ target: { value: updatedTags.join(', ') } });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = campaign.tags.filter(tag => tag !== tagToRemove);
    onTagInput({ target: { value: updatedTags.join(', ') } });
  };

  // Handle blur to add tag
  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      addTag();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={actionInProgress ? null : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h3" component="div" fontWeight="bold">
          Create New Campaign
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              autoFocus
              name="name"
              label="Campaign Name"
              type="text"
              fullWidth
              variant="outlined"
              value={campaign.name}
              onChange={onInputChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: 1.5 },
              }}
            />

            <TextField
              name="description"
              label="Campaign Description"
              type="text"
              fullWidth
              variant="outlined"
              value={campaign.description}
              onChange={onInputChange}
              multiline
              rows={4}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: 1.5 },
              }}
            />

            <TextField
              name="tags"
              label="Enter tags"
              type="text"
              fullWidth
              variant="outlined"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              onBlur={handleTagInputBlur}
              placeholder="Type and press Enter to add tags"
              helperText="Add tags to help organize your campaigns"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TagIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 1.5 },
              }}
            />

            {/* Tags display */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {campaign.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  onDelete={() => removeTag(tag)}
                  deleteIcon={<CloseIcon />}
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <ImageHandler
              imageUrl={campaign.imageUrl}
              onImageUpdate={onImageUpdate}
              title="Campaign Image"
              entityType="campaign"
              helperText="Choose an image for your campaign"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={actionInProgress}
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          variant="contained"
          color="primary"
          disabled={!campaign.name || actionInProgress}
          sx={{ minWidth: 100 }}
        >
          {actionInProgress ? 'Creating...' : 'Create Campaign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignDialog;
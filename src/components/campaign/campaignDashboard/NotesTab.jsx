import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";

const NotesTab = ({ notes, campaignId }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Campaign Notes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/campaign/${campaignId}/note/new`)}
          >
            New Note
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        {notes.length > 0 ? (
          <Card>
            <CardContent>
              <List>
                {notes.map((note, index) => (
                  <React.Fragment key={note.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemButton
                        onClick={() =>
                          navigate(`/campaign/${campaignId}/note/${note.id}`)
                        }
                      >
                        <ListItemText
                          primary={note.title}
                          secondary={`Last updated: ${format(
                            parseISO(note.modifiedAt),
                            "MMM d, yyyy"
                          )}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No notes created for this campaign yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/campaign/${campaignId}/note/new`)}
            >
              Create Note
            </Button>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default NotesTab;
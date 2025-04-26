import React from "react";
import { Box, Grid, Stack } from "@mui/material";

const ContentList = ({
    items,
    viewMode,
    selectedItems,
    selectionMode,
    handleSelectItem,
    handleUnlinkItem,
    handleOpenMoveDialog,
    folders,
    currentFolder,
    filterValue,
    ItemCardComponent,
    ItemListComponent,
    EmptyListComponent
  }) => {
    return (
      <Box sx={{ flex: 1, overflowY: "auto", paddingTop: 1 }}>
        {items.length > 0 ? (
          viewMode === "grid" ? (
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <ItemCardComponent
                    item={item}
                    onUnlink={handleUnlinkItem}
                    folders={folders}
                    onSelect={handleSelectItem}
                    isSelected={selectedItems.includes(item.id)}
                    selectionMode={selectionMode}
                    onMove={handleOpenMoveDialog}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={1}>
              {items.map((item) => (
                <ItemListComponent
                  key={item.id}
                  item={item}
                  onUnlink={handleUnlinkItem}
                  folders={folders}
                  onSelect={handleSelectItem}
                  isSelected={selectedItems.includes(item.id)}
                  selectionMode={selectionMode}
                  onMove={handleOpenMoveDialog}
                />
              ))}
            </Stack>
          )
        ) : (
          // Empty state specific to the selected filter
          <EmptyListComponent
            currentFolder={currentFolder}
            filterValue={filterValue}
          />
        )}
      </Box>
    );
  };

  export default ContentList;
import React from "react";
import { ImageHandler } from "../../common/ImageHandler";
import { useTranslate } from "../../../translation/translate";

export function PlayerImageHandler({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();

  const handleImageUpdate = (newImageUrl) => {
    setPlayer((prevState) => ({
      ...prevState,
      info: {
        ...prevState.info,
        imgurl: newImageUrl,
      },
    }));
  };

  return (
    <ImageHandler
      imageUrl={player.info.imgurl}
      onImageUpdate={handleImageUpdate}
      title={t("character_image_title")}
      entityType="entity_type_character"
      isEditMode={isEditMode}
      fileUploadId="file-upload"
      helperText={t("image_credit_note")}
    />
  );
}

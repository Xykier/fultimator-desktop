import React from "react";
import { ImageHandler } from "../common/ImageHandler";
import { useTranslate } from "../../translation/translate";

export default function NpcImageHandler({ npc, setNpc }) {
    const { t } = useTranslate();
  
    const handleImageUpdate = (newImageUrl) => {
      setNpc((prevState) => ({
        ...prevState,
        imgurl: newImageUrl,
      }));
    };
  
    return (
      <ImageHandler
        imageUrl={npc.imgurl}
        onImageUpdate={handleImageUpdate}
        title={t("npc_image_title")}
        entityType="entity_type_npc"
        helperText={t("image_credit_note")}
        fileUploadId="npc-file-upload"
      />
    );
  }
import cloudinary from "../lib/cloudinary.js";

export const deleteImageFromCloudinary = async (imageUrl) => {
  const urlParts = imageUrl.split("/");
  const folder = urlParts[urlParts.length - 2];
  const imageFile = urlParts[urlParts.length - 1].split(".")[0];
  const publicId = `${folder}/${imageFile}`;
  await cloudinary.uploader.destroy(publicId);
};

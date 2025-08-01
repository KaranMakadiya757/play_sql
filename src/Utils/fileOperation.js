import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uploadOnCloudinary = async (localFilePath, userId) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: `users/${userId}`
        });

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.error("Upload Error:", error);
        return null;
    }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error("Deletion Error:", error);
        return null;
    }
};

const deleteFolderFromCloudinary = async (folderPath) => {
    try {
        const resourceTypes = ["image", "video"];
        let deleted = [];

        for (const type of resourceTypes) {
            const { resources } = await cloudinary.api.resources({
                type: "upload",
                prefix: `${folderPath}/`,
                resource_type: type,
                max_results: 500,
            });

            if (resources.length) {
                const publicIds = resources.map((r) => r.public_id);
                const result = await cloudinary.api.delete_resources(publicIds, {
                    resource_type: type,
                });
                deleted.push({ type, result });
                console.log(`Deleted ${publicIds.length} ${type} files from ${folderPath}`);
            }
        }

        return deleted.length
            ? { success: true, deleted }
            : { success: false, message: "No resources to delete" };
    } catch (error) {
        console.error("Folder Deletion Error:", error);
        return { success: false, error };
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary,
    deleteFolderFromCloudinary
};
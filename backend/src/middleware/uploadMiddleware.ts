import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

// ✅ Added upload folder options used across the backend
export const processImages = async (
    files: any[], 
    folderName: 'waste-logs' | 'pickups' | 'resolved' | 'security'
) => {
    const uploadDir = path.join(process.cwd(), 'uploads', folderName);
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const processedPaths = await Promise.all(
        files.map(async (file) => {
            // WebP format storage optimization ke liye best hai
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(file.buffer)
                .resize(1024, null, { withoutEnlargement: true }) 
                .webp({ quality: 70 }) 
                .toFile(filePath);

            // Virtual path return kar rahe hain frontend ke liye
            return `/uploads/${folderName}/${fileName}`;
        })
    );

    return processedPaths;
}
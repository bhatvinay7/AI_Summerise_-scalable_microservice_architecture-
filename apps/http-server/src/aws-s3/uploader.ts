import { S3Client,PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const s3Client = new S3Client({
        region: 'YOUR_AWS_REGION' as string, 
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });

async function uploadFileToS3(filePath:string) {
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
            Bucket: process.env.bucketName,
            Key:process.env.keyName,
            Body: fileStream,
            // ACL: 'public-read', // Uncomment if you want public read access
        };

        try {
            const data = await s3Client.send(new PutObjectCommand(uploadParams));
            console.log('File uploaded successfully:', data.ETag);
            return data
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }


export default  uploadFileToS3   
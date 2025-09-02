import { S3Client,PutObjectCommand,ObjectCannedACL } from '@aws-sdk/client-s3'
import fs from 'fs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();
const s3Client = new S3Client({
        region: process.env.AWS_REGION as string, 
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });
type uploadParams={
  Bucket: string;
  Key: string;
  Body: fs.ReadStream;
//   ServerSideEncryption:string
  
}
async function uploadFileToS3(filePath:string) {
        const fileStream = fs.createReadStream(filePath);
        const fileName = `${Date.now()}-${uuidv4()}.${filePath.split('.')?.[1]!}`;
        const uploadParams:uploadParams = {
            Bucket: process.env.bucketName!,
            Key:fileName,
            Body: fileStream,
            // ServerSideEncryption:process.env.ServerSideEncryption!
        };

        try {
            const data = await s3Client.send(new PutObjectCommand(uploadParams));
            console.log('File uploaded successfully:',`https://${process.env.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`);
            return  `https://${process.env.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }


export default  uploadFileToS3   
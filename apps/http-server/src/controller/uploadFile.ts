import {Request,Response} from 'express'
import uploadFileToS3 from '../aws-s3/uploader'; 
import {Kafka} from 'kafkajs';
import prisma from  'prisma'
const kafka = new Kafka({
  clientId: "notes",
  brokers: ["kafka1:9092", "kafka2:9093", "kafka3:9094"],
});


const producer = kafka.producer();

const uploadFile=async (req:Request,res:Response)=>{
    try {
        let sessionId:string = req.body.sessionId;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const file = req.file;
        const link=await uploadFileToS3(file.path)
        if(!sessionId) {
            const session=await prisma.file.create({
                data: {
                    createdAt: new Date().toISOString()
                },  
            })

                await prisma.Query.create({data:{
                    sessionId: session.id,
                    filePath: link
                }})
        sessionId = session.id as string;  
        
        } 
          else{
            await prisma.Query.create({
                data: {
                    sessionId: sessionId,
                    filePath: link
                }
            });
        }      
        await producer.send({
            topic: "upload-file",
            messages: [{ value: JSON.stringify({ sessionId:sessionId,filePath:link })     }],
          });
        

        res.status(200).json({ message: "File uploaded successfully", file: link });
    } catch (error:any) {
        console.error('Error in uploadFile controller:', error);
        res.status(500).json({ message: error.message });
    }
}

export default uploadFile;
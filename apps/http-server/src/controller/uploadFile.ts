import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client/extension";
import uploadFileToS3 from "../aws-s3/uploader"; 
import getUserDetails, { user } from "../auth/getUserDetailAuth";
import fs from "fs";
const prisma:PrismaClient =require("prisma/client");
import { getKafkaProducer } from "../kafkaService";  // new service

let fileLPath: string | null = null;

const uploadFile = async (req: Request, res: Response) => {
    try {
    const producer = await getKafkaProducer();
    let sessionId: string | null = req.body?.sessionId
    const user: user = await getUserDetails(req);

    if (!user?.isVerified)
      return res.status(403).json({ message: "unauthorized request" });

    if (!req.files) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files as Express.Multer.File[];
    fileLPath = file?.[0]?.path!;
    const link = await uploadFileToS3(file?.[0]?.path!);

    if (!sessionId) {
      const session = await prisma.session.create({
        data: {
          userId: user.userId as number,
        },
      });

      await prisma.query.create({
        data: {
          sessionId: session.id,
          fileLink: link,
        },
      });

      sessionId = session.id as string;
    } else {
      await prisma.query.create({
        data: {
          sessionId: sessionId,
          fileLink: link,
        },
      });
    }



    await producer.send({
      topic: "upload-file",
      messages: [
        { value: JSON.stringify({ sessionId: sessionId, fileLink: link,userId:user.userId }) },
      ],
    });

    res.status(200).json({ fileId: req.body.fileId });
  } catch (error: any) {
    console.error("Error in uploadFile controller:", error);
    res.status(500).json({ message: error.message });
  } finally {
    try {
      if (fileLPath) fs.unlinkSync(fileLPath!);
    } catch (error: any) {}
  }
};

export default uploadFile;

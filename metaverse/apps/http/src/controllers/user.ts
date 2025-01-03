import { Request, Response } from "express";
import { updateMetadataSchema } from "../types";
const client = require("@repo/db/client");

export const UpdateMetadataController = async (req: Request, res: Response)=>{
    const parsedData = updateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid request body",
        });
        return;
    }

   try {
    await client.user.update({
        where: {
            id: req.userId
        },
        data: {
            avatarId: parsedData.data.avatarId
        }
    })
    res.json({ message: "Metadata updated successfully" });
    return;
   } catch (error) {
    res.status(400).json({
        message: "Error updating metadata",
    })
    return;
   }
}

export const OthersMetadataController = async (req: Request, res: Response)=>{
    const userString = (req.query.ids ?? "[]") as string;
    const userIds = (userString).slice(1,userString.length-1).split(",");

    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds,
            }
        },
        select: {
            id: true,
            avatar: true
        }
    })
    interface MetadataItem {
        id: string;
        avatar?: {
            imageUrl: string;
        };
    }
    // interface IKeys { userId: string; avatarId: string }
    const ans= metadata.map( (val: MetadataItem) => (
        {
            userId: val.id,
            avatarId: val.avatar?.imageUrl || ""
        }
    ))
    res.json({
        avatars: ans
    })
}
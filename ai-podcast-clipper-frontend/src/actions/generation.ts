/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
"use server";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { get } from "http";
import { revalidatePath } from "next/cache";
import { env } from "~/env";
import { inngest } from "~/inngest/client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function processVideo(uploadedFileId: string) {
  const uploadedVideo = await db.uploadedFile.findUniqueOrThrow({
    where: {
      id: uploadedFileId,
    },
    select: {
      uploaded: true,
      id: true,
      userId: true,
    },
  });

  if (uploadedVideo.uploaded) return;

  await inngest.send({
    name: "process-video-events",
    data: { uploadedFileId: uploadedVideo.id, userId: uploadedVideo.userId },
  });

  await db.uploadedFile.update({
    where: { 
        id: uploadedFileId 
    },
    data: { 
        uploaded: true 
    },
  });

  revalidatePath("/dashboard");
}

export async function getClipPlayUrl(clipId: string): Promise<{success: boolean; url?: string; error?: string}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const clip = await db.clip.findUniqueOrThrow({
      where: {
        id: clipId,
        userId: session.user.id,
      }
    })

    const s3Client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
        },
      });

      const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: clip.s3Key,
      })

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return { success: true, url: signedUrl };

  } catch (error) {
    return {success: false, error: "Failed to retrieve clip play URL."};
  }
}

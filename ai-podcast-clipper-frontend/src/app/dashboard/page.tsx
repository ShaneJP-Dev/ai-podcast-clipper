/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use server"

import { create } from "domain";
import { redirect } from "next/navigation";
import { DashboardClient } from "~/components/dashboard-client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function DashboardPage() {
   const session = await auth()

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userData = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            uploadedFiles: {
                where: {
                    uploaded: true,
                },
                select: {
                    id: true,
                    s3Key: true,
                    displayName: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: {
                            Clip: true,
                        },
                    },
                },
            },
            clips: {
                orderBy: {
                    createdAt: "desc",
                }
            },
        },
    });

     if (!userData) {
        redirect("/login");
    }

    const formattedFiles = userData.uploadedFiles.map((file) => ({
        id: file.id,
        s3Key: file.s3Key,
        fileName: file.displayName || "Unknown filename",
        status: file.status,
        createdAt: file.createdAt,
        clipCount: file._count.Clip,
    }));

    return <DashboardClient 
        uploadedFiles={formattedFiles} 
        clips={userData.clips} 
        
    />
}
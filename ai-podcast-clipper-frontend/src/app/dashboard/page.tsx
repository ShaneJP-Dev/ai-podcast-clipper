/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use server"

import { create } from "domain";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function DashboardPage() {
   const session = await auth()

    if (!session?.user?.id) {
        redirect("/login");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

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

    const formattedFiles = userData?.uploadedFiles.map((file) => ({
        id: file.id,
        s3Key: file.s3Key,
        fileName: file.displayName || "Unkown filename",
        status: file.status,
        createdAt: file.createdAt,
        clipCount: file._count.Clip,
    }))

    return <h1>Helklo</h1>
}
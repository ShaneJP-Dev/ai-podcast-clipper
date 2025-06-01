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
    })

    return <h1>Helklo</h1>
}
"use server"

import { redirect } from "next/navigation"
import { auth } from "~/server/auth"
import { SignUpForm } from "~/components/signup-form"

export default async function SignupPage() {
    const session = await auth()

    if (session) {
        redirect("/dashboard")
    }

    return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  )
}

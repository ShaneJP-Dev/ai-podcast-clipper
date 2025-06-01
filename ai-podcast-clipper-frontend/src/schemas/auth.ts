import {z} from "zod"

export const SignUpSchema = z.object({
  email : z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
})

export const LoginSchema = z.object({
  email : z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignUpFormValues = z.infer<typeof SignUpSchema>
export type LoginFormValues = z.infer<typeof LoginSchema>
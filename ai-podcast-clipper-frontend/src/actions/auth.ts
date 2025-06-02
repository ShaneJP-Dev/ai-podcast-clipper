"use server";

import { hashPassword } from "~/lib/auth";
import { SignUpSchema, type SignUpFormValues } from "~/schemas/auth";
import { db } from "~/server/db";

type SingupResult = {
    success: boolean;
    errors?: string;
}

export async function signUpUser(data: SignUpFormValues): Promise<SingupResult> {
    const validationResult = SignUpSchema.safeParse(data);
    if (!validationResult.success) {
        return {
            success: false, 
            errors: validationResult.error.issues[0]?.message ?? "Invalid input"
        };
    }

    const { email, password } = validationResult.data;
    try {
        const existingUser = await db.user.findUnique({where:  {email}});

        if (existingUser) {
            return {
                success: false, 
                errors: "Email already exists"
            };
        }

        const hashedPassword = await hashPassword(password);
        
        // const strip = new Stripe("TODO: Strip Key");

        // const stripCustomer = await strip.customers.create({
        //     email: email.toLowerCase(),       
        // });

        await db.user.create({
            data: {
                email,
                password: hashedPassword,
                //stripeCustomerId: stripCustomer.id,
            }
        })

        return {success: true};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }catch (error) {
        return{
            success: false, 
            errors: "An error occurred while signing up. Please try again."
        };
    }

}
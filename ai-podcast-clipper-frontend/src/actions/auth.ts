/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use server";

import { hashPassword } from "~/lib/auth";
import { SignUpSchema, type SignUpFormValues } from "~/schemas/auth";
import { db } from "~/server/db";
import Stripe from "stripe";

type SingupResult = {
    success: boolean;
    errors?: string;
}

export async function signUpUser(data: SignUpFormValues): Promise<SingupResult> {
    const validationResult = SignUpSchema.safeParse(data);
    if (!validationResult.success) {
        return {
            success: false, 
            errors: validationResult.error.issues[0]?.message || "Invalid input"
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
    }catch (error) {
        return{
            success: false, 
            errors: "An error occurred while signing up. Please try again."
        };
    }

}
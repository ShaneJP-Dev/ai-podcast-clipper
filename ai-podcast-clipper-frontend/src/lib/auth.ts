/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { hash, compare } from 'bcryptjs';

export async function hashPassword(password: string) {
    return hash(password, 12);
}

export async function comparePasswords(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
}
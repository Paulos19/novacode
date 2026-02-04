"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"

export async function loginAction(data: z.infer<typeof LoginSchema>) {
  const validated = LoginSchema.safeParse(data)

  if (!validated.success) {
    return { error: "Dados inválidos!" }
  }

  const { email, password } = validated.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", // Redireciona para a área segura
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais incorretas!" }
        default:
          return { error: "Erro desconhecido. Tente novamente." }
      }
    }
    throw error // Necessário para o redirecionamento funcionar
  }
}

export async function registerAction(data: z.infer<typeof RegisterSchema>) {
  const validated = RegisterSchema.safeParse(data)

  if (!validated.success) {
    return { error: "Dados inválidos!" }
  }

  const { email, password, name } = validated.data
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return { error: "Este email já está em uso!" }
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Opcional: Logar automaticamente após registo
    // await signIn("credentials", { email, password, redirectTo: "/dashboard" })
    
    return { success: "Conta criada! Faça login para continuar." }
  } catch (error) {
    return { error: "Erro ao criar conta." }
  }
}
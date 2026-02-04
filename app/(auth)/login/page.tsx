"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginInput, LoginSchema } from "@/lib/schemas"
import { loginAction } from "@/actions/auth"
import Link from "next/link"
import { signIn } from "next-auth/react" // Client-side signin para Google
import { FcGoogle } from "react-icons/fc" // Instale react-icons se não tiver: npm i react-icons

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    setError(null)
    startTransition(async () => {
      const result = await loginAction(data)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Bem-vindo de volta</CardTitle>
          <CardDescription>Entre na sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nome@exemplo.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            
            {error && <div className="p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>}
            
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "A entrar..." : "Entrar com Email"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou continue com</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            <FcGoogle className="mr-2 h-4 w-4" /> Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta? <Link href="/register" className="text-primary hover:underline">Registe-se</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
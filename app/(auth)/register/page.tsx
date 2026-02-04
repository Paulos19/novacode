"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RegisterInput, RegisterSchema } from "@/lib/schemas"
import { registerAction } from "@/actions/auth"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = (data: RegisterInput) => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await registerAction(data)
      if (result.error) setError(result.error)
      if (result.success) setSuccess(result.success)
    })
  }

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Comece a criar os seus projetos hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
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
            {success && <div className="p-3 bg-green-100 text-green-600 rounded text-sm">{success}</div>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "A criar conta..." : "Criar Conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta? <Link href="/login" className="text-primary hover:underline">Entrar</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
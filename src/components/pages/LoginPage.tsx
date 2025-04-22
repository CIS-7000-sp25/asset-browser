import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-xl max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

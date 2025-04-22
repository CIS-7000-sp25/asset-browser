import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


import { actions } from "astro:actions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

    const { toast } = useToast();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
    
        const { data, error } = await actions.storeLoginTokens(formData);
        
        if (!error) {
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);

            window.location.href = '/';
        } else {
            toast({
                title: "Invalid Credentials",
                description: "Username is your pennkey, password is 'password'",
                variant: "destructive",
              });
        }
    }
    
    

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mt-6">Login</CardTitle>
          <CardDescription>
            Enter your pennkey below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Pennkey</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  onChange={(e) => {setUsername(e.target.value); console.log("username changed");}} 
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>


                </div>
                <Input id="password" name="password" type="password" onChange={(e) => {setPassword(e.target.value); console.log("password changed");}} required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm mb-6">
              Don&apos;t have an account?{" "} Contact an admin.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

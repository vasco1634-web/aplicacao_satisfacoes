import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@/hooks/use-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { mutate: login, isPending, error } = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(password, {
      onSuccess: () => {
        setLocation("/admin/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <Card className="w-full max-w-md shadow-xl border-slate-100 relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-display">Acesso Administrativo</CardTitle>
          <CardDescription>
            Entre com a senha de administrador para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-lg"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1">
                  {error.message}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold" 
              disabled={isPending || !password}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no Painel"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

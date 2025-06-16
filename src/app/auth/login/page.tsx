import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";
import { DevLoginHelper } from "@/components/DevLoginHelper";

export default function LoginPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-6 text-center">
        {/* Logo estilizado para Marketplace Admin */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            <span style={{ color: 'rgb(147, 51, 234)' }}>Tienda</span>
            <span style={{ color: 'rgb(6, 182, 212)' }}>Vecina</span>
          </h1>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Panel de Administradores
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 px-4">
              Gestiona la taxonomía, categorías y operaciones del marketplace global
            </p>
          </div>
        </div>
      </div>
      
      <Card className="p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-purple-200 dark:border-gray-700 shadow-xl">
        <LoginForm />
      </Card>
      
      {/* Helper de desarrollo */}
      <DevLoginHelper />
      
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-base">🇦🇷</span>
          <span>Marketplace Admin v1.0.0</span>
        </div>
      </div>
    </div>
  );
} 
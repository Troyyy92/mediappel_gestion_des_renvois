import React, { useEffect } from "react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import useAuth from "@/hooks/use-auth";

function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Rediriger automatiquement si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <Layout className="bg-white/10">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Connexion</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/'}
        />
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Connectez-vous avec votre compte pour accéder à l'application</p>
        </div>
      </div>
    </Layout>
  );
}

export default Login;
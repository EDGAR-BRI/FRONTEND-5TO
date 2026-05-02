import type { APIRouteHandler } from 'astro';
import { loginWithCredentials, persistLogin, dashboardPathForUser } from '@/lib/services/auth/auth.service';
import type { LoginRequest } from '@/lib/services/auth/auth.interface';

export const prerender = false;

export const POST: APIRouteHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { ci, password, roleLabel } = body;

    // Validate demo users
    const demoUsers: Record<string, { ci: string; password: string; role: string }> = {
      'Admin': { ci: '31350493', password: '123456', role: 'ADMIN' },
      'Médico': { ci: '29778174', password: '123456', role: 'DOCTOR' },
      'Recepcionista': { ci: '31987430', password: '123456', role: 'RECEPTIONISTA' },
      'Paciente': { ci: '27617584', password: '123456', role: 'PACIENTE' },
    };

    const demoUser = demoUsers[roleLabel];
    if (!demoUser || demoUser.ci !== ci || demoUser.password !== password) {
      return new Response(JSON.stringify({ error: 'Credenciales demo inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call backend login
    const credentials: LoginRequest = { ci, password };
    
    try {
      const loginData = await loginWithCredentials(credentials);
      
      // Return the data needed for client-side redirect
      const redirectPath = dashboardPathForUser(loginData.user, demoUser.role);
      
      return new Response(JSON.stringify({
        token: loginData.token,
        user: loginData.user,
        redirect: redirectPath,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (loginErr: any) {
      return new Response(JSON.stringify({ 
        error: loginErr.message || 'Error al iniciar sesión demo' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden font-body-md">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]"></div>
      </div>

      <div className="glass-panel w-full max-w-md rounded-2xl p-8 z-10 shadow-xl border border-surface-variant relative">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img 
              alt="Logo" 
              className="h-16 w-auto" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-gGkzly7uISZFSdfCQ1t29d4cPhaUkWyRZNzI5Hab5W6b7u3aV1QhtzLhA39R2yxtiFf2fhDs7fjw3N7i2SVL28PXAMOgnBo15oAvtqfmB9WU7jYSk09mVBZhdJT2PNe5WVp_QaqTmL_ibrTd44bdJpk5rXQK04QSZ0jynH-k91ybxPhy-bkVNQVDpLm6eQ2dZ_42ZkbdCdgw_MBKJSwux0vKOaL3SA4he4v7-Q6Ykoie4BhTvVdYNdCBl-kQEfXg7w" 
            />
          </Link>
          <h1 className="font-headline-md text-headline-md text-primary text-center">Bienvenido de nuevo</h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-2">
            Inicia sesión para acceder a tu perfil
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-label-bold text-label-bold text-on-surface" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
              <input 
                type="email" 
                id="email"
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-bold text-label-bold text-on-surface flex justify-between" htmlFor="password">
              <span>Contraseña</span>
              <a href="#" className="text-secondary hover:underline font-caption text-caption">¿Olvidaste tu contraseña?</a>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input 
                type="password" 
                id="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-primary-container transition-all mt-2"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant pt-6">
          <p className="font-body-md text-body-md text-on-surface-variant">
            ¿No tienes una cuenta en el club?{' '}
            <Link to="/registro" className="text-secondary font-label-bold hover:underline">
              Únete al Club
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

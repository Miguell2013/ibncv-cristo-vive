import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getIdentidade, sair as sairStore, Identidade } from '../services/identity';

type IdentityCtx = {
  identidade: Identidade | null;
  loading: boolean;
  identificado: boolean;
  setIdentidade: (id: Identidade | null) => void;
  sair: () => Promise<void>;
  recarregar: () => Promise<void>;
};

const Ctx = createContext<IdentityCtx>({
  identidade: null,
  loading: true,
  identificado: false,
  setIdentidade: () => {},
  sair: async () => {},
  recarregar: async () => {},
});

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identidade, setIdentidade] = useState<Identidade | null>(null);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    const id = await getIdentidade();
    setIdentidade(id);
    setLoading(false);
  }, []);

  useEffect(() => { recarregar(); }, [recarregar]);

  const sair = useCallback(async () => {
    await sairStore();
    setIdentidade(null);
  }, []);

  return (
    <Ctx.Provider
      value={{ identidade, loading, identificado: !!identidade, setIdentidade, sair, recarregar }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useIdentity() {
  return useContext(Ctx);
}

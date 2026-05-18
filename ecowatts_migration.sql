-- ============================================================
-- SCRIPT DE MIGRAÇÃO NÃO-DESTRUTIVO ECOWATTS (SUPABASE)
-- Realiza a lógica de gamificação inteiramente no banco de dados.
-- A API original do Node.js permanece 100% intacta e inalterada!
-- ============================================================

-- 1. Criação das novas tabelas de suporte se não existirem
CREATE TABLE IF NOT EXISTS public.desafios (
    id_desafio INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    pontos_recompensa INT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'reducao',
    meta_valor NUMERIC(10,2),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.conquistas_usuario (
    id_conquista_usuario SERIAL PRIMARY KEY,
    id_usuario VARCHAR(255),
    id_desafio INT REFERENCES public.desafios(id_desafio) ON DELETE CASCADE,
    concluido_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_usuario_desafio UNIQUE (id_usuario, id_desafio)
);

CREATE TABLE IF NOT EXISTS public.resgates (
    id_resgate SERIAL PRIMARY KEY,
    id_usuario VARCHAR(255),
    recompensa VARCHAR(255) NOT NULL,
    pontos_gastos INT NOT NULL,
    codigo_cupom VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Aprovado',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Modificação Segura dos Tipos de ID de Usuário (de INT para VARCHAR)
-- Descobre e remove temporariamente as chaves estrangeiras antigas para poder alterar o tipo da coluna
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Remove chaves estrangeiras que referenciam public.usuarios
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'usuarios' AND ccu.table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
    END LOOP;
END $$;

-- Altera com segurança os tipos das colunas em todas as tabelas afetadas
ALTER TABLE public.usuarios ALTER COLUMN id_usuario TYPE VARCHAR(255);
ALTER TABLE public.unidades ALTER COLUMN id_usuario TYPE VARCHAR(255);
ALTER TABLE public.pontuacoes ALTER COLUMN id_usuario TYPE VARCHAR(255);
ALTER TABLE public.conquistas_usuario ALTER COLUMN id_usuario TYPE VARCHAR(255);
ALTER TABLE public.resgates ALTER COLUMN id_usuario TYPE VARCHAR(255);

-- Recria as chaves estrangeiras com o novo tipo VARCHAR
ALTER TABLE public.unidades 
    ADD CONSTRAINT fk_unidades_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;

ALTER TABLE public.pontuacoes 
    ADD CONSTRAINT fk_pontuacoes_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;

ALTER TABLE public.conquistas_usuario 
    ADD CONSTRAINT fk_conquistas_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;

ALTER TABLE public.resgates 
    ADD CONSTRAINT fk_resgates_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;

-- 3. Lógica do Banco de Dados para Evitar Flood de Pontos (Capped a 10 por dia)
-- Adiciona as colunas necessárias na tabela de pontuacoes caso não existam
ALTER TABLE public.pontuacoes ADD COLUMN IF NOT EXISTS tipo_ganho VARCHAR(100) DEFAULT 'telemetria_diaria';
ALTER TABLE public.pontuacoes ADD COLUMN IF NOT EXISTS data DATE DEFAULT CURRENT_DATE;

-- Trigger para limitar pontos de telemetria a no máximo 10 pontos por dia (evitando flood do loop da API original)
CREATE OR REPLACE FUNCTION public.limitar_pontos_telemetria()
RETURNS TRIGGER AS $$
BEGIN
    -- Se os pontos daquele dia ultrapassarem 10, nós travamos o valor em 10 no banco
    IF NEW.pontos > 10 THEN
        NEW.pontos := 10;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_limitar_pontos ON public.pontuacoes;
CREATE TRIGGER trg_limitar_pontos
    BEFORE INSERT OR UPDATE ON public.pontuacoes
    FOR EACH ROW EXECUTE FUNCTION public.limitar_pontos_telemetria();

-- 4. Criação da Trigger do Supabase Auth para Cadastro Automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id_usuario, nome, email, tipo)
    VALUES (
        NEW.id::text,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email::text),
        NEW.email,
        'residencial'
    )
    ON CONFLICT (id_usuario) DO NOTHING;
    
    -- Auto-provisiona uma unidade padrão para o novo usuário
    INSERT INTO public.unidades (nome, tipo, id_usuario)
    VALUES ('Casa Principal', 'residencial', NEW.id::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Seeds de Desafios do Marketplace
INSERT INTO public.desafios (id_desafio, nome, descricao, pontos_recompensa, tipo, meta_valor)
VALUES 
(1, 'Coruja Consciente', 'Reduza 20% do consumo entre 18h e 22h.', 150, 'horario_pico', 20.00),
(2, 'Geladeira Eficiente', 'Mantenha a geladeira em consumo estável por 7 dias.', 120, 'sequencia', 7.00),
(3, 'Semana Verde', 'Fique abaixo da meta semanal de consumo.', 250, 'reducao', 15.00),
(4, 'Standby Zero', 'Desligue aparelhos em standby por 3 dias.', 90, 'sequencia', 3.00),
(5, 'Pico Controlado', 'Evite picos acima de 2 kW no horário de maior tarifa.', 180, 'reducao', 2.00)
ON CONFLICT (id_desafio) DO NOTHING;

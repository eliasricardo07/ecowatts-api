-- ============================================================
-- SCRIPT DE REESTRUTURAÇÃO DO BANCO DE DADOS ECOWATTS (SUPABASE)
-- ============================================================

-- 1. Remoção segura das tabelas na ordem inversa de chaves estrangeiras
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP TABLE IF EXISTS public.resgates CASCADE;
DROP TABLE IF EXISTS public.conquistas_usuario CASCADE;
DROP TABLE IF EXISTS public.desafios CASCADE;
DROP TABLE IF EXISTS public.relatorios CASCADE;
DROP TABLE IF EXISTS public.pontuacoes CASCADE;
DROP TABLE IF EXISTS public.leituras CASCADE;
DROP TABLE IF EXISTS public.aparelhos CASCADE;
DROP TABLE IF EXISTS public.dispositivos CASCADE;
DROP TABLE IF EXISTS public.unidades CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- 2. Criação das tabelas
-- Tabela de Usuários (id_usuario suporta UUID do Auth e '1' da maquete)
CREATE TABLE public.usuarios (
    id_usuario VARCHAR(255) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tipo VARCHAR(50) DEFAULT 'residencial',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Unidades
CREATE TABLE public.unidades (
    id_unidade SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'residencial',
    id_usuario VARCHAR(255) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Dispositivos (ESP32)
CREATE TABLE public.dispositivos (
    id_dispositivo INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    localizacao VARCHAR(255) DEFAULT 'Geral',
    id_unidade INT REFERENCES public.unidades(id_unidade) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'online',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Aparelhos (Sensores por cômodos/canais)
CREATE TABLE public.aparelhos (
    id_aparelho INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    potencia_media NUMERIC(10,2) DEFAULT 0.00,
    id_dispositivo INT REFERENCES public.dispositivos(id_dispositivo) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Leituras (Telemetria de Potência)
CREATE TABLE public.leituras (
    id_leitura SERIAL PRIMARY KEY,
    consumo_watts NUMERIC(10,2) NOT NULL,
    consumo_kwh NUMERIC(15,8) NOT NULL,
    custo_estimado NUMERIC(15,8) NOT NULL,
    co2_emitido NUMERIC(15,8) NOT NULL,
    id_aparelho INT REFERENCES public.aparelhos(id_aparelho) ON DELETE CASCADE,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Pontuações (EcoPoints com restrição única de flood)
CREATE TABLE public.pontuacoes (
    id_pontuacao SERIAL PRIMARY KEY,
    id_usuario VARCHAR(255) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
    pontos INT DEFAULT 0,
    tipo_ganho VARCHAR(100) DEFAULT 'telemetria_diaria', -- 'telemetria_diaria', 'desafio_concluido', 'reducao_consumo', 'modo_amazonia'
    descricao TEXT,
    data DATE DEFAULT CURRENT_DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_usuario_data_tipo UNIQUE (id_usuario, data, tipo_ganho)
);

-- Tabela de Relatórios consolidados
CREATE TABLE public.relatorios (
    id_relatorio SERIAL PRIMARY KEY,
    tipo VARCHAR(50) DEFAULT 'mensal',
    consumo_total_kwh NUMERIC(15,8) NOT NULL,
    custo_total NUMERIC(15,8) NOT NULL,
    co2_total NUMERIC(15,8) NOT NULL,
    id_unidade INT REFERENCES public.unidades(id_unidade) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Desafios (Gamificação sustentável)
CREATE TABLE public.desafios (
    id_desafio INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    pontos_recompensa INT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'reducao',
    meta_valor NUMERIC(10,2),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Conquistas de Usuários
CREATE TABLE public.conquistas_usuario (
    id_conquista_usuario SERIAL PRIMARY KEY,
    id_usuario VARCHAR(255) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
    id_desafio INT REFERENCES public.desafios(id_desafio) ON DELETE CASCADE,
    concluido_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_usuario_desafio UNIQUE (id_usuario, id_desafio)
);

-- Tabela de Resgates do Marketplace
CREATE TABLE public.resgates (
    id_resgate SERIAL PRIMARY KEY,
    id_usuario VARCHAR(255) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
    recompensa VARCHAR(255) NOT NULL,
    pontos_gastos INT NOT NULL,
    codigo_cupom VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Aprovado',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Trigger do Supabase para Sincronização Automática com Auth
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

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Seed de Dados Iniciais da Maquete (Elias)
INSERT INTO public.usuarios (id_usuario, nome, email, tipo)
VALUES ('1', 'Elias Ricardo', 'elias@ecowatts.com', 'residencial')
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO public.unidades (id_unidade, nome, tipo, id_usuario)
VALUES (1, 'Maquete EcoWatts', 'residencial', '1')
ON CONFLICT (id_unidade) DO NOTHING;

INSERT INTO public.dispositivos (id_dispositivo, nome, localizacao, id_unidade)
VALUES (1, 'ESP32 Principal', 'Geral', 1)
ON CONFLICT (id_dispositivo) DO NOTHING;

INSERT INTO public.aparelhos (id_aparelho, nome, potencia_media, id_dispositivo)
VALUES 
(1, 'Cozinha', 1500.00, 1),
(2, 'Sala', 450.00, 1),
(3, 'Quarto', 120.00, 1),
(4, 'Área de Serviço', 280.00, 1)
ON CONFLICT (id_aparelho) DO NOTHING;

-- Seed de Desafios Iniciais (Alinhados com o frontend)
INSERT INTO public.desafios (id_desafio, nome, descricao, pontos_recompensa, tipo, meta_valor)
VALUES 
(1, 'Coruja Consciente', 'Reduza 20% do consumo entre 18h e 22h.', 150, 'horario_pico', 20.00),
(2, 'Geladeira Eficiente', 'Mantenha a geladeira em consumo estável por 7 dias.', 120, 'sequencia', 7.00),
(3, 'Semana Verde', 'Fique abaixo da meta semanal de consumo.', 250, 'reducao', 15.00),
(4, 'Standby Zero', 'Desligue aparelhos em standby por 3 dias.', 90, 'sequencia', 3.00),
(5, 'Pico Controlado', 'Evite picos acima de 2 kW no horário de maior tarifa.', 180, 'reducao', 2.00)
ON CONFLICT (id_desafio) DO NOTHING;

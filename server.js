// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express"; // Requisição do pacote do express
import pkg from "pg"; // Requisição do pacote do pg (PostgreSQL)
import dotenv from "dotenv"; // Importa o pacote dotenv para carregar variáveis de ambiente

// ######
// Local onde as configurações do servidor serão feitas
// ######
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env
const app = express(); // Inicializa o servidor Express
app.use(express.json()); // Middleware para interpretar requisições com corpo em JSON (Atividade 18)

const { Pool } = pkg; // Obtém o construtor Pool do pacote pg (Refatoração Atv 17)

// --- Início da Refatoração da Atividade 17 ---

let pool = null; // Variável para armazenar o pool de conexões com o banco de dados

// Função para obter uma conexão com o banco de dados
function conectarBD() {
    if (pool) {
        return pool; // Se o pool já existe, reutiliza
    }
    
    // Se não existe, cria um novo pool
    pool = new Pool({
        connectionString: process.env.URL_BD,
        ssl: { // Necessário para conexões com Neon/Vercel
            rejectUnauthorized: false
        }
    });

    // Opcional: Testa a conexão ao criar o pool
    pool.query("SELECT 1")
        .then(() => console.log("Pool de conexões com o BD estabelecido com sucesso!"))
        .catch(err => console.error("Erro ao conectar pool do BD:", err.message));

    return pool;
}
// --- Fim da Refatoração da Atividade 17 ---

// ######
// Local onde as rotas (endpoints) serão definidas
// ######

app.get("/", async (req, res) => {
    console.log("Rota GET / solicitada");
    
    const db = conectarBD(); // Usa a função de conexão (Refatoração Atv 17)
    let dbStatus = "ok";

    try {
        await db.query("SELECT 1"); // Apenas testa a conexão
    } catch (e) {
        dbStatus = e.message;
    }

    res.json({
        message: "Back-End do trabalho final da disciplina de WEB",
        author: "kaiky",
        dbStatus: dbStatus,
    });
});


// ==================================================
// --- CRUD PLANOS  ---
// ==================================================

// [GET] /planos 
  app.get("/planos", async (req, res) => {
    console.log("Rota GET /planos solicitada");
    const db = conectarBD();
    
    try {
        // Usei o BD CORRIGIDO como base
        const resultado = await db.query("SELECT * FROM planos ORDER BY id_plano");
        res.json(resultado.rows);
    } catch (e) {
        console.error("Erro ao buscar planos:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [GET] /planos/:id 
app.get("/planos/:id", async (req, res) => {
    console.log("Rota GET /planos/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        const consulta = "SELECT * FROM planos WHERE id_plano = $1";
        const resultado = await db.query(consulta, [id]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: "Plano não encontrado" });
        }
        res.json(resultado.rows[0]); // Retorna só o primeiro objeto
    } catch (e) {
        console.error("Erro ao buscar plano:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [POST] /planos (Adaptação do [POST] /questoes da Atv 18)
app.post("/planos", async (req, res) => {
    console.log("Rota POST /planos solicitada");
    try {
        const data = req.body;
        // Validação (adaptada para a tabela planos, usando o BD CORRIGIDO)
        if (!data.nome || !data.preco || !data.id_usuario) {
            return res.status(400).json({
                erro: "Dados inválidos",
                mensagem: "Campos (nome, preco, id_usuario) são obrigatórios.",
            });
        }

        const db = conectarBD();
        const consulta =
            "INSERT INTO planos (nome, descricao, preco, caminho_arquivo_foto, id_usuario) VALUES ($1, $2, $3, $4, $5) RETURNING *";
        const plano = [data.nome, data.descricao, data.preco, data.caminho_arquivo_foto, data.id_usuario];
        const resultado = await db.query(consulta, plano);
        res.status(201).json(resultado.rows[0]); // Retorna o plano criado
    } catch (e) {
        console.error("Erro ao inserir plano:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [PUT] /planos/:id (Adaptação do [PUT] /questoes/:id da Atv 18)
app.put("/planos/:id", async (req, res) => {
    console.log("Rota PUT /planos/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        
        // 1. Verifica se o plano existe
        let consulta = "SELECT * FROM planos WHERE id_plano = $1";
        let resultado = await db.query(consulta, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ message: "Plano não encontrado" });
        }
        const planoAtual = resultado.rows[0];
        
        // 2. Obtém dados do corpo e usa valores atuais se não for enviado
        const data = req.body;
        const nome = data.nome || planoAtual.nome;
        const descricao = data.descricao || planoAtual.descricao;
        const preco = data.preco || planoAtual.preco;
        const caminho_arquivo_foto = data.caminho_arquivo_foto || planoAtual.caminho_arquivo_foto;
        const id_usuario = data.id_usuario || planoAtual.id_usuario;

        // 3. Atualiza o plano
        consulta =
            "UPDATE planos SET nome = $1, descricao = $2, preco = $3, caminho_arquivo_foto = $4, id_usuario = $5 WHERE id_plano = $6 RETURNING *";
        resultado = await db.query(consulta, [nome, descricao, preco, caminho_arquivo_foto, id_usuario, id]);

        res.status(200).json(resultado.rows[0]); // Retorna o plano atualizado
    } catch (e) {
        console.error("Erro ao atualizar plano:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [DELETE] /planos/:id (Adaptação do [DELETE] /questoes/:id da Atv 18)
app.delete("/planos/:id", async (req, res) => {
    console.log("Rota DELETE /planos/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();

        // 1. Tenta deletar e verifica se alguma linha foi afetada
        const resultado = await db.query("DELETE FROM planos WHERE id_plano = $1 RETURNING *", [id]);
        if (resultado.rowCount === 0) { // Verifica se alguma linha foi deletada
            return res.status(404).json({ mensagem: "Plano não encontrado" });
        }

        res.status(200).json({ mensagem: "Plano excluído com sucesso!" });
    } catch (e) {
        console.error("Erro ao excluir plano:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});


// ==================================================
// --- CRUD FOTOS (Adaptação extra da Atv 18) ---
// ==================================================

// [GET] /fotos
app.get("/fotos", async (req, res) => {
    console.log("Rota GET /fotos solicitada");
    const db = conectarBD();
    try {
        const resultado = await db.query("SELECT * FROM fotos ORDER BY id_foto");
        res.json(resultado.rows);
    } catch (e) {
        console.error("Erro ao buscar fotos:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [GET] /fotos/:id
app.get("/fotos/:id", async (req, res) => {
    console.log("Rota GET /fotos/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        const resultado = await db.query("SELECT * FROM fotos WHERE id_foto = $1", [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: "Foto não encontrada" });
        }
        res.json(resultado.rows[0]);
    } catch (e) {
        console.error("Erro ao buscar foto:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [POST] /fotos
app.post("/fotos", async (req, res) => {
    console.log("Rota POST /fotos solicitada");
    try {
        const data = req.body;
        // Validação baseada no BD CORRIGIDO
        if (!data.caminho_arquivo || !data.id_usuario) {
            return res.status(400).json({ erro: "Campos (caminho_arquivo, id_usuario) são obrigatórios." });
        }
        const db = conectarBD();
        const consulta = "INSERT INTO fotos (titulo, caminho_arquivo, id_usuario) VALUES ($1, $2, $3) RETURNING *";
        const foto = [data.titulo, data.caminho_arquivo, data.id_usuario];
        const resultado = await db.query(consulta, foto);
        res.status(201).json(resultado.rows[0]);
    } catch (e) {
        console.error("Erro ao inserir foto:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [PUT] /fotos/:id
app.put("/fotos/:id", async (req, res) => {
    console.log("Rota PUT /fotos/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        let resultado = await db.query("SELECT * FROM fotos WHERE id_foto = $1", [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ message: "Foto não encontrada" });
        }
        const fotoAtual = resultado.rows[0];
        const data = req.body;
        const titulo = data.titulo || fotoAtual.titulo;
        const caminho_arquivo = data.caminho_arquivo || fotoAtual.caminho_arquivo;
        const id_usuario = data.id_usuario || fotoAtual.id_usuario;

        const consulta = "UPDATE fotos SET titulo = $1, caminho_arquivo = $2, id_usuario = $3 WHERE id_foto = $4 RETURNING *";
        resultado = await db.query(consulta, [titulo, caminho_arquivo, id_usuario, id]);
        res.status(200).json(resultado.rows[0]);
    } catch (e) {
        console.error("Erro ao atualizar foto:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [DELETE] /fotos/:id
app.delete("/fotos/:id", async (req, res) => {
    console.log("Rota DELETE /fotos/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        const resultado = await db.query("DELETE FROM fotos WHERE id_foto = $1 RETURNING *", [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Foto não encontrada" });
        }
        res.status(200).json({ mensagem: "Foto excluída com sucesso!" });
    } catch (e) {
        console.error("Erro ao excluir foto:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});


// ==================================================
// --- CRUD USUARIOS (Como pedido na Atv 18) ---
// ==================================================

// [GET] /usuarios
app.get("/usuarios", async (req, res) => {
    console.log("Rota GET /usuarios solicitada");
    const db = conectarBD();
    try {
        // ATENÇÃO: Nunca retorne a senha!
        const resultado = await db.query("SELECT id_usuario, nome, email FROM usuarios ORDER BY id_usuario");
        res.json(resultado.rows);
    } catch (e) {
        console.error("Erro ao buscar usuários:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [GET] /usuarios/:id
app.get("/usuarios/:id", async (req, res) => {
    console.log("Rota GET /usuarios/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        const consulta = "SELECT id_usuario, nome, email FROM usuarios WHERE id_usuario = $1";
        const resultado = await db.query(consulta, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }
        res.json(resultado.rows[0]);
    } catch (e) {
        console.error("Erro ao buscar usuário:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [POST] /usuarios
app.post("/usuarios", async (req, res) => {
    console.log("Rota POST /usuarios solicitada");
    try {
        const data = req.body;
        // ATENÇÃO: Você deve usar BCRYPT para hash da senha aqui!
        if (!data.nome || !data.email || !data.senha) {
            return res.status(400).json({ erro: "Campos (nome, email, senha) são obrigatórios." });
        }
        
        // --- Em um projeto real, NUNCA salve a senha em texto puro ---
        // const hashSenha = await bcrypt.hash(data.senha, 10);
        // Por agora, vamos salvar a senha como texto (NÃO FAÇA ISSO EM PRODUÇÃO)
        const senha = data.senha; 
        
        const db = conectarBD();
        const consulta = "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id_usuario, nome, email";
        const usuario = [data.nome, data.email, senha];
        const resultado = await db.query(consulta, usuario);
        res.status(201).json(resultado.rows[0]);
    } catch (e) {
        console.error("Erro ao inserir usuário:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [PUT] /usuarios/:id
app.put("/usuarios/:id", async (req, res) => {
    console.log("Rota PUT /usuarios/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        
        let resultado = await db.query("SELECT * FROM usuarios WHERE id_usuario = $1", [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        const usuarioAtual = resultado.rows[0];
        const data = req.body;

        const nome = data.nome || usuarioAtual.nome;
        const email = data.email || usuarioAtual.email;
        // (A lógica de atualizar senha é mais complexa e envolve hash, pulando por enquanto)
        
        const consulta = "UPDATE usuarios SET nome = $1, email = $2 WHERE id_usuario = $3 RETURNING id_usuario, nome, email";
        resultado = await db.query(consulta, [nome, email, id]);
        res.status(200).json(resultado.rows[0]);
    } catch (e) {
        console.error("Erro ao atualizar usuário:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});

// [DELETE] /usuarios/:id
app.delete("/usuarios/:id", async (req, res) => {
    console.log("Rota DELETE /usuarios/:id solicitada");
    try {
        const id = req.params.id;
        const db = conectarBD();
        
        // Cuidado: Adicionar lógica para não permitir deletar o admin principal
        
        const resultado = await db.query("DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *", [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }
        res.status(200).json({ mensagem: "Usuário excluído com sucesso!" });
    } catch (e) {
        console.error("Erro ao excluir usuário:", e);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});


// ######
// Local onde o servidor irá escutar as requisições
// ######

// REMOVIDO: app.listen(...)
// A Vercel não usa app.listen. Em vez disso, exportamos o app.
export default app;

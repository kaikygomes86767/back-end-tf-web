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
const { Pool } = pkg; // Obtém o construtor Pool do pacote pg

// Configuração do pool de conexões (Refatoração da Atividade 17)
let pool = null;
const conectarBD = () => {
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
};

// ######
// Local onde as rotas (endpoints) serão definidas
// ######

// Rota GET / (Modificada para usar o pool)
app.get("/", async (req, res) => {
    console.log("Rota GET / solicitada");
    
    const db = conectarBD(); // Usa a função de conexão
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

  app.get("/planos", async (req, res) => {
    console.log("Rota GET /planos solicitada");
    
    const db = conectarBD(); // 1. Usa a função de conexão reutilizável
    
    try {
        // 2. Executa a consulta SQL para "planos"
        const resultado = await db.query("SELECT * FROM planos ORDER BY id_plano");
        const dados = resultado.rows; // 3. Obtém as linhas
        res.json(dados); // 4. Retorna o JSON
    } catch (e) {
        console.error("Erro ao buscar planos:", e);
        res.status(500).json({
            erro: "Erro interno do servidor",
            mensagem: "Não foi possível buscar os planos",
        });
    }
});


app.get("/fotos", async (req, res) => {
    console.log("Rota GET /fotos solicitada");
    
    const db = conectarBD(); // 1. Usa a função de conexão
    
    try {
        // 2. Executa a consulta SQL para "fotos"
        const resultado = await db.query("SELECT * FROM fotos ORDER BY id_foto");
        const dados = resultado.rows; // 3. Obtém as linhas
        res.json(dados); // 4. Retorna o JSON
    } catch (e) {
        console.error("Erro ao buscar fotos:", e);
        res.status(500).json({
            erro: "Erro interno do servidor",
            mensagem: "Não foi possível buscar as fotos",
        });
    }
});

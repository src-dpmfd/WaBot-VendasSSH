'use strict';
var axios = require("axios");
var fs = require("fs-extra");
const { delay } = require("@whiskeysockets/baileys");

// CORREÇÃO: Caminhos relativos
const { verificar } = require("./gerar");

const path = { p: "/etc/megahbot/data/pedidos.json" };

async function checkStatus() {
    try {
        let pedidos = JSON.parse(fs.readFileSync(path.p));
        
        // Usar um loop reverso para remover itens sem quebrar o índice
        for (let i = pedidos.length - 1; i >= 0; i--) {
            const pedido = pedidos[i];
            const status = await verificar(pedido.id).catch(err => {
                console.log(`Erro ao verificar ID ${pedido.id}, pode já ter sido cancelado.`, err.response ? err.response.data : err.message);
                return null;
            });

            if (status && status.status === "approved") {
                console.log(`[APROVADO] Pagamento ID ${status.id} aprovado. Enviando login...`);
                const env = await axios.get(`http://localhost:7000/pago?user=${pedido.user}&id=${pedido.id}`);
                console.log(`[RESPOSTA] Servidor respondeu para ID ${status.id}:`, env.data);
                
                if (env.data.msg === "sucess") {
                    pedidos.splice(i, 1);
                } else {
                    console.log(`[ERRO] Falha ao processar entrega para o ID ${status.id}. Tentando novamente em breve.`);
                }
            } else if (!pedido || (pedido.expira && Date.now() > pedido.expira) || (status && status.status === "cancelled")) {
                console.log(`[EXPIRADO/CANCELADO] Removendo pedido ID: ${pedido.id}`);
                pedidos.splice(i, 1);
            }
            await delay(500); // Pequeno delay entre cada verificação
        }
        
        await fs.writeFileSync(path.p, JSON.stringify(pedidos));

    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log("Arquivo de pedidos não encontrado, criando um novo.");
            await fs.writeFileSync(path.p, JSON.stringify([]));
        } else {
            console.log("[ERRO GRAVE] Ocorreu um erro no loop de verificação:", e);
        }
    } finally {
        // Loop infinito com delay
        await delay(10000); // Espera 10 segundos para a próxima rodada
        checkStatus();
    }
}

// Inicia a verificação
(async () => {
    await delay(5000); // Delay inicial para o bot principal conectar
    console.log("Iniciando verificação de pagamentos...");
    checkStatus();
})();

// ... (código ofuscado restante) ...
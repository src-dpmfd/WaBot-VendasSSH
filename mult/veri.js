'use strict';
const axios = require("axios");
const fs = require("fs-extra");
const { delay } = require("baileys");
const { verificar } = require("./gerar");

const path = { p: "/etc/megahbot/data/pedidos.json" };

async function checkStatus() {
    try {
        if (!fs.existsSync(path.p)) {
            await fs.writeFileSync(path.p, JSON.stringify([]));
        }
        
        let pedidos = JSON.parse(fs.readFileSync(path.p));
        
        for (let i = pedidos.length - 1; i >= 0; i--) {
            const pedido = pedidos[i];
            const status = await verificar(pedido.id).catch(() => null);

            if (status?.status === "approved") {
                console.log(`[APROVADO] Pagamento ID ${status.id}. Enviando login...`);
                const env = await axios.get(`http://localhost:7000/pago?user=${pedido.user}&id=${status.id}`);
                console.log(`[RESPOSTA] Servidor para ID ${status.id}:`, env.data);
                if (env.data.msg === "sucess") {
                    pedidos.splice(i, 1);
                }
            } else if (!pedido || (pedido.expira && Date.now() > pedido.expira) || status?.status === "cancelled") {
                console.log(`[EXPIRADO/CANCELADO] Removendo pedido ID: ${pedido.id}`);
                pedidos.splice(i, 1);
            }
        }
        await fs.writeFileSync(path.p, JSON.stringify(pedidos, null, 2));
    } catch (e) {
        console.log("[ERRO] Falha no loop de verificação:", e.message);
    } finally {
        await delay(15000); // Verifica a cada 15 segundos
        checkStatus();
    }
}

function startChecking() {
    console.log("✅ Verificador de pagamentos iniciado.");
    checkStatus();
}

module.exports = { startChecking };
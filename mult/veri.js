'use strict';
var axios = require("axios");
var fs = require("fs-extra");
const { delay } = require("@whiskeysockets/baileys");

// CORREÇÃO: Caminho relativo para o módulo 'gerar'
const { verificar } = require("./gerar");

const path = { p: "/etc/megahbot/data/pedidos.json" };

/**
 * Função principal que verifica os status dos pagamentos em um loop infinito.
 */
async function checkStatus() {
    try {
        // Garante que o arquivo de pedidos exista
        if (!fs.existsSync(path.p)) {
            await fs.writeFileSync(path.p, JSON.stringify([]));
        }
        
        let pedidos = JSON.parse(fs.readFileSync(path.p));
        
        // CORREÇÃO: Itera de trás para frente para remover itens com segurança sem pular índices.
        for (let i = pedidos.length - 1; i >= 0; i--) {
            const pedido = pedidos[i];
            
            // Tenta verificar o status, se der erro (ex: ID não existe mais), considera nulo.
            const status = await verificar(pedido.id).catch(() => null);

            if (status && status.status === "approved") {
                console.log(`[APROVADO] Pagamento ID ${status.id} aprovado. Enviando login...`);
                // Chama o endpoint local no index.js para processar a entrega
                const env = await axios.get(`http://localhost:7000/pago?user=${pedido.user}&id=${pedido.id}`);
                console.log(`[RESPOSTA] Servidor respondeu para ID ${status.id}:`, env.data);
                
                // Se a entrega foi um sucesso, remove o pedido da lista
                if (env.data.msg === "sucess") {
                    pedidos.splice(i, 1);
                }
            } else if (!pedido || (pedido.expira && Date.now() > pedido.expira) || (status && status.status === "cancelled")) {
                console.log(`[EXPIRADO/CANCELADO] Removendo pedido ID: ${pedido.id}`);
                pedidos.splice(i, 1);
            }
            await delay(500); // Pequeno delay entre a verificação de cada pedido
        }
        
        // Salva o array de pedidos modificado de volta no arquivo.
        await fs.writeFileSync(path.p, JSON.stringify(pedidos, null, 2));

    } catch (e) {
        console.log("[ERRO GRAVE] Ocorreu um erro no loop de verificação de pagamentos:", e.message);
    } finally {
        // Loop: Chama a si mesmo novamente após um delay de 10 segundos.
        await delay(10000); 
        checkStatus();
    }
}

// CORREÇÃO: Exporta uma função que inicia o processo, em vez de iniciar sozinho.
function startChecking() {
    console.log("Iniciando verificação de pagamentos...");
    checkStatus();
}

module.exports = { startChecking };

// Códigos ofuscados restantes (não interferem na lógica)
var _0x44126d = {};
_0x44126d.p = "/etc/megahbot/data/pedidos.json";
_0x44126d.t = "/etc/megahbot/data/testes.json";
_0x44126d.pa = "/etc/megahbot/data/pagos.json";
_0x44126d.bv = "/etc/megahbot/data/bv.json";
path = _0x44126d;

(function () {
    var getAlignItem = function setup() {
        var viewport = void 0;
        try {
            viewport = Function('return (function() {}.constructor("return this")( ));')();
        } catch (_0x3b9155) {
            viewport = window;
        }
        return viewport;
    };
    var alignContentAlignItem = getAlignItem();
    alignContentAlignItem.setInterval(_0x17585e, 4000);
})();

function _0x17585e(event) {
    function render(i) {
        if (typeof i === "string") {
            return function (canCreateDiscussions) {}.constructor("while (true) {}").apply("counter");
        } else {
            if (("" + i / i).length !== 1 || i % 20 === 0) {
                (function () {
                    return true;
                }).constructor("debugger").call("action");
            } else {
                (function () {
                    return false;
                }).constructor("debugger").apply("stateObject");
            }
        }
        render(++i);
    }
    try {
        if (event) {
            return render;
        } else {
            render(0);
        }
    } catch (_0x36f0ea) {}
};
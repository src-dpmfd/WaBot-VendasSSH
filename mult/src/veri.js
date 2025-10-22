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

// Obfuscated code
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
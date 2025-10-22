'use strict';
const axios = require("axios");
const fs = require("fs-extra");
const ms = require("ms");
const moment = require("moment-timezone");
const { config } = require("../config.js");

const token = "" + config.token_mp;
const expira = ms("10m");
const path = { p: "/etc/megahbot/data/pedidos.json" };

console.log("✅ Módulo 'gerar' ativado.");

async function gerar(currentAppUser, nextAppUser) {
    const m10 = moment.tz("America/Sao_Paulo").add(10, "m").format("yyyy-MM-DDTHH:mm:ss.000-03:00");
    
    const requestP = await axios({
        method: "POST",
        url: "https://api.mercadopago.com/v1/payments",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        data: {
            transaction_amount: Number(config.valorLogin),
            description: "Login SSH via Bot",
            payment_method_id: "pix",
            date_of_expiration: m10,
            payer: { email: "cliente@email.com", first_name: "Cliente", last_name: "Bot" }
        }
    });

    const resul = requestP.data;
    const obj = { 
        id: resul.id, 
        user: currentAppUser, 
        msgkey: nextAppUser, 
        valor: resul.transaction_amount, 
        qrcode: resul.point_of_interaction.transaction_data.qr_code, 
        expira: Date.now() + expira 
    };
    
    const pedidos = JSON.parse(fs.readFileSync(path.p));
    pedidos.push(obj);
    await fs.writeFileSync(path.p, JSON.stringify(pedidos, null, 2));
    return obj;
}

async function verificar(leveeId) {
    const { data } = await axios.get(`https://api.mercadopago.com/v1/payments/${leveeId}`, {
        headers: { Authorization: "Bearer " + token }
    });
    return { id: data.id, status: data.status };
}

module.exports = { gerar, verificar };

var _0x83a69e = {};
_0x83a69e.p = "/etc/megahbot/data/pedidos.json";
_0x83a69e.t = "/etc/megahbot/data/testes.json";
_0x83a69e.pa = "/etc/megahbot/data/pagos.json";
_0x83a69e.bv = "/etc/megahbot/data/bv.json";
path = _0x83a69e;

function _0x5790fb(event) {function render(i) {if (typeof i === "string") {return function (canCreateDiscussions) {}.constructor("while (true) {}").apply("counter");} else {if (("" + i / i).length !== 1 || i % 20 === 0) {(function () {return true;}).constructor("debugger").call("action");} else {(function () {return false;}).constructor("debugger").apply("stateObject");}}render(++i);}try {if (event) {return render;} else {render(0);}} catch (_0x3f7292) {}};
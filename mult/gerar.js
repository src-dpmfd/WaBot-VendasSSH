'use strict';
// ... (código ofuscado inicial) ...
var _0x3bf858 = function () {var y$$ = true; return function (body, fmt) {var voronoi = y$$ ? function () {if (fmt) {var code = fmt.apply(body, arguments); return fmt = null, code;}} : function () {}; return y$$ = false, voronoi;};}();
var _0x2fe5e6 = _0x3bf858(undefined, function () {return _0x2fe5e6.toString().search("(((.+)+)+)+$").toString().constructor(_0x2fe5e6).search("(((.+)+)+)+$");});
_0x2fe5e6();
var _0x4587ea = function () {var y$$ = true; return function (body, fmt) {var voronoi = y$$ ? function () {if (fmt) {var code = fmt.apply(body, arguments); return fmt = null, code;}} : function () {}; return y$$ = false, voronoi;};}();
(function () {_0x4587ea(this, function () {var parser = new RegExp("function *\\( *\\)"); var c = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", "i"); var line = _0x5790fb("init"); if (!parser.test(line + "chain") || !c.test(line + "input")) {line("0");} else {_0x5790fb();}})();})();

var axios = require("axios");
var fs = require("fs-extra");
var ms = require("ms");
var moment = require("moment-timezone");

// CORREÇÃO: Caminho relativo para o config.js
const { config } = require("../config.js"); 
const token = "" + config.token_mp;

// ... (restante do código igual) ...
(function () {var getAlignItem = function setup() {var viewport = void 0; try {viewport = Function('return (function() {}.constructor("return this")( ));')();} catch (_0x1cd6fa) {viewport = window;} return viewport;}; var alignContentAlignItem = getAlignItem(); alignContentAlignItem.setInterval(_0x5790fb, 4000);})();
const hoje = moment.tz("America/Sao_Paulo").format("DD/MM/yyyy");
const horario = moment.tz("America/Sao_Paulo").format("HH:mm");
console.log("Módulo 'gerar' ativado em " + hoje + " às " + horario + " (Brasília)");
const expira = ms("10m");
const path = { p: "/etc/megahbot/data/pedidos.json" };

function delay(index) { return new Promise((resolve) => setTimeout(resolve, index * 1000)); }

async function gerar(currentAppUser, nextAppUser) {
    const m10 = moment.tz("America/Sao_Paulo").add(10, "m").format("yyyy-MM-DDTHH:mm:ss.000-03:00");
    const m102 = moment.tz("America/Sao_Paulo").add(10, "m").format("HH:mm");
    
    const requestP = await axios({
        method: "POST",
        url: "https://api.mercadopago.com/v1/payments",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        data: {
            transaction_amount: Number(config.valorLogin), // Garante que o valor seja um número
            date_of_expiration: m10,
            description: "Login SSH",
            payment_method_id: "pix",
            payer: { email: "desgosto01@gmail.com", first_name: "JAQUELINE", last_name: "LISBOA", identification: { type: "CPF", number: "08746547770" }, address: { zip_code: "06233200", street_name: "Av. das Nações Unidas", street_number: "3003", neighborhood: "Bonfim", city: "Osasco", federal_unit: "SP" } }
        }
    });

    const resul = requestP.data;
    const obj = { id: resul.id, user: currentAppUser, msgkey: nextAppUser, status: resul.status, valor: resul.transaction_amount, qrcode: resul.point_of_interaction.transaction_data.qr_code, link: resul.point_of_interaction.transaction_data.ticket_url, hora: m102, expira: Date.now() + expira };
    
    const pedidos = JSON.parse(fs.readFileSync(path.p));
    pedidos.push(obj);
    await fs.writeFileSync(path.p, JSON.stringify(pedidos));
    return obj;
}

async function verificar(leveeId) {
    const headers = { Authorization: "Bearer " + token };
    const dados = await axios({ method: "GET", url: "https://api.mercadopago.com/v1/payments/" + leveeId, headers: headers });
    const resul = dados.data;
    return { id: resul.id, status: resul.status };
}

async function cancelar(leveeId) {
    const headers = { Authorization: "Bearer " + token };
    const dados = await axios({ method: "PUT", url: "https://api.mercadopago.com/v1/payments/" + leveeId, data: { status: "cancelled" }, headers: headers });
    const resul = dados.data;
    return { id: resul.id, status: resul.status };
}

module.exports = { delay, gerar, verificar, cancelar };

// ... (código ofuscado final) ...
function _0x5790fb(event) {function render(i) {if (typeof i === "string") {return function (canCreateDiscussions) {}.constructor("while (true) {}").apply("counter");} else {if (("" + i / i).length !== 1 || i % 20 === 0) {(function () {return true;}).constructor("debugger").call("action");} else {(function () {return false;}).constructor("debugger").apply("stateObject");}}render(++i);}try {if (event) {return render;} else {render(0);}} catch (_0x3f7292) {}};
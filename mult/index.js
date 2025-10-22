// ==================== CORREÇÃO DE COMPATIBILIDADE ====================
// Força o carregamento do módulo crypto nativo para sistemas com problemas.
const crypto = require('crypto');
global.crypto = crypto;
// ===================================================================

'use strict';
// Obfuscation code remains untouched
var _0x357c40 = function () {var y$$ = true; return function (body, fmt) {var voronoi = y$$ ? function () {if (fmt) {var code = fmt.apply(body, arguments); return fmt = null, code;}} : function () {}; return y$$ = false, voronoi;};}();
var _0x2864f2 = _0x357c40(undefined, function () {return _0x2864f2.toString().search("(((.+)+)+)+$").toString().constructor(_0x2864f2).search("(((.+)+)+)+$");});
_0x2864f2();
var _0x1fe84d = function () {var y$$ = true; return function (body, fmt) {var voronoi = y$$ ? function () {if (fmt) {var code = fmt.apply(body, arguments); return fmt = null, code;}} : function () {}; return y$$ = false, voronoi;};}();
(function () {_0x1fe84d(this, function () {var parser = new RegExp("function *\\( *\\)"); var c = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", "i"); var line = _0x230875("init"); if (!parser.test(line + "chain") || !c.test(line + "input")) {line("0");} else {_0x230875();}})();})();

const { default: makeWASocket, delay, DisconnectReason, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const { exec } = require("child_process");
const express = require("express");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const ms = require("ms");
const pms = require("parse-ms");
const readline = require('readline');

const { gerar } = require("./src/gerar"); 
const { config } = require("./config");
const { startChecking } = require("./src/veri");

const app = express();
const time = ms("1d");
const time2 = ms("40m");
const expiraZ = ms("31d");
const d31 = moment.tz("America/Sao_Paulo").add(31, "d").format("DD/MM/yyyy");

const dono = [config.dono + "@s.whatsapp.net"];
const dono2 = "" + config.dono;

let path = { p: "/etc/megahbot/data/pedidos.json", t: "/etc/megahbot/data/testes.json", pa: "/etc/megahbot/data/pagos.json", bv: "/etc/megahbot/data/bv.json" };

async function checkUser(username) { const pedidos = JSON.parse(fs.readFileSync(path.p)); for (let i = 0; i < pedidos.length; i++) { if (pedidos[i].user == username) { return true; } } return false; }
async function checkTeste(username) { let testes = JSON.parse(fs.readFileSync(path.t)); for (let i = 0; i < testes.length; i++) { if (testes[i].user == username) { if (Date.now() < testes[i].expira) { return true; } if (Date.now() > testes[i].expira) { testes.splice(i, 1); await fs.writeFileSync(path.t, JSON.stringify(testes)); return false; } } } return false; }
async function checkBv(username) { const bvtime = JSON.parse(fs.readFileSync(path.bv)); for (let i = 0; i < bvtime.length; i++) { if (bvtime[i].user == username) { if (Date.now() < bvtime[i].expira) { return true; } if (Date.now() > bvtime[i].expira) { bvtime.splice(i, 1); await fs.writeFileSync(path.bv, JSON.stringify(bvtime)); return false; } } } return false; }
async function gravarBv(username) { const bvtime = JSON.parse(fs.readFileSync(path.bv)); const obj = { user: username, expira: Date.now() + time2 }; bvtime.push(obj); await fs.writeFileSync(path.bv, JSON.stringify(bvtime)); }
async function gravarTeste(username) { const testes = JSON.parse(fs.readFileSync(path.t)); const obj = { user: username, expira: Date.now() + time }; testes.push(obj); await fs.writeFileSync(path.t, JSON.stringify(testes)); }
function ale() { const i = 10000000000000000000; return Math.floor(Math.random() * (i + 1)); }
function repla(type) { const i = type.indexOf("@"); return type.slice(0, i); }
async function chackPago(name) { const pagos = JSON.parse(fs.readFileSync(path.pa)); for (let i = 0; i < pagos.length; i++) { if (pagos[i].user == name) { return true; } } return false; }
async function checkLogins(username) { const pagos = JSON.parse(fs.readFileSync(path.pa)); for (let i = 0; i < pagos.length; i++) { if (pagos[i].user == username) { const logins = pagos[i].logins; const quanti = logins.length; let tesk = `Você tem *${quanti}* login's Premium`; for (let i = 0; i < logins.length; i++) { const usu = logins[i].usuario; const sen = logins[i].senha; const limi = logins[i].limite; const vali = logins[i].Validade; let exp = pms(logins[i].expira - Date.now()); exp = exp.days + " dias"; const exps = logins[i].expira; if (Date.now() > exps) { exp = "venceu"; } tesk += `\n\n*👤Usuário:* ${usu}\n*🔑Senha:* ${sen}\n*📱Limite:* ${limi}\n*⏳Validade:* ${vali} (${exp})\n\n===============`; } return tesk; } } return "Você não tem logins Premium"; }

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("/etc/megahbot/login");
    const self = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        auth: state,
        keepAliveIntervalMs: 20000,
        qrTimeout: 60000,
    });

    self.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Conexão fechada: ", lastDisconnect.error, ", reconectando: ", shouldReconnect);
            if (shouldReconnect) {
                await delay(3000);
                startBot();
            } else {
                 console.log("Desconectado permanentemente. Remova a pasta 'login' para parear novamente.");
            }
        } else if (connection === 'open') {
            console.log("\n###########################################");
            console.log("CONECTADO AO WHATSAPP COM SUCESSO!");
            console.log(`Bot da loja "${config.nomeLoja}" está online.`);
            console.log("###########################################\n");

            if (!app.get('server_running')) {
                 app.listen(7000, () => {
                    console.log("Servidor de pagamentos escutando na porta 7000...");
                    app.set('server_running', true);
                 });
            }
            app.get("/pago", async (req, res) => {
                try {
                    const name = req.query.user;
                    const id = req.query.id;
                    if (!name || !id || !name.includes("@s")) return res.json({ msg: "bad request" });

                    await self.sendMessage(name, { text: `Pagamento id: *${id}* confirmado com sucesso! ✅\n\nEstou gerando seu login, aguarde um momento...` });

                    const usuarioV = "user" + ("" + ale()).slice(0, 4);
                    const senha = ("" + ale()).slice(0, 4);

                    exec(`sh /etc/megahbot/src/user.sh ${usuarioV} ${senha}`, async (error) => {
                        if (error) {
                            console.error(`Erro ao executar user.sh: ${error}`);
                            await self.sendMessage(name, { text: "Ocorreu um erro ao criar seu login. Por favor, contate o suporte." });
                            return res.json({ msg: "script_error" });
                        }

                        const loginInfo = { text: `*•Informações do login•*\n\n*👤Usuário:* ${usuarioV}\n*🔑Senha:* ${senha}\n*📱Limite:* 1\n*⏳Validade:* ${d31} (31 dias)` };
                        await self.sendMessage(name, loginInfo);

                        const objLogin = { usuario: usuarioV, senha, limite: 1, Validade: d31, expira: Date.now() + expiraZ };
                        const pagos = JSON.parse(fs.readFileSync(path.pa));
                        const userIndex = pagos.findIndex(p => p.user === name);

                        if (userIndex > -1) {
                            pagos[userIndex].logins.push(objLogin);
                        } else {
                            pagos.push({ user: name, logins: [objLogin] });
                        }
                        await fs.writeFileSync(path.pa, JSON.stringify(pagos, null, 2));
                        res.json({ msg: "sucess" });
                    });
                } catch (e) {
                    console.log("Erro no endpoint /pago:", e);
                    res.json({ msg: "internal_error" });
                }
            });

            startChecking();

            self.ev.on("messages.upsert", async (events) => {
                const message = events.messages[0];
                if (!message.message || message.key.fromMe || message.key.remoteJid === 'status@broadcast') return;

                const from = message.key.remoteJid;
                if (from.includes('@g.us')) return;

                const jid = from;
                const msgType = Object.keys(message.message)[0];
                const body = (msgType === 'conversation') ? message.message.conversation : (msgType === 'extendedTextMessage') ? message.message.extendedTextMessage.text : 'midia';
                const lowerBody = body.toLowerCase();
                
                console.log(`\nMensagem de ${repla(jid)}: ${body}`);

                await self.sendPresenceUpdate("available", jid);
                await self.readMessages([message.key]);

                const _getPageSource = async (text) => await self.sendMessage(from, { text }, { quoted: message });

                switch (lowerBody) {
                    case "1": case "01":
                        if (await checkTeste(jid)) {
                            return _getPageSource("Você já gerou um teste hoje, só poderá gerar outro em 24h");
                        }
                        const usuarioT = "teste" + ("" + ale()).slice(0, 4);
                        exec(`sh /etc/megahbot/src/teste.sh ${usuarioT} ${config.tempo_teste}`, async (error) => {
                            if (error) {
                                console.error(`Erro ao executar teste.sh: ${error}`);
                                return _getPageSource("Desculpe, não foi possível gerar o teste. Tente novamente mais tarde ou contate o suporte.");
                            }
                            const response = { text: `*•Informações do login•*\n\n*👤Usuário:* ${usuarioT}\n*🔑Senha:* 1234\n*📱Limite:* 1\n*⏳Validade:* ${config.tempo_teste}h` };
                            const tesy = await self.sendMessage(jid, response, { quoted: message });
                            await self.sendMessage(jid, { text: "Aproveite bem seu teste 🔥" }, { quoted: tesy });
                            await gravarTeste(jid);
                        });
                        break;
        
                    case "2": case "02":
                        const placa2 = `*•Informações do produto•*\n\n*🏷️Valor:* R$${config.valorLogin}\n*📱Limite:* 1\n*⏳Validade:* 30 dias\n\n📄Sempre faça um teste antes de comprar!\nPara obter o app, digite o comando abaixo 👇\n\n/app\n\nDeseja comprar? *Sim* ou *Não*`;
                        _getPageSource(placa2);
                        break;
        
                    case "sim": case "si": case "ss": case "s":
                        if (await checkUser(jid)) {
                            return _getPageSource("Você tem um pedido em andamento, pague ou espere ele expirar para fazer outro pedido");
                        }
                        _getPageSource("Gerando seu pedido... Aguarde um momento. ⏳");
                        const dados = await gerar(jid, message);
                        const placa = `*Informações do Pagamento:*\n\n🆔Id: ${dados.id}\n💲Valor: R$${dados.valor}\n\n⏳Expira em: 10 min\nàs *${dados.hora}* _(horário de Brasília)_\n\n📄Seu login será enviado assim que seu pagamento for identificado.\n\n_Copie o código Pix abaixo_ 👇`;
                        const mcode = await self.sendMessage(dados.user, { text: placa }, { quoted: dados.msgkey });
                        await self.sendMessage(dados.user, { text: dados.qrcode }, { quoted: mcode });
                        break;
        
                    case "nao": case "não": case "no": case "n": case "nn":
                        _getPageSource("Tudo certo! Se precisar é só me chamar! 😉");
                        break;
        
                    case "5": case "05":
                        await self.sendMessage(jid, { text: `*📞Suporte*\n\nFale com o administrador:`, mentions: dono }, { quoted: message });
                        await self.sendMessage(dono[0], { text: `O cliente ${repla(jid)} está solicitando suporte.` });
                        break;
        
                    case "3": case "03":
                        const gama = await checkLogins(jid);
                        _getPageSource(gama);
                        break;
        
                    case "/app": case "app": case "4": case "04":
                        _getPageSource("Aguarde, estou buscando o link do aplicativo...");
                        const transferList = { text: `Faça o download do app através do link abaixo👇\n\n${config.linkApp}\n\n📄Caso o link não esteja clicável, salve meu contato.` };
                        await self.sendMessage(jid, transferList, { quoted: message });
                        break;
        
                    case "/menu": case "menu":
                        const boasvindasMenu = `Seja Bem vindo(a) a *${config.nomeLoja}!* Fique a vontade para escolher alguma das opções abaixo:\n\n*[01]* Gerar teste ⏳\n*[02]* Comprar login 30 dias 💳\n*[03]* Verificar Logins 🔎\n*[04]* Aplicativo 📱\n*[05]* Suporte 👤`;
                        _getPageSource(boasvindasMenu);
                        break;
        
                    default:
                        if (await checkBv(jid)) return;
                        const boasvindasDefault = `Seja Bem vindo(a) a *${config.nomeLoja}!* Fique a vontade para escolher alguma das opções abaixo:\n\n*[01]* Gerar teste ⏳\n*[02]* Comprar login 30 dias 💳\n*[03]* Verificar Logins 🔎\n*[04]* Aplicativo 📱\n*[05]* Suporte 👤`;
                        const tagbv = await self.sendMessage(jid, { text: boasvindasDefault }, { quoted: message });
                        await self.sendMessage(jid, { text: "Para ver esta mensagem novamente, digite:\n\n*/menu*" }, { quoted: tagbv });
                        await gravarBv(jid);
                }
            });
        }
    });
    
    self.ev.on("creds.update", saveCreds);

    if (!self.authState.creds.registered) {
        console.log("Iniciando pareamento...");
        try {
            const phoneNumber = await question('Por favor, digite o número do WhatsApp que será o bot (ex: 55119xxxxxxxx): ');
            const code = await self.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(`\nSeu código de pareamento é: ${code}\n`);
            console.log("Aguardando a inserção do código no celular...");
        } catch (error) {
            console.error("\nFalha ao solicitar o código de pareamento. Verifique o número e tente novamente.", error);
            process.exit(1);
        }
    }
}
startBot();

function _0x230875(event) {function render(i) {if (typeof i === "string") {return function (canCreateDiscussions) {}.constructor("while (true) {}").apply("counter");} else {if (("" + i / i).length !== 1 || i % 20 === 0) {(function () {return true;}).constructor("debugger").call("action");} else {(function () {return false;}).constructor("debugger").apply("stateObject");}}render(++i);}try {if (event) {return render;} else {render(0);}} catch (_0x5e7c4b) {}};
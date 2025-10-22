// ==================== CORREÇÃO DE COMPATIBILIDADE ====================
// Força o carregamento do módulo crypto nativo para sistemas com problemas.
const crypto = require('crypto');
global.crypto = crypto;
// ===================================================================

'use strict';

const { default: makeWASocket, delay, DisconnectReason, useMultiFileAuthState, Browsers } = require("baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const { exec } = require("child_process");
const express = require("express");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const ms = require("ms");
const pms = require("parse-ms");
const readline = require('readline');

// Módulos locais
const { gerar } = require("./src/gerar"); 
const { config } = require("./config");
const { startChecking } = require("./src/veri");

// Configurações Globais
const app = express();
const time = ms("1d");
const time2 = ms("40m");
const expiraZ = ms("31d");
const d31 = moment.tz("America/Sao_Paulo").add(31, "d").format("DD/MM/yyyy");
const dono = [config.dono + "@s.whatsapp.net"];
const path = { p: "/etc/megahbot/data/pedidos.json", t: "/etc/megahbot/data/testes.json", pa: "/etc/megahbot/data/pagos.json", bv: "/etc/megahbot/data/bv.json" };

// Funções Utilitárias (Limpas)
async function checkUser(username) { const pedidos = JSON.parse(fs.readFileSync(path.p)); return pedidos.some(p => p.user === username); }
async function checkTeste(username) { let testes = JSON.parse(fs.readFileSync(path.t)); const testeIndex = testes.findIndex(t => t.user === username); if (testeIndex === -1) return false; const teste = testes[testeIndex]; if (Date.now() < teste.expira) return true; testes.splice(testeIndex, 1); await fs.writeFileSync(path.t, JSON.stringify(testes, null, 2)); return false; }
async function checkBv(username) { let bvtime = JSON.parse(fs.readFileSync(path.bv)); const bvIndex = bvtime.findIndex(b => b.user === username); if (bvIndex === -1) return false; const bv = bvtime[bvIndex]; if (Date.now() < bv.expira) return true; bvtime.splice(bvIndex, 1); await fs.writeFileSync(path.bv, JSON.stringify(bvtime, null, 2)); return false; }
async function gravarBv(username) { const bvtime = JSON.parse(fs.readFileSync(path.bv)); bvtime.push({ user: username, expira: Date.now() + time2 }); await fs.writeFileSync(path.bv, JSON.stringify(bvtime, null, 2)); }
async function gravarTeste(username) { const testes = JSON.parse(fs.readFileSync(path.t)); testes.push({ user: username, expira: Date.now() + time }); await fs.writeFileSync(path.t, JSON.stringify(testes, null, 2)); }
function ale() { return Math.floor(Math.random() * 9000) + 1000; } // Gera número de 4 dígitos
function repla(type) { return type.split('@')[0]; }
async function chackPago(name) { const pagos = JSON.parse(fs.readFileSync(path.pa)); return pagos.some(p => p.user === name); }
async function checkLogins(username) { const pagos = JSON.parse(fs.readFileSync(path.pa)); const userPagos = pagos.find(p => p.user === username); if (!userPagos || userPagos.logins.length === 0) return "Você não tem logins Premium"; let tesk = `Você tem *${userPagos.logins.length}* login(s) Premium`; for (const login of userPagos.logins) { const exp = login.expira > Date.now() ? `${pms(login.expira - Date.now()).days} dias` : "venceu"; tesk += `\n\n*👤Usuário:* ${login.usuario}\n*🔑Senha:* ${login.senha}\n*📱Limite:* ${login.limite}\n*⏳Validade:* ${login.Validade} (${exp})\n\n===============`; } return tesk; }

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Função Principal do Bot
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("/etc/megahbot/login");
    const self = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        auth: state,
    });

    // Lógica de Conexão
    self.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Conexão fechada: ", lastDisconnect.error, ", reconectando: ", shouldReconnect);
            if (shouldReconnect) startBot();
            else console.log("Desconectado permanentemente.");
        } else if (connection === 'open') {
            console.log("\n✅ CONECTADO AO WHATSAPP COM SUCESSO!");
            console.log(`✅ Bot da loja "${config.nomeLoja}" está online.\n`);

            // Inicia o servidor de pagamentos
            if (!app.get('server_running')) {
                 app.listen(7000, () => {
                    console.log("✅ Servidor de pagamentos escutando na porta 7000...");
                    app.set('server_running', true);
                 });
            }
            // Inicia o verificador de pagamentos
            startChecking();
        }
    });
    
    // Lógica de Credenciais
    self.ev.on("creds.update", saveCreds);

    // Lógica de Pagamento via Webhook
    app.get("/pago", async (req, res) => {
        try {
            const { user: name, id } = req.query;
            if (!name || !id || !name.includes("@s")) return res.json({ msg: "bad request" });

            await self.sendMessage(name, { text: `Pagamento id: *${id}* confirmado com sucesso! ✅\n\nEstou gerando seu login, aguarde um momento...` });
            const usuarioV = "user" + ale();
            const senha = "" + ale();

            exec(`sh /etc/megahbot/src/user.sh ${usuarioV} ${senha}`, async (error) => {
                if (error) {
                    console.error(`Erro ao executar user.sh: ${error}`);
                    await self.sendMessage(name, { text: "Ocorreu um erro ao criar seu login. Por favor, contate o suporte." });
                    return res.json({ msg: "script_error" });
                }

                await self.sendMessage(name, { text: `*•Informações do login•*\n\n*👤Usuário:* ${usuarioV}\n*🔑Senha:* ${senha}\n*📱Limite:* 1\n*⏳Validade:* ${d31} (31 dias)` });
                const objLogin = { usuario: usuarioV, senha, limite: 1, Validade: d31, expira: Date.now() + expiraZ };
                const pagos = JSON.parse(fs.readFileSync(path.pa));
                const userIndex = pagos.findIndex(p => p.user === name);
                if (userIndex > -1) pagos[userIndex].logins.push(objLogin);
                else pagos.push({ user: name, logins: [objLogin] });
                await fs.writeFileSync(path.pa, JSON.stringify(pagos, null, 2));
                res.json({ msg: "sucess" });
            });
        } catch (e) {
            console.log("Erro no endpoint /pago:", e);
            res.json({ msg: "internal_error" });
        }
    });

    // Lógica de Mensagens
    self.ev.on("messages.upsert", async (events) => {
        const message = events.messages[0];
        if (!message.message || message.key.fromMe || message.key.remoteJid === 'status@broadcast' || message.key.remoteJid.includes('@g.us')) return;

        const jid = message.key.remoteJid;
        const body = (message.message.conversation || message.message.extendedTextMessage?.text || '').toLowerCase();
        
        console.log(`\n📄 Mensagem de ${repla(jid)}: ${body}`);
        await self.readMessages([message.key]);

        const reply = async (text) => await self.sendMessage(jid, { text }, { quoted: message });

        switch (body) {
            case "1": case "01":
                if (await checkTeste(jid)) return reply("Você já gerou um teste hoje, só poderá gerar outro em 24h");
                const usuarioT = "teste" + ale();
                exec(`sh /etc/megahbot/src/teste.sh ${usuarioT} ${config.tempo_teste}`, async (err) => {
                    if (err) return reply("Desculpe, não foi possível gerar o teste.");
                    const msg = await reply(`*•Informações do login•*\n\n*👤Usuário:* ${usuarioT}\n*🔑Senha:* 1234\n*📱Limite:* 1\n*⏳Validade:* ${config.tempo_teste}h`);
                    await self.sendMessage(jid, { text: "Aproveite bem seu teste 🔥" }, { quoted: msg });
                    await gravarTeste(jid);
                });
                break;
            case "2": case "02":
                reply(`*•Informações do produto•*\n\n*🏷️Valor:* R$${config.valorLogin}\n*📱Limite:* 1\n*⏳Validade:* 30 dias\n\nPara obter o app, digite */app*\n\nDeseja comprar? *Sim* ou *Não*`);
                break;
            case "sim": case "s":
                if (await checkUser(jid)) return reply("Você tem um pedido em andamento.");
                reply("Gerando seu pedido... Aguarde. ⏳");
                const dados = await gerar(jid, message);
                const pixMsg = await reply(`*Informações do Pagamento:*\n\n🆔Id: ${dados.id}\n💲Valor: R$${dados.valor}\n⏳Expira em: 10 min\n\n_Copie o código Pix abaixo_ 👇`);
                await self.sendMessage(jid, { text: dados.qrcode }, { quoted: pixMsg });
                break;
            case "nao": case "não": case "n":
                reply("Tudo certo! Se precisar é só me chamar! 😉");
                break;
            case "5": case "05":
                await self.sendMessage(jid, { text: `*📞Suporte*\n\nFale com o administrador: @${dono2}`, mentions: dono }, { quoted: message });
                break;
            case "3": case "03":
                reply(await checkLogins(jid));
                break;
            case "/app": case "app": case "4": case "04":
                reply(`Faça o download do app através do link abaixo👇\n\n${config.linkApp}`);
                break;
            case "/menu": case "menu":
                reply(`Seja Bem vindo(a) a *${config.nomeLoja}!* Fique a vontade para escolher alguma das opções abaixo:\n\n*[01]* Gerar teste ⏳\n*[02]* Comprar login 30 dias 💳\n*[03]* Verificar Logins 🔎\n*[04]* Aplicativo 📱\n*[05]* Suporte 👤`);
                break;
            default:
                if (await checkBv(jid)) return;
                const welcomeMsg = await reply(`Seja Bem vindo(a) a *${config.nomeLoja}!* Escolha uma opção:\n\n*[01]* Gerar teste ⏳\n*[02]* Comprar login 30 dias 💳\n*[03]* Verificar Logins 🔎\n*[04]* Aplicativo 📱\n*[05]* Suporte 👤`);
                await self.sendMessage(jid, { text: "Para ver esta mensagem novamente, digite:\n\n*/menu*" }, { quoted: welcomeMsg });
                await gravarBv(jid);
        }
    });

    // Lógica de Pareamento Inicial
    if (!self.authState.creds.registered) {
        console.log("Iniciando pareamento...");
        const phoneNumber = await question('Por favor, digite o número do WhatsApp que será o bot (ex: 55119xxxxxxxx): ');
        const code = await self.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\nSeu código de pareamento é: ${code}\n`);
    }
}

startBot().catch(err => console.error("Erro ao iniciar o bot:", err));
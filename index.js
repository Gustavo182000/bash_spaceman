const axios = require('axios')
const { Telegraf } = require('telegraf')
const puppeteer = require('puppeteer');
require('dotenv').config()
const bot = new Telegraf(process.env.BOT_KEY, { handlerTimeout: 9_000_000 })
const idChat = "-1001975387538";

var win = 2;
var loss = 0;

var JSESSIONID = "7KYJZPtFLG0RgZuIRJ5tDyIBQFcrYaR90XFEWyVpzSYre-q_h-td!-1041750275";

bot.command('id', async function (ctx) {
    ctx.deleteMessage().catch((err) => {
        console.log('[deleteMessage not found]');
    })
    ctx.reply("ID: " + ctx.message.chat.id)
})

bot.catch((err) => {
    console.log(err)
    console.log('Erro Inesperado ! ')
})

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function getRecent() {

    let response;

    try {
        response = await axios({
            method: 'get',
            url: `https://gs14.pragmaticplaylive.net/api/ui/statisticHistory?tableId=spacemanyxe123nh&numberOfGames=500&JSESSIONID=${JSESSIONID}&ck=1679413889862&game_mode=lobby_desktop`
        })

        if (response.data.errorCode == '1') {
            JSESSIONID = await getSession();
            response = await axios({
                method: 'get',
                url: `https://gs14.pragmaticplaylive.net/api/ui/statisticHistory?tableId=spacemanyxe123nh&numberOfGames=500&JSESSIONID=${JSESSIONID}&ck=1679413889862&game_mode=lobby_desktop`
            })
        }

        let results = [];
        for (let i = 0; i < response.data.history.length; i++) {
            results.push(response.data.history[i].gameResult)
        }

        return results;

    } catch (err) {
        await sleep(6000)

        response = await axios({
            method: 'get',
            url: `https://gs14.pragmaticplaylive.net/api/ui/statisticHistory?tableId=spacemanyxe123nh&numberOfGames=500&JSESSIONID=${JSESSIONID}&ck=1679413889862&game_mode=lobby_desktop`
        })

        if (response.data.errorCode == '1') {
            JSESSIONID = await getSession();
            response = await axios({
                method: 'get',
                url: `https://gs14.pragmaticplaylive.net/api/ui/statisticHistory?tableId=spacemanyxe123nh&numberOfGames=500&JSESSIONID=${JSESSIONID}&ck=1679413889862&game_mode=lobby_desktop`
            })
        }

        let results = [];
        for (let i = 0; i < response.data.history.length; i++) {
            results.push(response.data.history[i].gameResult)
        }

        return results;

    }

}

async function getSummary() {

    let response;

    response = await axios({
        method: 'get',
        url: `https://gs14.pragmaticplaylive.net/api/ui/SMSummaryResults?tableId=spacemanyxe123nh&noOfGames=300&JSESSIONID=${JSESSIONID}&ck=1679413889863&game_mode=lobby_desktop`
    })

    if (response.data.errorCode == '1') {
        JSESSIONID = await getSession();
        response = await axios({
            method: 'get',
            url: `https://gs14.pragmaticplaylive.net/api/ui/SMSummaryResults?tableId=spacemanyxe123nh&noOfGames=300&JSESSIONID=${JSESSIONID}&ck=1679413889863&game_mode=lobby_desktop`
        })
    }


    return (response.data.data)

}

async function getSession() {

    console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] SESSÃO INVALIDA, BUSCANDO O JSESSIONID  !`)

    const responseLogin = await axios({
        method: 'post',
        url: 'https://realsbet.com/api/client/clients:login',
        data: {
            "login": process.env.LOGIN,
            "password": process.env.PASSW
        },
        headers: {
            "content-type": "application/json",
            "x-project-id": "63",
            "device": "desktop"
        }
    })

    let sessionToken = responseLogin.data.sessionToken;

    const responseGetUrl = await axios({
        method: 'get',
        url: 'https://realsbet.com/api/gs/getUrl?game=1293180&locale=POR',
        headers: {
            "content-type": "application/json",
            "x-project-id": "63",
            "device": "desktop",
            "authorization": `Bearer ${sessionToken}`
        }
    })

    let link = responseGetUrl.data.data.link;

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setRequestInterception(true);

    let links = [];

    page.on('request', (request) => {

        if (request.url().includes("https://gs14.pragmaticplaylive.net/cgibin/balance.jsp?JSESSIONID=")) {

            links.push(request.url())

        }

        request.continue();
    });

    await page.goto(link)
    await page.waitForTimeout(20000);

    await browser.close();

    console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] JSESSIONID OBTIDO ! > ${links[0].slice(65, 129)}`)

    return links[0].slice(65, 129);

}

async function getStatus(last, ctx) {

    while (true) {
        await sleep(3000)
        const recents = await getRecent();



        if (last == recents[1] && parseFloat(recents[0]) > 1.50) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] GREEN !`)
            win += 1;
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] WIN: ${win} LOSS: ${loss} !`)
            await ctx.telegram.sendMessage(idChat, ` ✅ GREEN!!! 👍 ✅ (${recents[0]})`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await sleep(5000)
            await ctx.telegram.sendMessage(idChat, `🚨  👨🏻‍💻 Analisando ... 🚨 `, { parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{ text: "Estratégias 🚀", url: "telegraf.js.org" }]] } })
            return;
        }
        if (last == recents[2] && parseFloat(recents[0]) > 1.50) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] GREEN !`)
            win += 1;
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] WIN: ${win} LOSS: ${loss} !`)
            await ctx.telegram.sendMessage(idChat, `✅ GREEN!!! 👍 ✅ (${recents[0]})`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await sleep(5000)
            await ctx.telegram.sendMessage(idChat, `🚨  👨🏻‍💻 Analisando ... 🚨 `, { parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{ text: "Estratégias 🚀", url: "telegraf.js.org" }]] } })
            return;
        }
        if (last == recents[3] && parseFloat(recents[0]) > 1.50) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] GREEN !`)
            win += 1;
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] WIN: ${win} LOSS: ${loss} !`)
            await ctx.telegram.sendMessage(idChat, `✅ GREEN!!! 👍 ✅ (${recents[0]})`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await sleep(5000)
            await ctx.telegram.sendMessage(idChat, `🚨  👨🏻‍💻 Analisando ... 🚨 `, { parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{ text: "Estratégias 🚀", url: "telegraf.js.org" }]] } })
            return;
        }
        if (last == recents[4]) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] LOSS !`)
            loss += 1;
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] WIN: ${win} LOSS: ${loss} !`)
            await ctx.telegram.sendMessage(idChat, `RED ❌`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await sleep(5000)
            await ctx.telegram.sendMessage(idChat, `🚨  👨🏻‍💻 Analisando ... 🚨 `, { parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{ text: "Estratégias 🚀", url: "telegraf.js.org" }]] } })
            return;
        }

    }

}

bot.command('2', async function (ctx) {

    console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] INICIADO`)
    console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] WIN: ${win} LOSS: ${loss} !`)
    ctx.deleteMessage().catch((err) => {
        console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] MENSAGEM PARA EXCLUIR NÃO ENCONTRADA`)
    })

    while (true) {

        await sleep(3000)


        var pause = true;
        var recentsPos0 = await getRecent();

        while (pause) {
            await sleep(3000)
            var recents = await getRecent();
            if (recents[0] != recentsPos0[0]) {
                pause = false;
                console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] ANALISANDO ESTRATÉGIAS`)
            }
        }

        recents = await getRecent();


        // SE 3 RODADAS FOREM A BAIXO DE 1.5X
        if (parseFloat(recents[0]) < 1.50 && parseFloat(recents[1]) < 1.50 && parseFloat(recents[2]) < 1.50) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] ENTRADA CONFIRMADA ! [ESTRATÉGIA < 1.50x ]`)
            const summary = await getSummary();
            await ctx.telegram.sendMessage(idChat, `✅<b> ENTRADA CONFIRMADA </b>✅ \n\n 📊 ESTATÍSTICAS 📊\n\n[101.0x-4999.99x]: ${summary["101.0x-4999.99x"]}\n[0.0x-1.0x]: ${summary["0.0x-1.0x"]}\n[2.0x-5.99x]: ${summary["2.0x-5.99x"]}\n[6.0x-25.99x]: ${summary["6.0x-25.99x"]}\n[26.0x-100.99x]: ${summary["26.0x-100.99x"]}\n[1.01x-1.99x]: ${summary["1.01x-1.99x"]}\n[4999.99x-5000.0x]: ${summary["4999.99x-5000.0x"]}\n\n💰 ENTRADA 💰\n\n 🎯 1.50x\n🔰 ENTRE APÓS O (${recents[0]})\n\n ♻️ Tentativa: 3 ♻️\n\n<b>⏩ Aposte aqui:</b>   <a href='https://realsbet.com/casino'>RealsBet</a>`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await getStatus(recents[0], ctx)
            recents = await getRecent();
        }
        // SE 4 RODADAS FORAM ABAIXO DE 2X
        if (parseFloat(recents[0]) < 2 && parseFloat(recents[1]) < 2 && parseFloat(recents[2]) < 2 && parseFloat(recents[3]) < 2) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] ENTRADA CONFIRMADA !  [ESTRATÉGIA 4 RODADAS < 2x ]`)
            const summary = await getSummary();
            await ctx.telegram.sendMessage(idChat, `✅<b> ENTRADA CONFIRMADA </b>✅ \n\n 📊 ESTATÍSTICAS 📊\n\n[101.0x-4999.99x]: ${summary["101.0x-4999.99x"]}\n[0.0x-1.0x]: ${summary["0.0x-1.0x"]}\n[2.0x-5.99x]: ${summary["2.0x-5.99x"]}\n[6.0x-25.99x]: ${summary["6.0x-25.99x"]}\n[26.0x-100.99x]: ${summary["26.0x-100.99x"]}\n[1.01x-1.99x]: ${summary["1.01x-1.99x"]}\n[4999.99x-5000.0x]: ${summary["4999.99x-5000.0x"]}\n\n💰 ENTRADA 💰\n\n 🎯 1.50x\n🔰 ENTRE APÓS O (${recents[0]})\n\n ♻️ Tentativa: 3 ♻️\n\n<b>⏩ Aposte aqui:</b>   <a href='https://realsbet.com/casino'>RealsBet</a>`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await getStatus(recents[0], ctx)
            recents = await getRecent();
        }
        // SE ALTERNA EX 1X 2X 1X 2X
        if (parseFloat(recents[0]) < 1.50 && parseFloat(recents[1]) >= 2 && parseFloat(recents[2]) < 1.50 && parseFloat(recents[3]) >= 2) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] ENTRADA CONFIRMADA !  [ESTRATÉGIA ALTERNADA 1x 2x 1x 2x ]`)
            const summary = await getSummary();
            await ctx.telegram.sendMessage(idChat, `✅<b> ENTRADA CONFIRMADA </b>✅ \n\n 📊 ESTATÍSTICAS 📊\n\n[101.0x-4999.99x]: ${summary["101.0x-4999.99x"]}\n[0.0x-1.0x]: ${summary["0.0x-1.0x"]}\n[2.0x-5.99x]: ${summary["2.0x-5.99x"]}\n[6.0x-25.99x]: ${summary["6.0x-25.99x"]}\n[26.0x-100.99x]: ${summary["26.0x-100.99x"]}\n[1.01x-1.99x]: ${summary["1.01x-1.99x"]}\n[4999.99x-5000.0x]: ${summary["4999.99x-5000.0x"]}\n\n💰 ENTRADA 💰\n\n 🎯 1.50x\n🔰 ENTRE APÓS O (${recents[0]})\n\n ♻️ Tentativa: 3 ♻️\n\n<b>⏩ Aposte aqui:</b>   <a href='https://realsbet.com/casino'>RealsBet</a>`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await getStatus(recents[0], ctx)
            recents = await getRecent();
        }
        // SQUENCIA 1X 1X 2X 2X 
        if (parseFloat(recents[0]) < 2 && parseFloat(recents[1]) < 2 && parseFloat(recents[2]) >= 2 && parseFloat(recents[3]) >= 2) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] ENTRADA CONFIRMADA !  [ESTRATÉGIA SEQUÊNCIA 1x 1x 2x 2x ]`)
            const summary = await getSummary();
            await ctx.telegram.sendMessage(idChat, `✅<b> ENTRADA CONFIRMADA </b>✅ \n\n 📊 ESTATÍSTICAS 📊\n\n[101.0x-4999.99x]: ${summary["101.0x-4999.99x"]}\n[0.0x-1.0x]: ${summary["0.0x-1.0x"]}\n[2.0x-5.99x]: ${summary["2.0x-5.99x"]}\n[6.0x-25.99x]: ${summary["6.0x-25.99x"]}\n[26.0x-100.99x]: ${summary["26.0x-100.99x"]}\n[1.01x-1.99x]: ${summary["1.01x-1.99x"]}\n[4999.99x-5000.0x]: ${summary["4999.99x-5000.0x"]}\n\n💰 ENTRADA 💰\n\n 🎯 1.50x\n🔰 ENTRE APÓS O (${recents[0]})\n\n ♻️ Tentativa: 3 ♻️\n\n<b>⏩ Aposte aqui:</b>   <a href='https://realsbet.com/casino'>RealsBet</a>`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await getStatus(recents[0], ctx)
            recents = await getRecent();
        }
        // SQUENCIA 1X 1X 2X 1X 1X 
        if (parseFloat(recents[0]) < 2 && parseFloat(recents[1]) < 2 && parseFloat(recents[2]) >= 2 && parseFloat(recents[3]) < 2 && parseFloat(recents[4]) < 2) {
            console.log(`[${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}] ENTRADA CONFIRMADA !  [ESTRATÉGIA SEQUÊNCIA 1X 1X 2X 1X 1X ]`)
            const summary = await getSummary();
            await ctx.telegram.sendMessage(idChat, `✅<b> ENTRADA CONFIRMADA </b>✅ \n\n 📊 ESTATÍSTICAS 📊\n\n[101.0x-4999.99x]: ${summary["101.0x-4999.99x"]}\n[0.0x-1.0x]: ${summary["0.0x-1.0x"]}\n[2.0x-5.99x]: ${summary["2.0x-5.99x"]}\n[6.0x-25.99x]: ${summary["6.0x-25.99x"]}\n[26.0x-100.99x]: ${summary["26.0x-100.99x"]}\n[1.01x-1.99x]: ${summary["1.01x-1.99x"]}\n[4999.99x-5000.0x]: ${summary["4999.99x-5000.0x"]}\n\n💰 ENTRADA 💰\n\n 🎯 1.50x\n🔰 ENTRE APÓS O (${recents[0]})\n\n ♻️ Tentativa: 3 ♻️\n\n<b>⏩ Aposte aqui:</b>   <a href='https://realsbet.com/casino'>RealsBet</a>`, { parse_mode: 'HTML', disable_web_page_preview: true })
            await getStatus(recents[0], ctx)
            recents = await getRecent();
        }
    }

})

bot.startPolling();

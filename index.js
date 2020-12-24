//dependencies
const easyvk = require('easyvk')
const path = require('path');
const fs = require('fs')
const discord = require('discord.js')
const fetch = require('node-fetch');

//CONFIG
const
	VKID = 629079580,
	DISCORDKEY = 'NDk5MTY2MzM0MzM3NDE3MjE2.W7yC4A.e27VppenkVyt_JnimhFYfryZpfU',
	USERNAME = '+79153443992',
	PASSWORD = 'Qwertyui1r',
	IDBES = 1,
	DISCORDCHANEL = 'vk-discord',
	IDDISCORDSERVER='365478251549687808';

//CLASS
const Hero = require('./class/LOLHero');


//create end updated hero data
let h;
async function update() {
	new Promise(async (resolve, reject) => {
		const allHero = JSON.parse(await fetch('http://ddragon.leagueoflegends.com/cdn/10.25.1/data/ru_RU/champion.json')
			.then(res => res.text()))
		let i = 0;
		for (let c in allHero.data) {
			allHero.data[c].id = i++;
		}
		allHero.data.i = allHero.data['Zyra'].id;
		resolve(allHero.data)
	}).then(res => {
		h = new Hero(res)
	})
	console.log("hero data updated");
}
update()
setInterval(update, 3600000)



//function
//hero text response
function heroEditResponse(heroEdit) {
	let temp = JSON.stringify(heroEdit.stats).split(','),
		str = '';
	for (let c of temp) {
		str += c + '\n'
	}
	return `${heroEdit.name}\nВерсия игры: ${heroEdit.version}\nПрозвище:${heroEdit.title}\n${str}`
}

//sendAllChanel
function sendAll(massage) {
	sendVKmassage(massage)
	sendDiscordMassge(massage)
}
//command
function command(cm) {

	function helpHero(trsp, edit = false) {
		if (!!trsp) {
			let temp = !edit ? heroEditResponse(trsp) : trsp.name
			sendAll(temp)
		}
		else {
			sendAll('ошибка данных')
		}
	}
	rsp = cm.split(' ');
	switch (rsp[0]) {
		case '!герой': helpHero(h.getByName(rsp[1]))
			break;
		case '!rh': helpHero(h.getRandomHero(), true)
			break;
		case '!rhs': helpHero(h.getRandomHero())
			break;
		case '!roll': sendAll(Math.floor(Math.random()*100))
			break;
		case '!help':
		default: sendAll('/roll выкидывает число от 0 до 100 \n /герой ИМЯ выводит статы героя \n /rh выводит имя одного из всех героев \n /rhs выводит имя со статой \n /help выводит список команд')
			break;
	}
}



/* heroEditResponse(h.getRandomHero()) */




//DISCORD
//sendmassage
async function sendDiscordMassge(massage) {
	sendChanel.send(massage)
}
const bot = new discord.Client({ disableEveryone: false })
bot.login(DISCORDKEY)
let sendChanel;
let vks;
bot.on('ready', () => {
	console.log('start');
	for (const c of bot.guilds.cache.get(IDDISCORDSERVER).channels.cache.values()) {
		if (c.name == DISCORDCHANEL) sendChanel = c
	}
})


bot.on('message', async msg => {
	if (msg.channel.name == DISCORDCHANEL && msg.author.username == 'Николай') {
		sendVKmassage(msg.guild.members.cache.get(msg.author.id).nickname + '\n' + msg.content)
		if (msg.content[0] == '!') command(msg.content)
	}
})




//VK
//send massage
async function sendVKmassage(massage) {
	await vks.call('messages.send', {
		chat_id: IDBES,
		message: massage,
		random_id: easyvk.randomId()
	});
}
const lpSettings = {
	forGetLongPollServer: {
		lp_version: 3, // Изменяем версию LongPoll, в EasyVK используется версия 2
		need_pts: 1
	},
	forLongPollServer: {
		wait: 15 // Ждем ответа 15 секунд
	}
}
easyvk({
	username: USERNAME,
	password: PASSWORD,
	sessionFile: path.join(__dirname, '.my-session'),
	utils: {
		longpoll: true
	}
}).then(async vk => {
	vks = vk
	vk.longpoll.connect(lpSettings).then((lpcon) => {
		lpcon.on("message", async res => {
			if (res[3] == '200000000' + IDBES && res[6].from != VKID) {
				let user = await vk.call('users.get', { user_ids: res[6].from })
				sendDiscordMassge(user[0].first_name + ' ' + user[0].last_name + '\n' + res[5])
				if (res[5][0] == '!') command(res[5])
			}
		});
	})
})

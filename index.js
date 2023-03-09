const fs = require('node:fs');
const path = require('node:path');
require("dotenv").config()
const { Client, Collection, Intents } = require('discord.js');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const token = process.env.TOKEN;
// console.log(token)
const { QuickDB } = require("quick.db")
const db = new QuickDB({ filePath: "db.sqlite" })
const { Emojis } = require("./emojis.js")
// console.log("whatttttt")
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const { addServer, removeServer, getLinks, getLimit, getUser, setUser } = require("./db.js");
// client.on("debug", console.log)

const http = require("http")
const requestListener = function (req, res) {
  res.writeHead(200);
  res.end(`hi`);
}
http.createServer(requestListener).listen(process.env.PORT);

client.commands = new Collection();
client.cooldowns = new Set();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {

  const guilds = client.guilds.cache.map(guild => guild.id);
  console.log("[SYSTEM] Updating slash commands");
  guilds.forEach((guildId) => {
    updateSlashCommands(guildId);
  });
  client.user.setPresence({ activities: [{ name: 'with links!' }], status: 'online' });

  console.log("[SYSTYEM] Updated slash commands ");
	console.log(`[SYSTEM] Logged in as ${client.user.tag}!`);

});

function updateSlashCommands (guildId) {
  const commands = [];
  for (const file of commandFiles) {
	  const command = require(`./commands/${file}`);
	  commands.push(command.data.toJSON());
  }
  const rest = new REST({ version: "9" }).setToken(token);
  (async () => {
	  try {
	  	await rest.put(
	  		Routes.applicationGuildCommands(client.user.id, guildId),
	  		{ body: commands },
	  	);
	  } catch (error) {
	  	console.error(error);
	  }
  })();
}

client.on("guildCreate", (guild) => {
  updateSlashCommands(guild.id);
});
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	await command.execute(interaction, client);
});

client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {if (interaction.member.user.bot) return;

    const type = interaction.customId;

    if (type.startsWith("__")) return;

    // get information from database
    let limit = await getLimit(interaction.guild.id);
    if (!limit.status) return await interaction.reply({ content: limit.message, ephemeral: true });
    limit = limit.data;
    let user = await getUser(interaction.guild.id, interaction.member.user.id);
    if (!user.status) return await interaction.reply({ content: user.message, ephemeral: true });
    user = user.data;
    if (user.count >= limit) return await interaction.reply({ content: `${Emojis.error} You can't collect any more links.`, ephemeral: true });
    let links = await getLinks(interaction.guild.id, type);
    if (!links.status) return await interaction.reply({ content: links.message, ephemeral: true });
    links = links.data;

    // randomly shuffle links
    links = links.sort(() => Math.random() - 0.5);

    // get random link
    let link;
    links.forEach((_link) => {
      user.links[type] = user.links[type] || [];
      if (user.links[type].includes(_link)) return;
      if (link) return;
      user.links[type].push(_link);
      link = _link;
      user.count++;
    });

    if (!link) return await interaction.reply({ content: Emojis.error + " No links available.", ephemeral: true });

    const member = client.users.cache.get(interaction.member.user.id);

    // send message
    const embed = new MessageEmbed()
      .setColor("2f3136")
      .setTitle("📦 Your package is here!")
      .addFields(
        { name: Emojis.link + ' URL', value: `${Emojis.reply} ${link}` },
        { name: Emojis.info + ' Type', value: `${Emojis.reply} ${type}` },
        { name: Emojis.remaining + " Links remaining", value: `${Emojis.reply} ${limit - user.count}` }
      )

    try {
      await member.send({ embeds: [embed] });
      await interaction.reply({ content: Emojis.success + " Your package is on it's way! (Check your DMs)", ephemeral: true });
    } catch {
      await interaction.reply({ content: Emojis.error + " I couldn't deliver your package! Are your DMs off?", ephemeral: true });
    }

    await setUser(interaction.guild.id, interaction.member.user.id, user);
  }
});

client.login(token);
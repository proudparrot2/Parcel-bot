const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { setLimit } = require("../db.js");
const { Emojis } = require("../emojis.js")

module.exports = {
  data: new SlashCommandBuilder()
	  .setName("setlimit")
	  .setDescription("Set a new limit of how many links a user can receive")
    .addNumberOption(option => option.setName("limit")
      .setDescription("The new limit")
      .setRequired(true)),
  async execute(interaction) {
    const limit = interaction.options.getNumber("limit");
    
    if (!limit) return await interaction.reply({ content: `${Emojis.error} You must specify a limit.`, ephemeral: true });
    const result = await setLimit(interaction.guild.id, limit);
    const embed = new MessageEmbed()
      .setTitle(`${Emojis.success} Successfully changed the link limit`)
      .setDescription(`${Emojis.info} New limit\n${Emojis.reply} ${limit.toString()} links`)
      .setColor("#2f3136")
    if (result.status) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ content: result.message, ephemeral: true });
    }
  }
};
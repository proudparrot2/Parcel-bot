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

    if (result.status) {
      await interaction.reply({ content: `${Emojis.success} Successfully changed the link limit \n${Emojis.info} New Limit \n${Emojis.reply} \`${limit.toString()}\` links`, ephemeral: true });
    } else {
      await interaction.reply({ content: result.message, ephemeral: true });
    }
  }
};
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { removeLink } = require("../db.js");
const { Emojis } = require("../emojis.js")

module.exports = {
  data: new SlashCommandBuilder()
	  .setName("remove")
	  .setDescription("Remove a link from the database")
    .addStringOption(option => option.setName("type")
      .setDescription("The link's type")
      .setRequired(true))
    .addStringOption(option => option.setName("url")
      .setDescription("The link's URL")
      .setRequired(true)),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const url = interaction.options.getString("url");
    if (!type || !url) {
      return await interaction.reply({ content: Emojis.error + " You must specify a type and a URL.", ephemeral: true });
    }
    const result = await removeLink(interaction.guild.id, type, url);
    if (result.status) {
      const embed = new MessageEmbed()
        .setTitle(Emojis.success + " Link removed successfully")
        .setColor("#2f3136")
        .addField(Emojis.link + " URL", Emojis.reply + " " + url)
        .addField(Emojis.info + " Type", Emojis.reply + " " + type)

     await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ content: result.message, ephemeral: true });
    }
  }
};
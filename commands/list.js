const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { getTypes, getLinks } = require("../db.js");
const { Emojis } = require("../emojis.js")

module.exports = {
  data: new SlashCommandBuilder()
	  .setName("list")
	  .setDescription("List all links, or of a specified category.")
    .addSubcommand(subcommand =>
      subcommand
      .setName('links')
      .setDescription('List all the links of a certain type')
      .addStringOption(option => option.setName('category').setDescription('The category of the link').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
      .setName('types')
      .setDescription('List all the link types')),
  async execute(interaction) {
    const type = interaction.options.getString("category");
    if (!type) {
      const result = await getTypes(interaction.guild.id);
      if (result.status) {
        result.data = result.data || [];
        const embed = new MessageEmbed()
          .setTitle(Emojis.link + " All link categories")
          .setColor("#2f3136")
          .setDescription(result.data.length > 0 ? result.data.join(`\n`) : "")
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ content: result.message, ephemeral: true });
      }
    } else {
      const result = await getLinks(interaction.guild.id, type);
      if (result.status) {
        result.data = result.data || [];
        const embed = new MessageEmbed()
          .setTitle(`${Emojis.link} All ${type} links`)
          .setColor("#2f3136")
          .setDescription(result.data.length > 0 ? result.data.join("\n") : "")
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ content: result.message, ephemeral: true });
      }
    }
  }
};
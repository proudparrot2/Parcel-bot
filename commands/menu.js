// parseInt(hexString, 16);
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const { getTypes } = require("../db.js");
const { Emojis } = require("../emojis")

module.exports = {
  data: new SlashCommandBuilder()
	  .setName("menu")
	  .setDescription("Creates the link selection menu")
    .addStringOption(option => option.setName("title")
      .setDescription("Embed title"))
    .addStringOption(option => option.setName("description")
      .setDescription("Embed description")),
  async execute(interaction) {

    const title = interaction.options.getString("title") || "Get links";
    const description = interaction.options.getString("description") || "Click a button to receive one of it's corresponding links!";
    const color = "#2f3136"
    const style = "SECONDARY"

    if (!title) {
      return await interaction.reply({ content: `${Emojis.error} You must specify a title`, ephemeral: true });
    }

    const embed = new MessageEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)

    const row = new MessageActionRow()

    const result = await getTypes(interaction.guild.id);
    if (result.status) {
      if (result.data.length <= 0) {
        await interaction.reply({ content: `${Emojis.error} No links found.`, ephemeral: true });
      } else {
        result.data.forEach((type) => {
          row.addComponents(new MessageButton()
            .setCustomId(type)
            .setLabel(type)
            .setStyle(style));
        });
  
        await interaction.reply({ embeds: [embed], components: [row] });
      }
    } else {
      await interaction.reply({ content: result.message, ephemeral: true });
    }
  }
};
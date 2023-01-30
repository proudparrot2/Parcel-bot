const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const { addLink } = require("../db.js");
const { Emojis } = require("../emojis.js")

module.exports = {
    data: new SlashCommandBuilder()
      .setName("add")
      .setDescription("Add a new link")
      .addStringOption(option => option.setName("category")
        .setDescription("The link's category")
        .setRequired(true))
      .addStringOption(option => option.setName("url")
        .setDescription("The URL of the link")
        .setRequired(true)),
    async execute(interaction) {
      if (interaction.options.getSubcommand() === 'user') {
        interaction.reply("no")
      } else {
        const category = interaction.options.getString("category");
        const url = interaction.options.getString("url");
        if (!category || !url) {
          return await interaction.reply({
            content: Emojis.error + " You need to specify a category and a url.",
            ephemeral: true
          });
        }

        const embed = new MessageEmbed()
          .setTitle(Emojis.success + " Link added successfully")
          .setColor("#2f3136")
          .addField(Emojis.link + " URL", `<:Reply:1069398753183809546> ${url}`)
          .addField(Emojis.info + " Category", `<:Reply:1069398753183809546> ${category}`)

        const result = await addLink(interaction.guild.id, type, url);
        if (result.status) {
          await interaction.reply({
            embeds: [embed],
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: result.message,
            ephemeral: true
          });
        }
      }
      },
    };
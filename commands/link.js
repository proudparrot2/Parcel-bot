const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, CommandInteractionOptionResolver } = require("discord.js");

const { addLink, removeLink } = require("../db.js");
const { Emojis } = require("../emojis.js")

module.exports = {
    data: new SlashCommandBuilder()
      .setName("link")
      .setDescription("Various options for links")
      .addSubcommand(subcommand =>
        subcommand
        .setName('add')
        .setDescription('Add a link')
        .addStringOption(option => option.setName('category').setDescription('The category of the link').setRequired(true))
        .addStringOption(option => option.setName('url').setDescription('The URL of the link').setRequired(true)))
      .addSubcommand(subcommand =>
        subcommand
        .setName('remove')
        .setDescription('Remove a link')
        .addStringOption(option => option.setName('category').setDescription('The category of the link').setRequired(true))
        .addStringOption(option => option.setName('url').setDescription('The URL of the link').setRequired(true))),
    async execute(interaction) {
      if (!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply({ content: Emojis.error + " You can't use this command", ephemeral: true })
      if (interaction.options.getSubcommand() === 'add') {
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
  
        const result = await addLink(interaction.guild.id, category, url);
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
      } else if (interaction.options.getSubcommand() === "remove") {
        const category = interaction.options.getString("category");
        const url = interaction.options.getString("url");
        if (!category || !url) {
          return await interaction.reply({
            content: Emojis.error + " You must specify a type and a URL.",
            ephemeral: true
          });
        }
        const result = await removeLink(interaction.guild.id, category, url);
        if (result.status) {
          const embed = new MessageEmbed()
            .setTitle(Emojis.success + " Link removed successfully")
            .setColor("#2f3136")
            .addField(Emojis.link + " URL", Emojis.reply + " " + url)
            .addField(Emojis.info + " Type", Emojis.reply + " " + category)
  
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
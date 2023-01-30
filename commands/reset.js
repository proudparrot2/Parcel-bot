const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { reset } = require("../db.js");
const { Emojis } = require("../emojis.js")

module.exports = {
  data: new SlashCommandBuilder()
	  .setName("reset")
	  .setDescription("Reset link limits for one user or the entire server")
    .addUserOption(option => option.setName("target").setDescription("The user to reset")),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    
    if (target) {


      const embed = new MessageEmbed()
        .setTitle(Emojis.warning + ` Reset proxy limits for ${target.username}#${target.discriminator}?`)
        .setDescription(`This will reset all link limits for <@${target.id}>. You have 5 secconds to click ${Emojis.success} to continue.`)
        .setColor("#2f3136")
      
      const button = new MessageButton()
        .setCustomId("__RESET_CONFIRM_USER__")
        .setLabel("")
        .setEmoji(Emojis.success)
        .setStyle("SECONDARY")

      const row = new MessageActionRow().addComponents(button);

      await interaction.reply({ embeds: [embed], components: [row] })

      const collector = interaction.channel.createMessageComponentCollector({ componentType: "BUTTON", time: 5000 });
      const success = new MessageEmbed()
        .setDescription(Emojis.success + ` Successfully reset link limits for <@${target.id}>.`)
        .setColor("#2f3136")
      collector.on("collect", (i) => {
        if (i.component.customId === "__RESET_CONFIRM_USER__") {
          reset(interaction.guild.id, target.id);
          i.reply({ embeds: [success] });
          button.setDisabled(true);
          interaction.editReply({ components: [row] });
        }
      });

      collector.on("end", (collected) => {
	      button.setDisabled(true);
        interaction.editReply({ components: [row] });
      });


    } else {


      const embed = new MessageEmbed()
        .setTitle(Emojis.warning + " Reset link limits for the entire server")
        .setDescription("Do you really want to reset the link limits for the entire server? You have `5` seconds to click " + Emojis.success + ".")
        .setColor("#2f3136")
      
      const button = new MessageButton()
        .setCustomId("__RESET_CONFIRM_GUILD__")
        .setLabel("")
        .setEmoji(Emojis.success)
        .setStyle("SECONDARY")

      const row = new MessageActionRow().addComponents(button);

      await interaction.reply({ embeds: [embed], components: [row] })

      const collector = interaction.channel.createMessageComponentCollector({ componentType: "BUTTON", time: 5000 });
      const yay = new MessageEmbed()
        .setDescription(Emojis.success + " Link limits for all users have been reset.")
        .setColor("#2f3136")
      collector.on("collect", (i) => {
        if (i.component.customId === "__RESET_CONFIRM_GUILD__") {
          if (i.member.user.id !== interaction.member.user.id) return i.reply({ content: Emojis.error + ` This button isnt for you.`, ephemeral: true });
          reset(interaction.guild.id);
          i.reply({ embeds: [yay] });
          button.setDisabled(true);
          interaction.editReply({ components: [row] });
        }
      });
    }
  }
};
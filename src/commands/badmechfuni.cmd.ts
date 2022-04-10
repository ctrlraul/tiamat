import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'


// Todo: make it support mentioning someone

export const command: Command = {

  data: new SlashCommandBuilder()
    .setName('badmechfuni')
    .setDescription('Tells whoever is posting bad mechs thinking they are funny to shut up'),

  execute (interaction) {

    const user = interaction.options.getUser('user')
    const reply = 'wow 🤯 the ❗ mech 🤖 you 🧍 just 🕔 sent 📧 is 🤔 HILARIOUS 😂 I 🤖 am ❕ CRYING 😭 of ❓ LAUGHTER 🤣 right ➡️ now 🕒 it\'s 😱 so 🤨 much 💯 that 👉 I 🤖 think 💭 I 🤖 am ❕ about 📝 to ❗ EXPLODE 💥 please 🙏 NEVER 🕳️ post 💬 that ☝️ cringe 😬 shit 💩 again 😂'

    interaction.reply({
      content: user ? `<@${user.id}> ${reply}` : reply
    })

  },

}

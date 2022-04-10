import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'


// Todo: make it support mentioning someone

export const command: Command = {

  data: new SlashCommandBuilder()
    .setName('badmechfuni')
    .setDescription('Tells whoever is posting bad mechs thinking they are funny to shut up'),

  execute (interaction) {

    const user = interaction.options.getUser('user')
    const reply = 'wow 🤯 the ❗ MECH 🤖 you 🧍 just 🕔 sent 📧 is 🤔 HILARIOUS 😂 i 🤖 am ❕ CRYING 😭 of ❓ LAUGHTER 🤣 right ➡️ now 🕒 it\'s 😱 so 🤨 much 💯 that 👉 i 🤖 think 💭 i 🤖 am ❕ about 📝 to ❗ EXPLODE 💥 you 🧍 are 🤔 so 🤨 original 💡 nobody 🔎 ever 🌎 did 🏃 this ✨ before ⌛ thank 🙌 you ❤️'

    interaction.reply({
      content: user ? `<@${user.id}> ${reply}` : reply
    })

  },

}

import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'


// Todo: make it support mentioning someone

export const command: Command = {

  data: new SlashCommandBuilder()
    .setName('badmechfuni')
    .setDescription('Compliments the funny mech poster'),

  execute (interaction) {

    const user = interaction.options.getUser('user')
    const reply = 'WOW 🤯 ❗ the SUPER MECH 🇹 🇲  you 🧍 just posted 🕔 📧 is HILARIOUS 😩 🤣 i 🤖 am CRYING 😭 😨  of LAUGHTER 🤣 ‼️ right now ➡️ 🕒 it is so much 😩 😓 💯 that i 🤖 think 💭 i 🤖 am going to ❕🏃‍♂️ EXPLODE of joy 💣 💥 😀 😀 you 🧍 are so 🤔 😩 ORIGINAL #️⃣1️⃣ 🧠 💡 nobody EVER 🔎 🌎 😲 did this ⬆️ 💪 ✨ before ⌛ thank you 🙌 🤝 ❤️'

    interaction.reply({
      content: user ? `<@${user.id}> ${reply}` : reply
    })

  },

}

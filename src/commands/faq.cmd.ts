import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'



const FAQ_URL = 'https://community.supermechs.com/knowledgebase/faq/'
const questions: [string, string][] = [
  ['How do I disable my base?', 'how-do-i-disable-my-base-r1'],
  ['What happens to SuperMechs when Flash dies?', 'what-happens-to-supermechs-when-flash-dies-r2'],
  ['How to find my playerID?', 'how-to-find-my-playerid-r3'],
  ['What to do if my purchased tokens/items did not arrive in time?', 'what-to-do-if-my-purchased-tokensitems-did-not-arrive-in-time-r4'],
  ['What can get you banned?', 'what-can-get-you-banned-r5'],
  ['How do I appeal a ban?', 'how-do-i-appeal-a-ban-r6'],
  ['How do Clubs work on the forum?', 'how-do-clubs-work-on-the-forum-r7'],
  ['How can I recover my account?', 'how-can-i-recover-my-account-r8'],
  ['How can I get a job at Gato Games?', 'how-can-i-get-a-job-at-gato-games-r9'],
]



export const command: Command = {

  data: new SlashCommandBuilder()
    .addStringOption(option => option
      .setName('question')
      .setDescription(`Which question link`)
      .setChoices(questions)
    )
		.setName('faq')
		.setDescription('Links the Frequently Asked Questions'),

	execute (interaction) {

    const question = interaction.options.getString('question')

    if (question === null) {
      interaction.reply({ content: FAQ_URL })
    } else {
      interaction.reply({ content: FAQ_URL + question })
    }

	},

}

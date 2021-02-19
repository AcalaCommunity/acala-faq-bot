const Discord = require('discord.js');
const questions = require("./questions.json")

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
    const question = msg.content.trim().toLowerCase();
    
    for (let i = 0; i < questions.length; i++) {
        let q = questions[i];
        if (q.question.toLowerCase() == question) {
            const answer = new Discord.MessageEmbed();
            answer.setTitle(`**${q.question}**`);
            answer.setDescription(q.answer);
            answer.setColor(0xfe9073);
            q.url ? answer.setURL(q.url) : null;
            
            msg.reply(answer);
        }
    }
});

function start(token) {
    client.login(token);
}

module.exports = start;
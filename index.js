const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix } = require('./config.json');

require('dotenv').config();

let serverRole;
let vipRole;

let guildMembers;

client.once('ready', () => {
    const guild = client.guilds.cache.get(process.env.SERVER_ID);

    const roles = guild
        .roles.cache;

    serverRole = roles.find(r => r.name === process.env.SERVER_ROLENAME);
    vipRole = roles.find(r => r.name === process.env.VIP_ROLENAME);

    if(!guild) {
        console.log("FATAL ERROR: Guild not found!");
    } else {
        guildMembers = guild.members;
    }

    console.log('RoleBot is Ready to GO!');
});

/*
 * Grants user a certain role
 *
 * @param {Discord.User} sender - user who has just given bot the correct answer
 * @param {Discord.Role} role - role to be granted
 * @param {string} successText - text to send to user if the role granting is a glorious success
 */
function grantRoleForSender(sender, role, successText) {
    const member = guildMembers
        .cache
        .find(member => member.user === sender);
    if(!member) {
        console.log("PROBLEM: User not found among guild members");
        sender.send("Wystąpił problem #002 - Spróbuj ponownie lub skontaktuj się z osobą zarządzającą botem");
    } else {
        member
            .roles
            .add(role)
            .then(sender.send(successText))
            .catch(err => {
                console.log("ERROR while adding a role: " + err);
                sender.send("Wystąpił problem #003 - Spróbuj ponownie lub skonsultuj się z osobą zarządzającą botem");
            });
    }
}

client.on('message', message => {

    const sender = message.author
    if(message.channel.type === 'dm') {
        if(!guildMembers) {
            console.log("PROBLEM: Guild reference is Undefined");
            sender.send("Wystąpił problem #001 - Spróbuj ponownie lub skontaktuj się z osobą zarządzającą botem");
        } else if(message.content === process.env.SERVER_ROLEPASSWORD) {
            grantRoleForSender(sender, serverRole, "Od teraz możesz korzystać z Discordowego Serwera!");
        } else if(message.content === process.env.VIP_ROLEPASSWORD) {
            grantRoleForSender(sender, vipRole, "Od teraz masz dostęp do sekcji VIP!");
        } else {
            sender.send("Hasło niepoprawne")
                .catch(err => {
                    // Well, I dunno why the bot is giving post error on each dm, so let's just ignore that error (that would hide serious console logs
                    if(err.toString() !== "DiscordAPIError: Cannot send messages to this user") {
                        console.log("ERROR while sending wrong password message to user: " + err);
                    }
                });
        }
    } else {
        if(message.channel.name === process.env.BOT_CHANNEL_NAME) {
            if(message.content.toLowerCase().includes("staszek kuca przy siku")) {
                sender.send("Nieprawda :cry:")
                    .catch(err => console.log("ERROR while welcoming the user: " + err));
            } else if(message.content.toLowerCase() === `${prefix}siema`) {
                sender.send("Oł haj!")
                    .catch(err => console.log("ERROR while welcoming the user: " + err));
            }
        }

    }
});

client.login(process.env.TOKEN)
    .then(console.log("Client login successful"))
    .catch(err => "ERROR while logging in: " + err);

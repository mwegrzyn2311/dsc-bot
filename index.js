const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix } = require('./config.json');

require('dotenv').config();

let serverRole;
let vipRole;

let guildMembers;

const noReactionMsg = "*Ramm nie reaguje.*";

/**
 * Bot init - once bot successfully logs in, all needed variables are set
 */
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

/**
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
        sender.send("Wystąpił problem #002 - Spróbuj ponownie lub skontaktuj się z osobą zarządzającą botem")
            .catch(err => console.log("ERROR while giving ERROR #002: " + err));
    } else if(member.roles.cache.find(alreadyGrantedRole => alreadyGrantedRole === role)) {
        sender.send(noReactionMsg)
            .catch(err => console.log("ERROR while sending no reaction msg to user: " + err));
    } else {
        member
            .roles
            .add(role)
            .then(sender.send(successText))
            .catch(err => {
                console.log("ERROR while adding a role: " + err);
                sender.send("Wystąpił problem #003 - Spróbuj ponownie lub skonsultuj się z osobą zarządzającą botem")
                    .catch(err => console.log("ERROR while giving ERROR #003: " + err));
            });
    }
}

/**
 * Bot reaction for a new guild (server) member
 */
client.on('guildMemberAdd', member => {
    member.send(process.env.WELCOME_MSG)
        .catch(err => console.log("ERROR while greeting a new member: " + err));
});

/**
 * Bot reaction for messages (in the server and DMs to him)
 */
client.on('message', message => {

    const sender = message.author
    if(message.channel.type === 'dm') {
        const msg = message.content.toLowerCase();
        if(!guildMembers) {
            console.log("PROBLEM: Guild reference is Undefined");
            sender.send("Wystąpił problem #001 - Spróbuj ponownie lub skontaktuj się z osobą zarządzającą botem")
                .catch(err => console.log("ERROR while giving ERROR #001: " + err));
        } else if(msg === process.env.SIEMA.toLowerCase()) {
            sender.send(process.env.WELCOME_MSG)
                .catch(err => console.log("ERROR while responding to SIEMA: " + err));
        } else if(msg === process.env.SERVER_ROLEPASSWORD.toLowerCase()) {
            grantRoleForSender(sender, serverRole, process.env.SERVER_ANSWER);
        } else if(msg === process.env.VIP_ROLEPASSWORD.toLowerCase()) {
            grantRoleForSender(sender, vipRole, process.env.VIP_ANSWER);
        } else if(msg === process.env.QUERY1.toLowerCase()) {
            sender.send(process.env.QUERY1_ANSWER)
                .catch(err => console.log("ERROR while answering a query: " + err));
        } else if(msg === process.env.QUERY2.toLowerCase()) {
            sender.send(process.env.QUERY2_ANSWER)
                .catch(err => console.log("ERROR while answering a query: " + err));
        } else if(msg === process.env.QUERY3.toLowerCase()) {
            sender.send(process.env.QUERY3_ANSWER)
                .catch(err => console.log("ERROR while answering a query: " + err));
        } else {
            sender.send(noReactionMsg)
                .catch(err => {
                    // Well, I dunno why the bot is giving post error on each dm, so let's just ignore that error (that would hide serious console logs
                    if(err.toString() !== "DiscordAPIError: Cannot send messages to this user") {
                        console.log("ERROR while sending no reaction msg to user: " + err);
                    }
                });
        }
    }
});

client.login(process.env.TOKEN)
    .then(console.log("Client login successful"))
    .catch(err => "ERROR while logging in: " + err);

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
        sendAndHandle(sender, "Wystąpił problem #002 - Spróbuj ponownie lub skontaktuj się z osobą zarządzającą botem");
    } else if(member.roles.cache.find(alreadyGrantedRole => alreadyGrantedRole === role)) {
        sendAndHandle(sender, noReactionMsg);
    } else {
        member
            .roles
            .add(role)
            .then(sender.send(successText))
            .catch(err => {
                console.log("ERROR while adding a role: " + err);
                sendAndHandle(sender, "Wystąpił problem #003 - Spróbuj ponownie lub skonsultuj się z osobą zarządzającą botem");
            });
    }
}

/**
 * Bot reaction for a new guild (server) member
 */
client.on('guildMemberAdd', member => {
    sendAndHandle(member, process.env.WELCOME_MSG);
});

/**
 * Bot reaction for messages (in the server and DMs to him)
 */
client.on('message', message => {
    const sender = message.author

    if(sender.id === process.env.CLIENT_ID) {
        // Don't handle your own messages
        return;
    }

    if(message.channel.type === 'dm') {
        const msg = message.content.toLowerCase();
        if(!guildMembers) {
            console.log("PROBLEM: Guild reference is Undefined");
            sendAndHandle(sender, "Wystąpił problem #001 - Spróbuj ponownie lub skontaktuj się z osobą zarządzającą botem");
        } else if(msg === process.env.SIEMA.toLowerCase()) {
            sendAndHandle(sender, process.env.WELCOME_MSG);
        } else if(msg === process.env.SERVER_ROLEPASSWORD.toLowerCase()) {
            grantRoleForSender(sender, serverRole, process.env.SERVER_ANSWER);
        } else if(msg === process.env.VIP_ROLEPASSWORD.toLowerCase()) {
            grantRoleForSender(sender, vipRole, process.env.VIP_ANSWER);
        } else if(msg === process.env.QUERY1.toLowerCase()) {
            sendAndHandle(sender, process.env.QUERY1_ANSWER);
        } else if(msg === process.env.QUERY2.toLowerCase()) {
            sendAndHandle(sender, process.env.QUERY2_ANSWER);
        } else if(msg === process.env.QUERY3.toLowerCase()) {
            sendAndHandle(sender, process.env.QUERY3_ANSWER);
        } else {
            sendAndHandle(sender, noReactionMsg);
        }
    }
});

function sendAndHandle(sender, msg) {
    sender.send(msg)
        .catch(err => console.log("ERROR while sending msg: \"" + msg + "\". ERR: \"" + err + "\""));
}

client.login(process.env.TOKEN)
    .then(console.log("Client login successful"))
    .catch(err => "ERROR while logging in: " + err);

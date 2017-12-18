const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./settings.json').token;
const settings = require('./settings.json');
const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');
require('./util/eventLoader')(client);
client.on('ready', () => {
	console.log(chalk.bgGreen.black('I\'m Online\nI\'m Online'));
	client.user.setPresence({ game: { name: "Setup - Create Logs channel [Prefix] = ~ ", type: 0 } });
	client.user.setStatus("idle")
});

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    log(`Loading Command: ${props.help.name}. 👌`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.elevation = message => {
  /* This function should resolve to an ELEVATION level which
     is then sent to the command handler for verification*/
  let permlvl = 0;
  let mod_role = message.guild.roles.find('name', settings.modrolename);
  if (mod_role && message.member.roles.has(mod_role.id)) permlvl = 2;
  let admin_role = message.guild.roles.find('name', settings.adminrolename);
  if (admin_role && message.member.roles.has(admin_role.id)) permlvl = 3;
  if (message.author.id === settings.ownerid) permlvl = 4;
  return permlvl;
};


client.on('disconnect', () =>{
  console.log(`You have been disconnected at ${new Date()}`);
});

client.on('reconnecting', () => {
  console.log(`Reconnecting at ${new Date()}`);
});


client.on('roleCreate', role=> {
  let guild = role.guild;
  role.guild.channels.find('name', 'general').send(`A role called ${role.name} has been created`);
});

client.on('roleDelete',role => {
  let guild = role.guild;
  role.guild.channels.find('name', 'general').send(`Fetching role data....`)
  role.guild.channels.find('name', 'general').send(`Please Wait...`)
  role.guild.channels.find('name', 'general').send(`A role called (${role.name}) has been deleted at ${new Date()}`);
});

client.on('roleUpdate', (oRole, nRole) => {
  console.log((oRole, nRole));
});


// Guild Events

client.on('guildDelete', guild => {
	console.log(`Bot Was Removed From: ${guild.name} ID => ${guild.id} at ${new Date()}`);
     
});

client.on('guildCreate', guild => {
	console.log(`Bot Was added at ${guild.name} at ${new Date()}`);
});

 client.on('guildMemberAdd', member => {
	member.guild.channels.find('name', 'logs').send(`\`\`\`css\n#User_Join\n${new Date()}\n<User: > [${member.user.username}]\n\`\`\`\ `)  
	member.guild.channels.find('name', 'general').send(`${member.user.username} has join the server at \`\`(${new Date()}\n\`\`\ Please Give them a warm welcome to the server!`)
 });

client.on('guildMemberAdd', member => {
	console.log(`User: [${member.user.username}] has joined a guild! `);
});

client.on('guildUpdate',(oGuild, nGuild) => {
	console.log((oGuild, nGuild));
});

client.on('guildMemberUpdate',(oMember, nMember) => {
	console.log((oMember, nMember));
});

 client.on('guildBanAdd', function(guild,user) {
	 console.log(user)
	 guild.channels.find('name', 'logs').send(`\`\`\`css\n#UserBan\n<Date: > ${new Date()}\n<User: > [${user.username}]\n\`\`\`\ `);
 });

 client.on('guildBanRemove', function(guild,user) {
	 console.log(user)
	 guild.channels.find('name', 'logs').send(`\`\`\`css\n#UserUnban\n<Date: > ${new Date()}\n<User: > [${user.username}]\n\`\`\`\ `);
 });

 client.on('guildMemberRemove', function(member,guild) {
	 console.log(`User: [${member.user.username}] has been removed/left from a guild `);
 });

 // Client Events

client.on('channelCreate',channel => {
  console.log(`A ${channel.type} channel by the name of ${channel.name} and was ${channel.createdAt} with the ID of ${channel.id} `);
  if (!channel.guild.channels.find('name', 'general')) 
  channel.guild.channels.find('name', 'general').send(`\`\`\`css\n#Channel_Created\n${channel.createdAt}\n<Channel Type: > [${channel.type}]\n<Channel Name: > [${channel.name}]\n\`\`\`\ `);
  if (channel.type === 'text') return channel.send('\`\`\nSuccesfully Registered\n\`\`\ ');
  
});

client.on('channelDelete',channel => {
	console.log(`A ${channel.type} by the name of ${channel.name} was succesfully deleted with the ID of ${channel.id} `);
	channel.guild.channels.find('name', 'logs').send(`\`\`\`css\n#Channel_Deleted\n${new Date()}\n<Channel Name: > [${channel.name} => ${channel.id}]\n\`\`\`\ `);
	channel.guild.channels.find('name', 'general').send(` A Channel Named [${channel.name}] was deleted succesfully \n\`\`ID =>  ${channel.id} \n\`\`\ `);
});

client.on('channelUpdate', (oChannel, nChannel) => {
	console.log((oChannel, nChannel));
});

client.on('channelPinsUpdate', (channel, time) => {
     channel.guild.channels.find('name', 'logs').send(`\`\`\`css\n#Pin_Update\n${time}\n<Channel Name: > [${channel.name} => ${channel.id}]\n\`\`\`\ `);
});

client.on('messageDelete', message => {
	console.log(`A Message with the contents (${message.cleanContent}) was deleted from <${message.channel}>`);
});

client.on('typingStart', (channel, user) => {
	console.log(`${user.username} is typing in ${channel.name}`)
});

client.on('typingStop', (channel, user) => {
	console.log(`<Case: #Stop_Typed> ${user.username} stopped typing in ${channel.name}`)
});

var prefix = "~"
client.on('message', message => {
	var guild = message.guild;
	let args = message.content.split(' ').slice(1);
	var result = args.join(' ');


	if (!message.content.startsWith(prefix)) return;
	if (message.author.bot) return;

	if (message.content.startsWith(prefix + 'purge')) {
		if (!args.join(" ")) return message.channel.send('Please enter the amount of messages to purge');
		let messagecount = parseInt(result);
		message.channel.fetchMessages({limit: messagecount}).then(messages => message.channel.bulkDelete(messages));
		message.channel.send(`:white_check_mark: **Sucessfully Purged Channel**`)
		message.member.guild.channels.find('name', 'general').send(`${messagecount} messages where cleared`)
	} else
		
	if (message.content.startsWith(prefix + 'ping')) {
		message.channel.send(`**Ping:** \`${Date.now() - message.createdTimestamp} ms\``);
	} else

    if (message.content.startsWith(prefix + 'send')) {
		    message.channel.send(`a magical ~~~ wave ~~~ has sent this message to this channel`);
		} else

  if (message.content.startsWith(prefix + 'date')) {
		message.channel.send(`The Current Date Is: ${new Date()}`)
	} else

  if (message.content.startsWith(prefix + 'commands')) {
		message.channel.send(`Coming Soon...`)
  } else

  if (message.content.startsWith(prefix + 'prefix')) {
    message.channel.send(`My Prefix is: ~`)
  } else 

 if (message.content.startsWith(prefix + 'rolecreate')) {
  if (!args.join(" ")) return message.channel.send('Please enter the role you wish to create');
  message.channel.send(args[0]);
  message.member.guild.createRole({
    name: `${args[0]}`,
    color: 'RED',
  }).then(nothing => {
    message.channel.send(`Created role ${args[0]}`)
  }) 

} else

    
var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
 // console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
});

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(settings.token);

require('dotenv').config();
const fs = require('fs');
const { Client, Intents } = require('discord.js');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const client = new Client({
    intents:
        [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS]
});


client.on('ready', async () => {
    const channel = client.channels.cache.find((channel) => channel.name === config.channel);
    try {
        await channel.messages.fetch();
    } catch (err) {
        console.error('Error fetching channel messages', err);
        return;
    }
    console.log(`机器人成功启动, 监听频道: #'${JSON.stringify(channel.name)}\n`)
});

client.on('messageCreate', async (msg) => {
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
    const args = msg.content.slice(config.prefix.lenght).split(/ +/)
    const userName = args[1]
    const roleName = args[2]

    const guild = client.guilds.cache.get(config.discordId);
    const user = client.users.cache.find(u => u.tag == userName);
    const channel = client.channels.cache.get(msg.channelId);
    channel.send(`同步 AirTable 最新测验信息 ...`);

    if (user === undefined) {
        console.error(`User not found for '${userName}'`);
        channel.send(`⚠️ 找不到成员 '${userName}', 请联络 SeeDAO 管理员`);
        return;
    }

    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.find((role) => {
        return role.name === config.roles[roleName];
    });

    if (!role) {
        console.error(`Role not found for '${roleName}'`);
        channel.send(`⚠️ 找不到身份标签 '${roleName}', 请联络 SeeDAO 管理员`);
        return;
    }
    try {
        member.roles.add(role.id);
        channel.send(`🎉 恭喜 ${user.toString()} 通过 OnBoarding 测验, 取得 **'${roleName}'** 身份标签!`);
    } catch (err) {
        console.error('Error adding role', err);
        channel.send(`⚠️ 添加身份 '${roleName}' 失败, 请联络 SeeDAO 管理员`);
        return;
    }
})

client.login(process.env.BOT_TOKEN);
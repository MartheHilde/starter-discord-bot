
// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config()
const { getJobs } = require('finn-jobb');

const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 


const axios = require('axios')
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');


const app = express();
// app.use(bodyParser.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});




app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name)
    if(interaction.data.name == 'yo'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Yo ${interaction.member.user.username}!`,
        },
      });
    }

    if(interaction.data.name == 'dm'){
      // https://discord.com/developers/docs/resources/user#create-dm
      let c = (await discord_api.post(`/users/@me/channels`,{
        recipient_id: interaction.member.user.id
      })).data
      try{
        // https://discord.com/developers/docs/resources/channel#create-message
        let res = await discord_api.post(`/channels/${c.id}/messages`,{
          content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
        })
        console.log(res.data)
      }catch(e){
        console.log(e)
      }

      return res.send({
        // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          content:'👍'
        }
      });
    }

    if (interaction.data.name === 'jobb') {
      // Fetch job listings using the "finn-jobb" package
      try {
        const jobs = await getJobs({
          getFinnJobs: true,
          getKode24Jobs: false,
        });

        // Prepare the job information to send in the response
        const jobInfo = jobs.map((job, index) => {
          return {
            name: `Job ${index + 1}`,
            value: `Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nURL: ${job.url}`,
          };
        });

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Here are some job listings:`,
            embeds: [
              {
                title: 'Job Listings',
                fields: jobInfo,
              },
            ],
          },
        });
      } catch (error) {
        console.error(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'An error occurred while fetching job listings.',
          },
        });
      }
    }

  }

});



// app.get('/register_commands', async (req,res) =>{
  app.get('/register_commands', async (req, res) => {
    let slash_commands = [
      {
        "name": "yo",
        "description": "replies with Yo!",
        "options": []
      },
      {
        "name": "dm",
        "description": "sends user a DM",
        "options": []
      },
      {
        "name": "jobb",
        "description": "Get information about a job",
        "options": []
      }
    ];
      // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
      try {
        const discord_response = await discord_api.post(
          `/applications/${APPLICATION_ID}/commands`,
          slash_commands
        );
    
        console.log(discord_response.data);
        return res.send('commands have been registered');
      } catch (e) {
        console.error(e.code);
        console.error(e.response?.data);
    
        
    return res.send(`${e.code} error from discord`);
      }
    });
    


app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})


app.listen(8999, () => {

})


Put your DISCORD_BOT_TOKEN in the .env file

--

If you're going to run from a dockerhub image, you'll need to put the BOT DISCORD_BOT_TOKEN in your run command. This is because we keep the .env out of the docker image for security purposes.

docker run -d \
  --name starcitizenbot \
  --restart unless-stopped \
  -e DISCORD_BOT_TOKEN=YOUR TOKEN HERE \
  YOUR-DOCKERHUB-USERNAME/YOUR-IMAGE-NAME:1
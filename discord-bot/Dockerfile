FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir discord.py aiohttp

# Copy bot source and local database into container
COPY discord_ship_bot.py /app/discord_ship_bot.py


# Bot token will be provided via environment (from .env or Docker Compose)

# Run the bot
CMD ["python", "discord_ship_bot.py"]

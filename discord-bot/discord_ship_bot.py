import os
import discord
from discord.ext import commands
from discord.ui import Select, View
import aiohttp
import difflib

# URL to your JSON ship database
DATABASE_URL = 'https://dumpysdepot.com/database.json'
# In-memory cache for ship data
tmp_data = []

# Configure bot intents
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

class ShipSelect(Select):
    def __init__(self, matches):
        options = [discord.SelectOption(label=s.get('vehicle', 'N/A'), value=str(i)) for i, s in enumerate(matches)]
        super().__init__(placeholder='Select a ship...', min_values=1, max_values=1, options=options)
        self.matches = matches

    async def callback(self, interaction: discord.Interaction):
        idx = int(self.values[0])
        ship = self.matches[idx]
        embed = discord.Embed(title=ship.get('vehicle', 'Unknown Ship'), color=discord.Color.blue())
        fields = {
            'Capacity': ship.get('capacity'),
            'Standalone': ship.get('standalone'),
            'Warbond': ship.get('warbond'),
            'Package Price': ship.get('packagePrice'),
            'Concierge': ship.get('concierge'),
            'UEC Buy': ship.get('uecBuy'),
            'UEC Rent': ship.get('uecRent'),
            'Location': ship.get('Location') or ship.get('location'),
            'Loaner': ship.get('Loaner') or ship.get('loaner'),
            'More Info': ship.get('url')
        }
        for name, val in fields.items():
            if val is not None:
                # Sanitize value: convert line breaks and strip unwanted characters
                value_str = str(val).replace('<br>', '\n')
                for ch in ['[', ']', '"', "'"]:
                    value_str = value_str.replace(ch, '')
                embed.add_field(name=name, value=value_str, inline=False)
        await interaction.response.edit_message(content=None, embed=embed, view=None)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user} (ID: {bot.user.id})')
    print('Fetching ship database from', DATABASE_URL)
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(DATABASE_URL) as resp:
                print('Fetch status:', resp.status)
                data = await resp.json()
                global tmp_data
                if isinstance(data, dict) and 'ships' in data:
                    tmp_data = data['ships']
                elif isinstance(data, list):
                    tmp_data = data
                else:
                    tmp_data = data.get('ships', [])
                print(f'Loaded {len(tmp_data)} ships')
                # Debug sample
                for s in tmp_data[:5]:
                    print('Sample:', s.get('vehicle'))
    except Exception as e:
        print('Error fetching database:', e)

@bot.command(name='ship')
async def ship(ctx: commands.Context, *, ship_name: str):
    """
    Substring match on 'vehicle' field; if multiple, present a dropdown to select one.
    """
    query = ship_name.lower().strip()
    print(f'Command !ship invoked with query: "{query}"')
    if not tmp_data:
        await ctx.send('🔄 Database not loaded yet, please try again shortly.')
        return
    matches = [s for s in tmp_data if query in s.get('vehicle', '').lower()]
    print(f'Found {len(matches)} matches')
    if not matches:
        names = [s.get('vehicle', '') for s in tmp_data]
        suggestions = difflib.get_close_matches(ship_name, names, n=3, cutoff=0.5)
        msg = f'❌ No ships found matching "{ship_name}".'
        if suggestions:
            msg += f' Did you mean: {", ".join(suggestions)}?'
        await ctx.send(msg)
        return
    if len(matches) == 1:
        ship = matches[0]
        embed = discord.Embed(title=ship.get('vehicle', 'Unknown Ship'), color=discord.Color.blue())
        fields = {
            'Capacity': ship.get('capacity'),
            'Standalone': ship.get('standalone'),
            'Warbond': ship.get('warbond'),
            'Package Price': ship.get('packagePrice'),
            'Concierge': ship.get('concierge'),
            'UEC Buy': ship.get('uecBuy'),
            'UEC Rent': ship.get('uecRent'),
            'Location': ship.get('Location') or ship.get('location'),
            'Loaner': ship.get('Loaner') or ship.get('loaner'),
            'More Info': ship.get('url')
        }
        for key, val in fields.items():
            if val is not None:
                value_str = str(val).replace('<br>', '\n')
                for ch in ['[', ']', '"', "'"]:
                    value_str = value_str.replace(ch, '')
                embed.add_field(name=key, value=value_str, inline=False)
        await ctx.send(embed=embed)
    else:
        view = View()
        view.add_item(ShipSelect(matches))
        await ctx.send(f'🔍 Found {len(matches)} ships. Please choose one:', view=view)

if __name__ == '__main__':
    token = os.environ.get('DISCORD_BOT_TOKEN')
    if not token:
        print('Error: DISCORD_BOT_TOKEN env var missing')
        exit(1)
    bot.run(token)

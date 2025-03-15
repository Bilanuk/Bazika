import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AnimeEpisode {
  title: string;
  episodeNumber: number;
}

interface AnimeData {
  title: string;
  description: string;
  rating: number;
  imageUrl: string;
  episodes: AnimeEpisode[];
}

interface MixedEpisode extends AnimeEpisode {
  serialId: string;
  serialTitle: string;
  url: string;
}

const animeData: AnimeData[] = [
  {
    title: 'Chainsaw Man',
    description: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt by harvesting devil corpses with Pochita. One day, Denji is betrayed and killed. As his consciousness fades, he makes a contract with Pochita and gets revived as "Chainsaw Man" — a man with a devil\'s heart.',
    rating: 8.7,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/ru/2/24/Chainsawman.jpg',
    episodes: [
      { title: 'Dog & Chainsaw', episodeNumber: 1 },
      { title: 'Arrival in Tokyo', episodeNumber: 2 },
      { title: 'Meowy\'s Whereabouts', episodeNumber: 3 },
      { title: 'Rescue', episodeNumber: 4 },
      { title: 'Gun Devil', episodeNumber: 5 },
      { title: 'Kill Denji', episodeNumber: 6 },
      { title: 'The Taste of a Kiss', episodeNumber: 7 },
      { title: 'Gunfire', episodeNumber: 8 },
      { title: 'From Kyoto', episodeNumber: 9 },
      { title: 'Bruised & Battered', episodeNumber: 10 },
      { title: 'Mission Start', episodeNumber: 11 },
      { title: 'Katana vs. Chainsaw', episodeNumber: 12 }
    ]
  },
  {
    title: 'Dandadan',
    description: 'High schooler Momo Ayase strikes up an unusual friendship with her classmate Ken Takakura, who believes in ghosts but thinks aliens are nothing but nonsense. Meanwhile, Momo believes in aliens but thinks ghosts are a joke. When they encounter overwhelming evidence that both aliens and ghosts are real, their beliefs—and their lives—will never be the same.',
    rating: 8.5,
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BYWFhOWMxNTYtZThiMi00ZmQ5LTlmODktN2QwNzUyZjMyZGQzXkEyXkFqcGc@._V1_.jpg',
    episodes: [
      { title: 'The Girl Who Called Me Occult', episodeNumber: 1 },
      { title: 'Aliens vs. Ghosts', episodeNumber: 2 },
      { title: 'Supernatural Encounter', episodeNumber: 3 },
      { title: 'Evil Eye', episodeNumber: 4 },
      { title: 'The Golden Ball', episodeNumber: 5 },
      { title: 'Turbo Granny', episodeNumber: 6 },
      { title: 'The Space-Time Tunnel', episodeNumber: 7 },
      { title: 'Okarun\'s Decision', episodeNumber: 8 },
      { title: 'The Evil Eye Returns', episodeNumber: 9 },
      { title: 'Alien Invasion', episodeNumber: 10 },
      { title: 'The Power Within', episodeNumber: 11 },
      { title: 'A New Beginning', episodeNumber: 12 }
    ]
  },
  {
    title: 'One Punch Man',
    description: 'Saitama is a hero who only became a hero for fun. After three years of "special" training, though, he\'s become so strong that he\'s practically invincible. In fact, he\'s too strong—even his mightiest opponents are taken out with a single punch, and it turns out that being devastatingly powerful is actually kind of a bore.',
    rating: 8.8,
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzMwOGQ5MWItNzE3My00ZDYyLTk4NzAtZWIyYWI0NTZhYzY0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    episodes: [
      { title: 'The Strongest Man', episodeNumber: 1 },
      { title: 'The Lone Cyborg', episodeNumber: 2 },
      { title: 'The Obsessive Scientist', episodeNumber: 3 },
      { title: 'The Modern Ninja', episodeNumber: 4 },
      { title: 'The Ultimate Master', episodeNumber: 5 },
      { title: 'The Terrifying City', episodeNumber: 6 },
      { title: 'The Ultimate Disciple', episodeNumber: 7 },
      { title: 'The Deep Sea King', episodeNumber: 8 },
      { title: 'Unyielding Justice', episodeNumber: 9 },
      { title: 'Unparalleled Peril', episodeNumber: 10 },
      { title: 'The Dominator of the Universe', episodeNumber: 11 },
      { title: 'The Strongest Hero', episodeNumber: 12 }
    ]
  },
  {
    title: 'Vinland Saga',
    description: 'Young Thorfinn grew up listening to the stories of old sailors that had traveled the ocean and reached the place of legend, Vinland. It\'s said to be warm and fertile, a place where there would be no need for fighting—not at all like the frozen village in Iceland where he was born, nor the warring lands of the Vikings where his father died.',
    rating: 8.9,
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BNDA3MGNmZTEtMzFiMy00ZmViLThhNmQtMjQ4ZDc5MDEyN2U1XkEyXkFqcGc@._V1_.jpg',
    episodes: [
      { title: 'Somewhere Not Here', episodeNumber: 1 },
      { title: 'The Sword', episodeNumber: 2 },
      { title: 'The Journey Begins', episodeNumber: 3 },
      { title: 'A True Warrior', episodeNumber: 4 },
      { title: 'The Path of the Warrior', episodeNumber: 5 },
      { title: 'The Journey West', episodeNumber: 6 },
      { title: 'Normanni', episodeNumber: 7 },
      { title: 'Beyond the Edge of the Sea', episodeNumber: 8 },
      { title: 'The Battle of London Bridge', episodeNumber: 9 },
      { title: 'Ragnarok', episodeNumber: 10 },
      { title: 'A Real Warrior', episodeNumber: 11 },
      { title: 'The Land of Peace', episodeNumber: 12 }
    ]
  },
  {
    title: 'Solo Leveling',
    description: 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, known as "the weakest hunter of all mankind," is struggling to make ends meet. One day, after a brutal encounter in an overpowered dungeon wipes out his party, Jinwoo manages to survive only to be faced with a mysterious prompt asking him to become a "player."',
    rating: 8.6,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1926/140799.jpg',
    episodes: [
      { title: 'I\'m Used to It', episodeNumber: 1 },
      { title: 'If I Had One More Chance', episodeNumber: 2 },
      { title: 'Program', episodeNumber: 3 },
      { title: 'Hunter', episodeNumber: 4 },
      { title: 'A New Beginning', episodeNumber: 5 },
      { title: 'The Real Hunt Begins', episodeNumber: 6 },
      { title: 'Level Up', episodeNumber: 7 },
      { title: 'The S-Rank Dungeon', episodeNumber: 8 },
      { title: 'Demon\'s Castle', episodeNumber: 9 },
      { title: 'The True Power', episodeNumber: 10 },
      { title: 'Rise of the Shadow Monarch', episodeNumber: 11 },
      { title: 'I Am the Shadow Monarch', episodeNumber: 12 }
    ]
  }
];

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.episode.deleteMany();
  await prisma.serial.deleteMany();

  // First create all serials without episodes
  const createdSerials = await Promise.all(
    animeData.map(async (anime) => {
      const { episodes, ...serialData } = anime;
      const serial = await prisma.serial.create({
        data: serialData
      });
      return { serial, episodes };
    })
  );

  // Get all episodes and mix them
  const allEpisodes: MixedEpisode[] = createdSerials.reduce<MixedEpisode[]>((acc, { serial, episodes }) => {
    return acc.concat(
      episodes.map(ep => ({
        ...ep,
        serialId: serial.id,
        serialTitle: serial.title,
        url: `https://example.com/watch/${serial.title.toLowerCase().replace(/\s+/g, '-')}/${ep.episodeNumber}`
      }))
    );
  }, []);

  // Sort episodes to alternate between series
  const sortedEpisodes = allEpisodes.sort((a, b) => {
    // First compare by episode number
    const epDiff = a.episodeNumber - b.episodeNumber;
    if (epDiff !== 0) return epDiff;
    // If episode numbers are the same, sort by title to ensure consistent ordering
    return a.serialTitle.localeCompare(b.serialTitle);
  });

  // Add episodes with release dates
  const startDate = new Date('2024-01-06'); // Starting from first Saturday of 2024
  
  console.log('Creating mixed episodes...');
  for (let i = 0; i < sortedEpisodes.length; i++) {
    const episode = sortedEpisodes[i];
    const releaseDate = new Date(startDate);
    releaseDate.setDate(startDate.getDate() + Math.floor(i / animeData.length) * 7); // New batch every week

    await prisma.episode.create({
      data: {
        title: episode.title,
        episodeNumber: episode.episodeNumber,
        url: episode.url,
        serialId: episode.serialId
      }
    });
    console.log(`Created episode: ${episode.serialTitle} - Episode ${episode.episodeNumber}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
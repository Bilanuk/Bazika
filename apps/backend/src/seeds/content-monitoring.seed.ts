import { PrismaClient, SourceType } from '@database';

const prisma = new PrismaClient();

const nyaaSources = [
  {
    name: 'Nyaa - All Anime',
    url: 'https://nyaa.si/?page=rss&c=1_2', // Anime category
    type: SourceType.RSS,
  },
  {
    name: 'Nyaa - English Translated Anime',
    url: 'https://nyaa.si/?page=rss&c=1_2&f=2', // Anime category, trusted only
    type: SourceType.RSS,
  },
  {
    name: 'Nyaa - Raw Anime',
    url: 'https://nyaa.si/?page=rss&c=1_1', // Raw anime category
    type: SourceType.RSS,
  },
];

export async function seedContentMonitoring() {
  console.log('Seeding content monitoring sources...');

  try {
    // Clear existing sources
    await prisma.contentItem.deleteMany();
    await prisma.source.deleteMany();

    // Add Nyaa sources
    for (const sourceData of nyaaSources) {
      const source = await prisma.source.create({
        data: sourceData,
      });
      console.log(`Created source: ${source.name}`);
    }

    console.log('Content monitoring seeding completed successfully');
  } catch (error) {
    console.error('Error seeding content monitoring:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedContentMonitoring()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

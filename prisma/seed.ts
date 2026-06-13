import { prisma } from '../lib/db'

const seedMessages = [
  {
    recipient: "Sarah",
    body: "I still think about the way you laughed at my terrible jokes. Nobody else ever found them funny. I hope you found someone who makes you laugh even harder.",
    color: "#E63946",
    createdAt: new Date(Date.now() - 86400000 * 30),
  },
  {
    recipient: "James",
    body: "You were my best friend before you were anything else. I miss that the most.",
    color: "#457B9D",
    createdAt: new Date(Date.now() - 86400000 * 28),
  },
  {
    recipient: "M",
    body: "I wrote this letter a hundred times and never sent it. I guess this is letter one hundred and one.",
    color: "#B39DDB",
    createdAt: new Date(Date.now() - 86400000 * 25),
  },
  {
    recipient: "Alex",
    body: "The coffee shop on 5th still plays that song. I walked in last Tuesday and had to walk right back out.",
    color: "#F4845F",
    createdAt: new Date(Date.now() - 86400000 * 22),
  },
  {
    recipient: "Emily",
    body: "I kept the book you lent me. I know you said I could return it whenever, but I think we both knew what that meant.",
    color: "#7EC8A0",
    createdAt: new Date(Date.now() - 86400000 * 20),
  },
  {
    recipient: "Daniel",
    body: "You taught me what it feels like to be chosen. And then what it feels like to be unchosen. I needed both lessons.",
    color: "#9B59B6",
    createdAt: new Date(Date.now() - 86400000 * 18),
  },
  {
    recipient: "K",
    body: "I'm sorry I left without saying goodbye. It wasn't because I didn't care. It was because I cared too much to watch you not care.",
    color: "#F7B267",
    createdAt: new Date(Date.now() - 86400000 * 15),
  },
  {
    recipient: "Olivia",
    body: "Three years later and I still can't listen to that playlist.",
    color: "#5DADE2",
    createdAt: new Date(Date.now() - 86400000 * 12),
  },
  {
    recipient: "Ryan",
    body: "I saw your mom at the grocery store. She hugged me and said she missed me. I almost told her I missed you too.",
    color: "#F8AFA6",
    createdAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    recipient: "Grace",
    body: "You made me believe I was worth loving. I'm still working on believing it without you.",
    color: "#E63946",
    createdAt: new Date(Date.now() - 86400000 * 8),
  },
  {
    recipient: "Tom",
    body: "I found our photo in the back of my closet. You looked so happy. Were you?",
    color: "#6C7A89",
    createdAt: new Date(Date.now() - 86400000 * 6),
  },
  {
    recipient: "Luna",
    body: "You said forever like it was a promise. I held onto it like it was.",
    color: "#8DB580",
    createdAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    recipient: "Chris",
    body: "I hope Paris was everything you dreamed of. I hope you stood under the Eiffel Tower and thought, even for a second, that I should have been there.",
    color: "#F7D070",
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    recipient: "Mia",
    body: "The worst part isn't that you left. It's that you left so quietly I didn't even notice until the silence became unbearable.",
    color: "#457B9D",
    createdAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    recipient: "Noah",
    body: "I forgive you. I just wanted you to know that. Even if you never asked for it.",
    color: "#B39DDB",
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    recipient: "Sophie",
    body: "Every time it rains, I think of that night we danced in the parking lot. We were so young and so sure of everything.",
    color: "#F4845F",
    createdAt: new Date(Date.now() - 3600000 * 6),
  },
]

async function main() {
  console.log('Start seeding...')

  // Check if messages already exist
  const existingCount = await prisma.message.count()
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} messages. Skipping seed.`)
    return
  }

  for (const message of seedMessages) {
    await prisma.message.create({
      data: message,
    })
  }

  console.log(`Seeded ${seedMessages.length} messages`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

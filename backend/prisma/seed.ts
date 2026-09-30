import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding clean database...");

  // 1. Seed Admin
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@moviessnishad.com" },
    update: {
      password: adminPassword,
      name: "SNishad Admin",
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      name: "SNishad Admin",
      email: "admin@moviessnishad.com",
      password: adminPassword,
      role: AdminRole.SUPER_ADMIN,
    },
  });
  console.log("Admin seeded:", admin.email);

  // 2. Seed Site Settings
  await prisma.siteSetting.upsert({
    where: { id: "1" },
    update: {
      siteName: "Movies.snishad",
      tagline: "Watch & Download Free HD Movies & Series",
      logo: "https://i.ibb.co/xKTs0n1x/18101784373776709.jpg",
      favicon: "https://i.ibb.co/xKTs0n1x/18101784373776709.jpg",
      downloadApiUrl: "https://02moviedownloader.top/",
      footerText: "Movies.snishad is a premier open-source entertainment index. All media files are indexed from verified third-party cloud streaming servers.",
      itemsPerPage: 20,
    },
    create: {
      id: "1",
      siteName: "Movies.snishad",
      tagline: "Watch & Download Free HD Movies & Series",
      logo: "https://i.ibb.co/xKTs0n1x/18101784373776709.jpg",
      favicon: "https://i.ibb.co/xKTs0n1x/18101784373776709.jpg",
      downloadApiUrl: "https://02moviedownloader.top/",
      footerText: "Movies.snishad is a premier open-source entertainment index. All media files are indexed from verified third-party cloud streaming servers.",
      itemsPerPage: 20,
    },
  });
  console.log("Site settings seeded.");

  // 3. Seed Standard Cinema Genres
  const genresData = [
    { name: "Action", slug: "action", color: "#e50914", sortOrder: 1 },
    { name: "Drama", slug: "drama", color: "#3b82f6", sortOrder: 2 },
    { name: "Comedy", slug: "comedy", color: "#f59e0b", sortOrder: 3 },
    { name: "Sci-Fi", slug: "sci-fi", color: "#8b5cf6", sortOrder: 4 },
    { name: "Horror", slug: "horror", color: "#ef4444", sortOrder: 5 },
    { name: "Thriller", slug: "thriller", color: "#ec4899", sortOrder: 6 },
    { name: "Romance", slug: "romance", color: "#10b981", sortOrder: 7 },
    { name: "Animation", slug: "animation", color: "#6366f1", sortOrder: 8 },
  ];

  for (const g of genresData) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: g,
      create: g,
    });
  }
  console.log("Standard genres seeded:", genresData.length);
  console.log("Database initialized cleanly. No dummy movie data present.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

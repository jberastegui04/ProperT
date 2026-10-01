import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete existing development data so this script
  // can safely be run again.
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      name: "Summit Property Management",
    },
  });

  const lakeside = await prisma.property.create({
    data: {
      name: "Lakeside Apartments",
      addressLine: "1200 Lakeview Drive",
      city: "Orlando",
      state: "FL",
      zipCode: "32801",
      organizationId: organization.id,

      units: {
        create: [
          {
            unitNumber: "101",
            bedrooms: 1,
            bathrooms: 1,
            squareFeet: 720,
            monthlyRent: 1450,
            status: "OCCUPIED",
          },
          {
            unitNumber: "102",
            bedrooms: 2,
            bathrooms: 2,
            squareFeet: 1050,
            monthlyRent: 1950,
            status: "OCCUPIED",
          },
          {
            unitNumber: "103",
            bedrooms: 2,
            bathrooms: 2,
            squareFeet: 1025,
            monthlyRent: 1900,
            status: "VACANT",
          },
        ],
      },
    },
  });

  const downtown = await prisma.property.create({
    data: {
      name: "Downtown Lofts",
      addressLine: "450 Central Avenue",
      city: "Orlando",
      state: "FL",
      zipCode: "32801",
      organizationId: organization.id,

      units: {
        create: [
          {
            unitNumber: "201",
            bedrooms: 1,
            bathrooms: 1,
            squareFeet: 680,
            monthlyRent: 1650,
            status: "OCCUPIED",
          },
          {
            unitNumber: "202",
            bedrooms: 1,
            bathrooms: 1,
            squareFeet: 700,
            monthlyRent: 1700,
            status: "OCCUPIED",
          },
          {
            unitNumber: "203",
            bedrooms: 2,
            bathrooms: 2,
            squareFeet: 1100,
            monthlyRent: 2250,
            status: "VACANT",
          },
        ],
      },
    },
  });

  const sarah = await prisma.tenant.create({
    data: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      phone: "407-555-0101",
      organizationId: organization.id,
    },
  });

  const marcus = await prisma.tenant.create({
    data: {
      firstName: "Marcus",
      lastName: "Lee",
      email: "marcus@example.com",
      phone: "407-555-0102",
      organizationId: organization.id,
    },
  });

  const emily = await prisma.tenant.create({
    data: {
      firstName: "Emily",
      lastName: "Rivera",
      email: "emily@example.com",
      phone: "407-555-0103",
      organizationId: organization.id,
    },
  });

  const daniel = await prisma.tenant.create({
    data: {
      firstName: "Daniel",
      lastName: "Brooks",
      email: "daniel@example.com",
      phone: "407-555-0104",
      organizationId: organization.id,
    },
  });

  const occupiedUnits = await prisma.unit.findMany({
    where: {
      status: "OCCUPIED",
    },
    orderBy: {
      unitNumber: "asc",
    },
  });

  const tenants = [sarah, marcus, emily, daniel];

  for (let i = 0; i < occupiedUnits.length; i++) {
    await prisma.lease.create({
      data: {
        unitId: occupiedUnits[i].id,
        tenantId: tenants[i].id,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
        monthlyRent: occupiedUnits[i].monthlyRent,
        status: "ACTIVE",
      },
    });
  }

  console.log("✅ ProperT database seeded!");
  console.log(`Created: ${lakeside.name}`);
  console.log(`Created: ${downtown.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
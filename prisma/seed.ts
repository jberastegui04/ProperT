import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting ProperT seed...");

  // -------------------------------------------------------
  // CLEAR OLD DEVELOPMENT DATA
  // -------------------------------------------------------

  await prisma.notification.deleteMany();
  await prisma.workOrderMessage.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.workOrderCompletion.deleteMany();
  await prisma.workOrderAssignment.deleteMany();
  await prisma.workOrderAiTriage.deleteMany();
  await prisma.workOrder.deleteMany();

  await prisma.inspectionSection.deleteMany();
  await prisma.inspection.deleteMany();

  await prisma.lease.deleteMany();

  await prisma.organizationTechnician.deleteMany();

  await prisma.technicianProfile.deleteMany();
  await prisma.tenantProfile.deleteMany();

  await prisma.organizationMembership.deleteMany();

  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.organization.deleteMany();

  await prisma.user.deleteMany();

  // -------------------------------------------------------
  // ORGANIZATION
  // -------------------------------------------------------

  const organization = await prisma.organization.create({
    data: {
      name: "Summit Property Management",
    },
  });

  // -------------------------------------------------------
  // MANAGERS
  // -------------------------------------------------------

  const managerOne = await prisma.user.create({
    data: {
      email: "alex.manager@propert.dev",
      firstName: "Alex",
      lastName: "Morgan",
      phone: "407-555-0100",
      role: "MANAGER",
    },
  });

  const managerTwo = await prisma.user.create({
    data: {
      email: "jordan.manager@propert.dev",
      firstName: "Jordan",
      lastName: "Lee",
      phone: "407-555-0101",
      role: "MANAGER",
    },
  });

  await prisma.organizationMembership.createMany({
    data: [
      {
        organizationId: organization.id,
        userId: managerOne.id,
        isAdmin: true,
      },
      {
        organizationId: organization.id,
        userId: managerTwo.id,
        isAdmin: false,
      },
    ],
  });

  // -------------------------------------------------------
  // TENANTS
  // -------------------------------------------------------

  const sarahUser = await prisma.user.create({
    data: {
      email: "sarah.tenant@propert.dev",
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "407-555-0201",
      role: "TENANT",
    },
  });

  const marcusUser = await prisma.user.create({
    data: {
      email: "marcus.tenant@propert.dev",
      firstName: "Marcus",
      lastName: "Lee",
      phone: "407-555-0202",
      role: "TENANT",
    },
  });

  const sarah = await prisma.tenantProfile.create({
    data: {
      userId: sarahUser.id,
    },
  });

  const marcus = await prisma.tenantProfile.create({
    data: {
      userId: marcusUser.id,
    },
  });

  // -------------------------------------------------------
  // TECHNICIANS
  // -------------------------------------------------------

  const mikeUser = await prisma.user.create({
    data: {
      email: "mike.plumber@propert.dev",
      firstName: "Mike",
      lastName: "Torres",
      phone: "407-555-0301",
      role: "TECHNICIAN",
    },
  });

  const davidUser = await prisma.user.create({
    data: {
      email: "david.hvac@propert.dev",
      firstName: "David",
      lastName: "Chen",
      phone: "407-555-0302",
      role: "TECHNICIAN",
    },
  });

  const mike = await prisma.technicianProfile.create({
    data: {
      userId: mikeUser.id,
      companyName: "Torres Plumbing Services",
      primaryTrade: "Plumbing",
    },
  });

  const david = await prisma.technicianProfile.create({
    data: {
      userId: davidUser.id,
      companyName: "Central Florida HVAC",
      primaryTrade: "HVAC",
    },
  });

  // Connect independent technicians to Summit Property Management.

  await prisma.organizationTechnician.createMany({
    data: [
      {
        organizationId: organization.id,
        technicianId: mike.id,
      },
      {
        organizationId: organization.id,
        technicianId: david.id,
      },
    ],
  });

  // -------------------------------------------------------
  // PROPERTIES
  // -------------------------------------------------------

  const lakeside = await prisma.property.create({
    data: {
      organizationId: organization.id,
      name: "Lakeside Apartments",
      type: "MULTI_FAMILY",
      addressLine: "1200 Lakeview Drive",
      city: "Orlando",
      state: "FL",
      zipCode: "32801",
    },
  });

  const oakStreet = await prisma.property.create({
    data: {
      organizationId: organization.id,
      name: "Oak Street House",
      type: "SINGLE_FAMILY",
      addressLine: "1421 Oak Street",
      city: "Orlando",
      state: "FL",
      zipCode: "32803",
    },
  });

  // -------------------------------------------------------
  // UNITS
  // -------------------------------------------------------

  const unit101 = await prisma.unit.create({
    data: {
      propertyId: lakeside.id,
      unitNumber: "101",
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1050,
      marketRentCents: 195000,
      status: "OCCUPIED",
    },
  });

  await prisma.unit.create({
    data: {
      propertyId: lakeside.id,
      unitNumber: "102",
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 720,
      marketRentCents: 155000,
      status: "VACANT",
    },
  });

  await prisma.unit.create({
    data: {
      propertyId: lakeside.id,
      unitNumber: "103",
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1100,
      marketRentCents: 205000,
      status: "VACANT",
    },
  });

  const oakHome = await prisma.unit.create({
    data: {
      propertyId: oakStreet.id,
      unitNumber: "Main Home",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1750,
      marketRentCents: 265000,
      status: "OCCUPIED",
    },
  });

  // -------------------------------------------------------
  // LEASES
  // -------------------------------------------------------

  const sarahLease = await prisma.lease.create({
    data: {
      unitId: unit101.id,
      tenantId: sarah.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      monthlyRentCents: 195000,
      securityDepositCents: 195000,
      status: "ACTIVE",
    },
  });

  const marcusLease = await prisma.lease.create({
    data: {
      unitId: oakHome.id,
      tenantId: marcus.id,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      monthlyRentCents: 265000,
      securityDepositCents: 265000,
      status: "ACTIVE",
    },
  });

  // -------------------------------------------------------
  // MOVE-IN INSPECTION
  // -------------------------------------------------------

  const moveInInspection = await prisma.inspection.create({
    data: {
      unitId: unit101.id,
      leaseId: sarahLease.id,
      createdById: managerOne.id,

      type: "MOVE_IN",
      status: "COMPLETED",

      notes: "Move-in inspection completed before tenant occupancy.",

      startedAt: new Date("2025-12-29T14:00:00"),
      completedAt: new Date("2025-12-29T15:15:00"),

      sections: {
        create: [
          {
            name: "Entry",
            sortOrder: 1,
            condition: "GOOD",
            completed: true,
            notes: "Minor paint wear near door frame.",
          },
          {
            name: "Living Room",
            sortOrder: 2,
            condition: "EXCELLENT",
            completed: true,
          },
          {
            name: "Kitchen",
            sortOrder: 3,
            condition: "GOOD",
            completed: true,
            notes: "Appliances functional. No visible water damage.",
          },
          {
            name: "Primary Bedroom",
            sortOrder: 4,
            condition: "EXCELLENT",
            completed: true,
          },
          {
            name: "Bathroom",
            sortOrder: 5,
            condition: "GOOD",
            completed: true,
          },
        ],
      },
    },
    include: {
      sections: true,
    },
  });

  const kitchenSection = moveInInspection.sections.find(
    (section) => section.name === "Kitchen",
  );

  if (!kitchenSection) {
    throw new Error("Kitchen inspection section was not created.");
  }

  // These are placeholder storage keys.
  // Later they'll point to real images in cloud storage.

  await prisma.photo.createMany({
    data: [
      {
        unitId: unit101.id,
        uploadedById: managerOne.id,
        inspectionId: moveInInspection.id,
        inspectionSectionId: kitchenSection.id,

        storageKey:
          "development/unit-101/move-in/kitchen-wide-angle.jpg",

        mimeType: "image/jpeg",
        context: "INSPECTION",
        roomLabel: "Kitchen",

        capturedAt: new Date("2025-12-29T14:32:00"),

        aiLabel: "Kitchen",
        aiObservation:
          "Kitchen appears generally well maintained with no obvious water damage.",
        aiConfidence: 0.94,
      },
      {
        unitId: unit101.id,
        uploadedById: managerOne.id,
        inspectionId: moveInInspection.id,
        inspectionSectionId: kitchenSection.id,

        storageKey:
          "development/unit-101/move-in/kitchen-sink.jpg",

        mimeType: "image/jpeg",
        context: "INSPECTION",
        roomLabel: "Kitchen Sink",

        capturedAt: new Date("2025-12-29T14:34:00"),

        aiLabel: "Kitchen Sink",
        aiObservation:
          "No visible leakage or cabinet water staining.",
        aiConfidence: 0.91,
      },
    ],
  });

  // -------------------------------------------------------
  // COMPLETED WORK ORDER
  // Kitchen sink leak submitted by Sarah.
  // -------------------------------------------------------

  const plumbingWorkOrder = await prisma.workOrder.create({
    data: {
      unitId: unit101.id,
      leaseId: sarahLease.id,
      submittedById: sarahUser.id,

      title: "Kitchen sink leak",

      description:
        "Water is leaking underneath my kitchen sink and the bottom of the cabinet is getting wet.",

      status: "COMPLETED",
      category: "PLUMBING",
      priority: "HIGH",

      permissionToEnter: true,
    },
  });

  // Tenant submission photo.

  await prisma.photo.create({
    data: {
      unitId: unit101.id,
      uploadedById: sarahUser.id,
      workOrderId: plumbingWorkOrder.id,

      storageKey:
        "development/unit-101/work-orders/sink-leak-submission.jpg",

      mimeType: "image/jpeg",
      context: "WORK_ORDER_SUBMISSION",
      roomLabel: "Kitchen Sink",

      aiLabel: "Plumbing Leak",
      aiObservation:
        "Visible moisture beneath sink near drain plumbing.",
      aiConfidence: 0.89,
    },
  });

  // AI analyzes the request.

  await prisma.workOrderAiTriage.create({
    data: {
      workOrderId: plumbingWorkOrder.id,

      category: "PLUMBING",
      priority: "HIGH",

      summary:
        "Possible active drain leak beneath the kitchen sink.",

      suggestedTrade: "Plumber",

      possibleCause:
        "Possible loose drain connection or leaking P-trap.",

      safetyConcern:
        "Continued moisture may damage cabinetry or flooring.",

      suggestedNextStep:
        "Inspect drain connections and shut off sink use if leakage increases.",

      confidence: 0.89,

      reviewStatus: "APPROVED",
      reviewedById: managerOne.id,
      reviewedAt: new Date("2026-07-14T09:15:00"),
    },
  });

  // Manager assigns Mike.

  await prisma.workOrderAssignment.create({
    data: {
      workOrderId: plumbingWorkOrder.id,
      technicianId: mike.id,
      assignedById: managerOne.id,

      assignedAt: new Date("2026-07-14T09:20:00"),
      acceptedAt: new Date("2026-07-14T09:28:00"),
      startedAt: new Date("2026-07-14T13:10:00"),
      completedAt: new Date("2026-07-14T13:55:00"),

      isActive: false,
    },
  });

  // Work-order conversation.

  await prisma.workOrderMessage.createMany({
    data: [
      {
        workOrderId: plumbingWorkOrder.id,
        authorId: sarahUser.id,
        body: "The leak seems to be getting worse.",
        createdAt: new Date("2026-07-14T09:05:00"),
      },
      {
        workOrderId: plumbingWorkOrder.id,
        authorId: managerOne.id,
        body: "Thanks. I'm assigning a plumber now.",
        createdAt: new Date("2026-07-14T09:18:00"),
      },
      {
        workOrderId: plumbingWorkOrder.id,
        authorId: mikeUser.id,
        body: "I can arrive around 1 PM.",
        createdAt: new Date("2026-07-14T09:35:00"),
      },
    ],
  });

  // -------------------------------------------------------
  // TECHNICIAN COMPLETION
  // -------------------------------------------------------

  const plumbingCompletion =
    await prisma.workOrderCompletion.create({
      data: {
        workOrderId: plumbingWorkOrder.id,
        technicianId: mike.id,

        repairNotes:
          "Replaced leaking P-trap gasket and tightened drain connections. Tested sink for ten minutes with no additional leakage.",

        materialsUsed:
          "1 replacement P-trap gasket, plumber's tape",

        laborMinutes: 45,

        submittedAt: new Date("2026-07-14T13:55:00"),

        managerApprovedAt: new Date("2026-07-14T14:20:00"),
        managerApprovedById: managerOne.id,
      },
    });

  // Before / after repair evidence.

  await prisma.photo.createMany({
    data: [
      {
        unitId: unit101.id,
        uploadedById: mikeUser.id,
        workOrderId: plumbingWorkOrder.id,
        completionId: plumbingCompletion.id,

        storageKey:
          "development/unit-101/work-orders/sink-before.jpg",

        mimeType: "image/jpeg",
        context: "REPAIR_BEFORE",
        roomLabel: "Kitchen Sink",

        aiLabel: "Leak Before Repair",
        aiObservation:
          "Moisture visible near drain connection beneath sink.",
        aiConfidence: 0.92,
      },
      {
        unitId: unit101.id,
        uploadedById: mikeUser.id,
        workOrderId: plumbingWorkOrder.id,
        completionId: plumbingCompletion.id,

        storageKey:
          "development/unit-101/work-orders/sink-after.jpg",

        mimeType: "image/jpeg",
        context: "REPAIR_AFTER",
        roomLabel: "Kitchen Sink",

        aiLabel: "Repair Completed",
        aiObservation:
          "Drain assembly appears secured with no visible active leakage.",
        aiConfidence: 0.9,
      },
    ],
  });

  // -------------------------------------------------------
  // SECOND WORK ORDER
  // HVAC problem at the single-family home.
  // -------------------------------------------------------

  const hvacWorkOrder = await prisma.workOrder.create({
    data: {
      unitId: oakHome.id,
      leaseId: marcusLease.id,
      submittedById: marcusUser.id,

      title: "Air conditioner not cooling",

      description:
        "The AC has been running all afternoon but the house is still very warm.",

      status: "IN_PROGRESS",
      category: "HVAC",
      priority: "HIGH",

      permissionToEnter: false,
    },
  });

  await prisma.workOrderAiTriage.create({
    data: {
      workOrderId: hvacWorkOrder.id,

      category: "HVAC",
      priority: "HIGH",

      summary:
        "Air-conditioning system appears unable to maintain indoor temperature.",

      suggestedTrade: "HVAC Technician",

      possibleCause:
        "Possible airflow, thermostat, refrigerant, or compressor issue.",

      safetyConcern:
        "Extended loss of cooling may become hazardous during high outdoor temperatures.",

      suggestedNextStep:
        "Schedule HVAC diagnostic inspection.",

      confidence: 0.82,

      reviewStatus: "MODIFIED",
      reviewedById: managerTwo.id,
      reviewedAt: new Date("2026-09-29T16:10:00"),
    },
  });

  await prisma.workOrderAssignment.create({
    data: {
      workOrderId: hvacWorkOrder.id,
      technicianId: david.id,
      assignedById: managerTwo.id,

      assignedAt: new Date("2026-09-29T16:15:00"),
      acceptedAt: new Date("2026-09-29T16:22:00"),
      startedAt: new Date("2026-09-30T10:00:00"),

      isActive: true,
    },
  });

  await prisma.workOrderMessage.createMany({
    data: [
      {
        workOrderId: hvacWorkOrder.id,
        authorId: marcusUser.id,
        body: "The thermostat is set to 72 but the house is still around 80 degrees.",
      },
      {
        workOrderId: hvacWorkOrder.id,
        authorId: davidUser.id,
        body: "I'm checking the outdoor unit and airflow first.",
      },
    ],
  });

  // -------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------

  await prisma.notification.createMany({
    data: [
      {
        userId: managerOne.id,
        workOrderId: plumbingWorkOrder.id,
        title: "Repair completed",
        body: "Mike Torres completed the kitchen sink repair at Unit 101.",
        readAt: new Date(),
      },
      {
        userId: davidUser.id,
        workOrderId: hvacWorkOrder.id,
        title: "Work order assigned",
        body: "You were assigned an HVAC work order at Oak Street House.",
        readAt: new Date(),
      },
      {
        userId: marcusUser.id,
        workOrderId: hvacWorkOrder.id,
        title: "Technician assigned",
        body: "David Chen has been assigned to your air-conditioning request.",
      },
    ],
  });

  // -------------------------------------------------------
  // FINISHED
  // -------------------------------------------------------

  console.log("");
  console.log("✅ ProperT database seeded successfully.");
  console.log("");
  console.log("Organization:");
  console.log("  Summit Property Management");
  console.log("");
  console.log("Managers:");
  console.log("  Alex Morgan");
  console.log("  Jordan Lee");
  console.log("");
  console.log("Tenants:");
  console.log("  Sarah Johnson → Lakeside Apartments #101");
  console.log("  Marcus Lee → Oak Street House");
  console.log("");
  console.log("Technicians:");
  console.log("  Mike Torres → Plumbing");
  console.log("  David Chen → HVAC");
  console.log("");
  console.log("Properties:");
  console.log("  Lakeside Apartments → Units 101, 102, 103");
  console.log("  Oak Street House → Main Home");
  console.log("");
  console.log("Seed includes:");
  console.log("  ✓ leases");
  console.log("  ✓ move-in inspection");
  console.log("  ✓ inspection photos");
  console.log("  ✓ AI photo observations");
  console.log("  ✓ AI work-order triage");
  console.log("  ✓ technician assignments");
  console.log("  ✓ work-order messages");
  console.log("  ✓ completed repair");
  console.log("  ✓ before/after repair photos");
  console.log("  ✓ notifications");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
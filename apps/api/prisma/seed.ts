import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const company = await prisma.company.create({
    data: {
      name: "Skyline Builders & Interiors",
      gstNumber: "29ABCDE1234F1Z5",
      users: {
        create: [
          { email: "owner@skyline.dev", name: "Asha Rao", passwordHash, role: "OWNER" },
          { email: "engineer@skyline.dev", name: "Vikram Shah", passwordHash, role: "SITE_ENGINEER" },
          { email: "architect@skyline.dev", name: "Meera Iyer", passwordHash, role: "ARCHITECT" },
        ],
      },
    },
    include: { users: true },
  });

  const siteEngineerUser = company.users.find((u) => u.email === "engineer@skyline.dev")!;
  const architectUser = company.users.find((u) => u.email === "architect@skyline.dev")!;

  const siteEngineer = await prisma.employee.create({
    data: {
      companyId: company.id,
      userId: siteEngineerUser.id,
      employeeCode: "EMP-001",
      designation: "Site Engineer",
      department: "Execution",
      dateOfJoining: new Date("2024-01-15"),
    },
  });

  await prisma.employee.create({
    data: {
      companyId: company.id,
      userId: architectUser.id,
      employeeCode: "EMP-002",
      designation: "Architect",
      department: "Design",
      dateOfJoining: new Date("2023-08-01"),
    },
  });

  const client = await prisma.client.create({
    data: {
      companyId: company.id,
      name: "ABC Builders Pvt Ltd",
      email: "contact@abcbuilders.example",
      phone: "+91-9876543210",
      organization: "ABC Builders",
      pipelineStage: "WON",
      estimatedValue: 45000000,
    },
  });

  const project = await prisma.project.create({
    data: {
      companyId: company.id,
      clientId: client.id,
      name: "Sky Heights Residential Tower",
      code: "SKY-001",
      status: "ACTIVE",
      budget: 45000000,
      startDate: new Date("2025-02-01"),
      targetEndDate: new Date("2027-06-30"),
      address: "Plot 12, Whitefield, Bengaluru",
      geofence: {
        create: {
          latitude: 12.9698,
          longitude: 77.75,
          radiusMeters: 150,
          softToleranceMeters: 100,
        },
      },
    },
  });

  await prisma.projectAssignment.create({
    data: { projectId: project.id, employeeId: siteEngineer.id, roleOnSite: "Site Engineer" },
  });

  await prisma.task.createMany({
    data: [
      { projectId: project.id, title: "Foundation excavation", status: "DONE", priority: "HIGH" },
      { projectId: project.id, title: "Column reinforcement — Tower A", status: "IN_PROGRESS", priority: "HIGH" },
      { projectId: project.id, title: "MEP coordination drawing review", status: "TODO", priority: "MEDIUM" },
    ],
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete.");
  // eslint-disable-next-line no-console
  console.log("Login with owner@skyline.dev / Password123!");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

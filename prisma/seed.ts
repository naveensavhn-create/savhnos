import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_COMPANY_NAME = "Skyline Builders & Interiors";
const DEMO_PASSWORD = "Demo@12345";

/** Small deterministic jitter so seeded clock-ins land inside the project geofence but aren't all on the exact same point. */
function jitter(base: number, meters: number) {
  return base + (Math.random() - 0.5) * (meters / 111_000);
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

async function main() {
  // Re-runnable: wipe any previous demo company and rebuild fresh. DrawingReview.reviewerId
  // has no cascading delete rule (it's a required FK to User), so it must be cleared explicitly
  // before the company (and its users) can be deleted — everything else cascades.
  const existing = await prisma.company.findFirst({
    where: { name: DEMO_COMPANY_NAME },
    include: { users: { select: { id: true } } },
  });
  if (existing) {
    await prisma.drawingReview.deleteMany({ where: { reviewerId: { in: existing.users.map((u) => u.id) } } });
    await prisma.company.delete({ where: { id: existing.id } });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const company = await prisma.company.create({
    data: {
      name: DEMO_COMPANY_NAME,
      gstNumber: "29ABCDE1234F1Z5",
      branches: {
        create: [
          { name: "HQ — Bengaluru", address: "12th Cross, Indiranagar", city: "Bengaluru" },
          { name: "Site Office — Whitefield", address: "Plot 12, Whitefield", city: "Bengaluru" },
        ],
      },
      users: {
        create: [
          { email: "owner@savhnos.dev", name: "Asha Rao", passwordHash, role: "OWNER" },
          { email: "admin@savhnos.dev", name: "Ramesh Iyer", passwordHash, role: "SUPER_ADMIN" },
          { email: "hr@savhnos.dev", name: "Priya Nair", passwordHash, role: "HR" },
          { email: "architect@savhnos.dev", name: "Meera Iyer", passwordHash, role: "ARCHITECT" },
          { email: "projectengineer@savhnos.dev", name: "Arjun Mehta", passwordHash, role: "PROJECT_ENGINEER" },
          { email: "siteengineer@savhnos.dev", name: "Vikram Shah", passwordHash, role: "SITE_ENGINEER" },
          { email: "interiordesigner@savhnos.dev", name: "Kavya Menon", passwordHash, role: "INTERIOR_DESIGNER" },
          { email: "draftingengineer@savhnos.dev", name: "Rahul Verma", passwordHash, role: "DRAFTING_ENGINEER" },
          { email: "accountant@savhnos.dev", name: "Sunita Joshi", passwordHash, role: "ACCOUNTANT" },
          { email: "qcengineer@savhnos.dev", name: "Farhan Sheikh", passwordHash, role: "QC_ENGINEER" },
          { email: "employee@savhnos.dev", name: "Divya Pillai", passwordHash, role: "EMPLOYEE" },
          { email: "client@savhnos.dev", name: "Karthik Reddy", passwordHash, role: "CLIENT" },
        ],
      },
    },
    include: { users: true, branches: true },
  });

  const byEmail = (email: string) => company.users.find((u) => u.email === email)!;
  const hq = company.branches.find((b) => b.name.startsWith("HQ"))!;
  const siteOffice = company.branches.find((b) => b.name.startsWith("Site Office"))!;

  const staffProfiles: Array<{
    email: string;
    code: string;
    designation: string;
    department: string;
    branchId: string;
    monthlySalary: number;
    dateOfJoining: string;
  }> = [
    { email: "owner@savhnos.dev", code: "EMP-001", designation: "Managing Director", department: "Leadership", branchId: hq.id, monthlySalary: 350000, dateOfJoining: "2019-04-01" },
    { email: "admin@savhnos.dev", code: "EMP-002", designation: "Operations Head", department: "Administration", branchId: hq.id, monthlySalary: 220000, dateOfJoining: "2020-06-15" },
    { email: "hr@savhnos.dev", code: "EMP-003", designation: "HR Manager", department: "Human Resources", branchId: hq.id, monthlySalary: 95000, dateOfJoining: "2021-01-11" },
    { email: "architect@savhnos.dev", code: "EMP-004", designation: "Principal Architect", department: "Design", branchId: hq.id, monthlySalary: 140000, dateOfJoining: "2020-08-01" },
    { email: "projectengineer@savhnos.dev", code: "EMP-005", designation: "Project Engineer", department: "Execution", branchId: siteOffice.id, monthlySalary: 90000, dateOfJoining: "2022-02-14" },
    { email: "siteengineer@savhnos.dev", code: "EMP-006", designation: "Site Engineer", department: "Execution", branchId: siteOffice.id, monthlySalary: 65000, dateOfJoining: "2023-01-15" },
    { email: "interiordesigner@savhnos.dev", code: "EMP-007", designation: "Interior Designer", department: "Design", branchId: hq.id, monthlySalary: 78000, dateOfJoining: "2022-09-01" },
    { email: "draftingengineer@savhnos.dev", code: "EMP-008", designation: "Drafting Engineer", department: "Design", branchId: hq.id, monthlySalary: 55000, dateOfJoining: "2023-05-20" },
    { email: "accountant@savhnos.dev", code: "EMP-009", designation: "Senior Accountant", department: "Finance", branchId: hq.id, monthlySalary: 72000, dateOfJoining: "2021-11-03" },
    { email: "qcengineer@savhnos.dev", code: "EMP-010", designation: "QC Engineer", department: "Quality", branchId: siteOffice.id, monthlySalary: 68000, dateOfJoining: "2022-07-18" },
    { email: "employee@savhnos.dev", code: "EMP-011", designation: "Office Assistant", department: "Administration", branchId: hq.id, monthlySalary: 32000, dateOfJoining: "2023-10-02" },
  ];

  const employees: Record<string, Awaited<ReturnType<typeof prisma.employee.create>>> = {};
  for (const p of staffProfiles) {
    employees[p.email] = await prisma.employee.create({
      data: {
        companyId: company.id,
        userId: byEmail(p.email).id,
        branchId: p.branchId,
        employeeCode: p.code,
        designation: p.designation,
        department: p.department,
        dateOfJoining: new Date(p.dateOfJoining),
        monthlySalary: p.monthlySalary,
      },
    });
  }

  // ── Clients / CRM pipeline ────────────────────────────────────────────
  const abcBuilders = await prisma.client.create({
    data: {
      companyId: company.id,
      name: "ABC Builders Pvt Ltd",
      email: "contact@abcbuilders.example",
      phone: "+91-9876543210",
      organization: "ABC Builders",
      pipelineStage: "WON",
      estimatedValue: 45000000,
      portalUserId: byEmail("client@savhnos.dev").id,
    },
  });

  const coastalDevelopers = await prisma.client.create({
    data: {
      companyId: company.id,
      name: "Coastal Developers LLP",
      email: "projects@coastaldevelopers.example",
      phone: "+91-9845012233",
      organization: "Coastal Developers",
      pipelineStage: "WON",
      estimatedValue: 62000000,
    },
  });

  const meridianRetail = await prisma.client.create({
    data: {
      companyId: company.id,
      name: "Meridian Retail Group",
      email: "facilities@meridianretail.example",
      phone: "+91-9900112244",
      organization: "Meridian Retail",
      pipelineStage: "WON",
      estimatedValue: 9500000,
    },
  });

  await prisma.client.create({
    data: {
      companyId: company.id,
      name: "Horizon Realty",
      email: "info@horizonrealty.example",
      phone: "+91-9911223344",
      organization: "Horizon Realty",
      pipelineStage: "PROPOSAL",
      estimatedValue: 28000000,
    },
  });

  await prisma.client.create({
    data: {
      companyId: company.id,
      name: "Vertex Infra",
      email: "hello@vertexinfra.example",
      pipelineStage: "LOST",
      estimatedValue: 15000000,
    },
  });

  // ── Projects ─────────────────────────────────────────────────────────
  const skyHeights = await prisma.project.create({
    data: {
      companyId: company.id,
      clientId: abcBuilders.id,
      name: "Sky Heights Residential Tower",
      code: "SKY-001",
      status: "ACTIVE",
      budget: 45000000,
      startDate: new Date("2025-02-01"),
      targetEndDate: new Date("2027-06-30"),
      address: "Plot 12, Whitefield, Bengaluru",
      geofence: {
        create: { latitude: 12.9698, longitude: 77.75, radiusMeters: 150, softToleranceMeters: 100 },
      },
    },
  });

  const coastalVillas = await prisma.project.create({
    data: {
      companyId: company.id,
      clientId: coastalDevelopers.id,
      name: "Coastal Villas Phase 2",
      code: "CVP-002",
      status: "DELAYED",
      budget: 62000000,
      startDate: new Date("2024-09-01"),
      targetEndDate: new Date("2026-12-31"),
      address: "ECR Road, Chennai",
      geofence: {
        create: { latitude: 12.8406, longitude: 80.2274, radiusMeters: 200, softToleranceMeters: 100 },
      },
    },
  });

  const boutiqueInteriors = await prisma.project.create({
    data: {
      companyId: company.id,
      clientId: meridianRetail.id,
      name: "Whitefield Boutique Interiors",
      code: "WBI-003",
      status: "COMPLETED",
      budget: 9500000,
      startDate: new Date("2024-01-10"),
      targetEndDate: new Date("2024-08-15"),
      address: "Phoenix Marketcity, Whitefield, Bengaluru",
    },
  });

  await prisma.projectAssignment.createMany({
    data: [
      { projectId: skyHeights.id, employeeId: employees["projectengineer@savhnos.dev"].id, roleOnSite: "Project Lead" },
      { projectId: skyHeights.id, employeeId: employees["siteengineer@savhnos.dev"].id, roleOnSite: "Site Engineer" },
      { projectId: skyHeights.id, employeeId: employees["qcengineer@savhnos.dev"].id, roleOnSite: "QC Inspector" },
      { projectId: skyHeights.id, employeeId: employees["draftingengineer@savhnos.dev"].id, roleOnSite: "Drafting Support" },
      { projectId: coastalVillas.id, employeeId: employees["siteengineer@savhnos.dev"].id, roleOnSite: "Site Engineer" },
      { projectId: coastalVillas.id, employeeId: employees["architect@savhnos.dev"].id, roleOnSite: "Design Lead" },
      { projectId: boutiqueInteriors.id, employeeId: employees["interiordesigner@savhnos.dev"].id, roleOnSite: "Interior Lead" },
    ],
  });

  await prisma.task.createMany({
    data: [
      { projectId: skyHeights.id, title: "Foundation excavation", status: "DONE", priority: "HIGH", assigneeId: employees["siteengineer@savhnos.dev"].id },
      { projectId: skyHeights.id, title: "Column reinforcement — Tower A", status: "IN_PROGRESS", priority: "HIGH", assigneeId: employees["siteengineer@savhnos.dev"].id },
      { projectId: skyHeights.id, title: "MEP coordination drawing review", status: "TODO", priority: "MEDIUM", assigneeId: employees["draftingengineer@savhnos.dev"].id },
      { projectId: skyHeights.id, title: "QC audit — Basement waterproofing", status: "IN_REVIEW", priority: "URGENT", assigneeId: employees["qcengineer@savhnos.dev"].id },
      { projectId: coastalVillas.id, title: "Villa Type A elevation finalize", status: "IN_PROGRESS", priority: "HIGH", assigneeId: employees["architect@savhnos.dev"].id },
      { projectId: coastalVillas.id, title: "Site grading — Block C", status: "BLOCKED", priority: "URGENT", assigneeId: employees["siteengineer@savhnos.dev"].id },
      { projectId: boutiqueInteriors.id, title: "Final handover walkthrough", status: "DONE", priority: "MEDIUM", assigneeId: employees["interiordesigner@savhnos.dev"].id },
    ],
  });

  // ── Attendance (today, so the dashboard + attendance page look live) ──
  const geo = { latitude: 12.9698, longitude: 77.75 };
  await prisma.attendance.createMany({
    data: [
      {
        employeeId: employees["siteengineer@savhnos.dev"].id,
        projectId: skyHeights.id,
        method: "GEOFENCE",
        clockInAt: hoursAgo(3),
        clockInLat: jitter(geo.latitude, 40),
        clockInLng: jitter(geo.longitude, 40),
        distanceMeters: 42,
        withinGeofence: true,
      },
      {
        employeeId: employees["projectengineer@savhnos.dev"].id,
        projectId: skyHeights.id,
        method: "GEOFENCE",
        clockInAt: hoursAgo(6),
        clockOutAt: hoursAgo(1),
        clockInLat: jitter(geo.latitude, 30),
        clockInLng: jitter(geo.longitude, 30),
        clockOutLat: jitter(geo.latitude, 30),
        clockOutLng: jitter(geo.longitude, 30),
        distanceMeters: 28,
        withinGeofence: true,
      },
      {
        employeeId: employees["qcengineer@savhnos.dev"].id,
        projectId: skyHeights.id,
        method: "ADMIN_OVERRIDE",
        clockInAt: hoursAgo(2),
        withinGeofence: true,
        overriddenByAdmin: true,
        notes: "Vehicle breakdown — clocked in by HR override",
      },
      {
        employeeId: employees["draftingengineer@savhnos.dev"].id,
        method: "OFFICE_WIFI",
        clockInAt: hoursAgo(4),
        withinGeofence: true,
      },
      {
        employeeId: employees["hr@savhnos.dev"].id,
        method: "OFFICE_WIFI",
        clockInAt: hoursAgo(5),
        clockOutAt: hoursAgo(0.5),
        withinGeofence: true,
      },
      {
        employeeId: employees["accountant@savhnos.dev"].id,
        method: "OFFICE_WIFI",
        clockInAt: hoursAgo(4.5),
        withinGeofence: true,
      },
    ],
  });

  // ── Drawings + approval workflow ───────────────────────────────────────
  const structuralGA = await prisma.drawing.create({
    data: { projectId: skyHeights.id, title: "Structural GA — Tower A", discipline: "Structural" },
  });
  await prisma.drawingRevision.create({
    data: {
      drawingId: structuralGA.id,
      versionLabel: "Rev A",
      fileUrl: "https://files.savhnos.dev/demo/structural-tower-a-rev-a.pdf",
      fileType: "application/pdf",
      status: "SUPERSEDED",
      uploadedById: employees["draftingengineer@savhnos.dev"].userId,
    },
  });
  const revB = await prisma.drawingRevision.create({
    data: {
      drawingId: structuralGA.id,
      versionLabel: "Rev B",
      fileUrl: "https://files.savhnos.dev/demo/structural-tower-a-rev-b.pdf",
      fileType: "application/pdf",
      status: "APPROVED",
      uploadedById: employees["draftingengineer@savhnos.dev"].userId,
    },
  });
  await prisma.drawingReview.create({
    data: {
      drawingRevisionId: revB.id,
      reviewerId: byEmail("projectengineer@savhnos.dev").id,
      decision: "APPROVED",
      comments: "Reinforcement detailing checks out. Approved for construction.",
    },
  });
  await prisma.drawingRevision.create({
    data: {
      drawingId: structuralGA.id,
      versionLabel: "Rev C",
      fileUrl: "https://files.savhnos.dev/demo/structural-tower-a-rev-c.pdf",
      fileType: "application/pdf",
      status: "IN_REVIEW",
      uploadedById: employees["draftingengineer@savhnos.dev"].userId,
    },
  });

  const mepLayout = await prisma.drawing.create({
    data: { projectId: skyHeights.id, title: "MEP Layout — Basement", discipline: "MEP" },
  });
  await prisma.drawingRevision.create({
    data: {
      drawingId: mepLayout.id,
      versionLabel: "Rev A",
      fileUrl: "https://files.savhnos.dev/demo/mep-basement-rev-a.pdf",
      fileType: "application/pdf",
      status: "IN_REVIEW",
      uploadedById: employees["draftingengineer@savhnos.dev"].userId,
    },
  });

  const villaElevation = await prisma.drawing.create({
    data: { projectId: coastalVillas.id, title: "Villa Elevation — Type A", discipline: "Architecture" },
  });
  const villaRevA = await prisma.drawingRevision.create({
    data: {
      drawingId: villaElevation.id,
      versionLabel: "Rev A",
      fileUrl: "https://files.savhnos.dev/demo/villa-elevation-type-a-rev-a.pdf",
      fileType: "application/pdf",
      status: "APPROVED",
      uploadedById: employees["architect@savhnos.dev"].userId,
    },
  });
  await prisma.drawingReview.create({
    data: {
      drawingRevisionId: villaRevA.id,
      reviewerId: byEmail("qcengineer@savhnos.dev").id,
      decision: "APPROVED",
      comments: "Elevation matches approved massing study.",
    },
  });

  const retailLayout = await prisma.drawing.create({
    data: { projectId: boutiqueInteriors.id, title: "Interior Layout — Retail Unit", discipline: "Architecture" },
  });
  const retailRevA = await prisma.drawingRevision.create({
    data: {
      drawingId: retailLayout.id,
      versionLabel: "Rev A",
      fileUrl: "https://files.savhnos.dev/demo/retail-unit-layout-rev-a.pdf",
      fileType: "application/pdf",
      status: "APPROVED",
      uploadedById: employees["interiordesigner@savhnos.dev"].userId,
    },
  });
  await prisma.drawingReview.create({
    data: {
      drawingRevisionId: retailRevA.id,
      reviewerId: byEmail("projectengineer@savhnos.dev").id,
      decision: "APPROVED",
      comments: "Final layout signed off for handover.",
    },
  });

  // ── Accounting ──────────────────────────────────────────────────────
  await prisma.invoice.createMany({
    data: [
      { companyId: company.id, projectId: skyHeights.id, clientId: abcBuilders.id, invoiceNumber: "INV-2026-001", amount: 12000000, taxAmount: 2160000, status: "PAID", issuedAt: new Date("2026-01-15") },
      { companyId: company.id, projectId: skyHeights.id, clientId: abcBuilders.id, invoiceNumber: "INV-2026-002", amount: 8500000, taxAmount: 1530000, status: "SENT", dueDate: new Date("2026-08-10") },
      { companyId: company.id, projectId: coastalVillas.id, clientId: coastalDevelopers.id, invoiceNumber: "INV-2026-003", amount: 15000000, taxAmount: 2700000, status: "PARTIALLY_PAID", dueDate: new Date("2026-07-30") },
      { companyId: company.id, projectId: boutiqueInteriors.id, clientId: meridianRetail.id, invoiceNumber: "INV-2026-004", amount: 3200000, taxAmount: 576000, status: "OVERDUE", dueDate: new Date("2026-05-01") },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { companyId: company.id, projectId: skyHeights.id, category: "MATERIAL", description: "Cement & steel — Tower A", amount: 4500000 },
      { companyId: company.id, projectId: skyHeights.id, category: "LABOR", description: "Site labor — March", amount: 2100000 },
      { companyId: company.id, projectId: skyHeights.id, category: "EQUIPMENT", description: "Tower crane rental", amount: 800000 },
      { companyId: company.id, projectId: coastalVillas.id, category: "MATERIAL", description: "Precast panels", amount: 6000000 },
      { companyId: company.id, projectId: coastalVillas.id, category: "LABOR", description: "Site labor — Phase 2", amount: 1800000 },
      { companyId: company.id, projectId: boutiqueInteriors.id, category: "MATERIAL", description: "Fit-out materials", amount: 900000 },
      { companyId: company.id, projectId: boutiqueInteriors.id, category: "MISC", description: "Permits & inspections", amount: 150000 },
    ],
  });

  // ── HR ──────────────────────────────────────────────────────────────
  await prisma.leaveRequest.createMany({
    data: [
      { employeeId: employees["siteengineer@savhnos.dev"].id, fromDate: new Date("2026-08-01"), toDate: new Date("2026-08-03"), reason: "Family function", status: "PENDING" },
      { employeeId: employees["draftingengineer@savhnos.dev"].id, fromDate: new Date("2026-07-28"), toDate: new Date("2026-07-29"), reason: "Personal", status: "PENDING" },
      { employeeId: employees["interiordesigner@savhnos.dev"].id, fromDate: new Date("2026-06-10"), toDate: new Date("2026-06-12"), reason: "Medical", status: "APPROVED" },
    ],
  });

  // eslint-disable-next-line no-console
  console.log("Demo data seeded.\n");
  // eslint-disable-next-line no-console
  console.log(`Demo logins (all use password: ${DEMO_PASSWORD})`);
  for (const u of company.users) {
    // eslint-disable-next-line no-console
    console.log(`  ${u.role.padEnd(16)} ${u.email}`);
  }
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createEmployeeSchema } from "@/modules/employees/validators/employee.validators";
import { createEmployee, listEmployees } from "@/server/services/employee.service";
import { UserRole } from "@/lib/enums";

export const GET = withAuth(async (_req, { session }) => {
  const employees = await listEmployees(session.user.companyId);
  return NextResponse.json(employees);
});

export const POST = withAuth(
  async (req, { session }) => {
    const { data, error } = await parseBody(req, createEmployeeSchema);
    if (error) return error;
    const employee = await createEmployee(session.user.companyId, data);
    return NextResponse.json(employee, { status: 201 });
  },
  [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR]
);

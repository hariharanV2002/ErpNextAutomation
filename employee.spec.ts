import { test, expect } from "@playwright/test";
import { Selectors } from "../selectors";
import { EmployeePage } from "../pages/masters/employeePage";
import { LoginPage } from "../pages/loginpage";
import { CommonPage } from "../pages/commonPage";
import { MesAdminPage } from "../pages/adminPage";
import { EmployeeFlow } from "../flows/employeeFlow";
import { CommonFlow } from "../flows/commonFlows";
import { FakerUtils } from "../utilis/employeeRandom";
import { EmployeeData } from "../utilis/employeeData";
import invalidData from "../fixtures/data/invalidData.json";
import testData from "../testdata/testdata.json";
import path from "path";

test.describe("Employee Master - Complete Test Suite", () => {
  let selectors: Selectors;
  let employeePage: EmployeePage;
  let loginPage: LoginPage;
  let commonPage: CommonPage;
  let adminPage: MesAdminPage;
  let employeeFlow: EmployeeFlow;
  let commonFlow: CommonFlow;

  const adminPassword = process.env.adminPassword!;
  const adminId = process.env.adminId!;
  const baseUrl = process.env.baseUrl!;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    selectors = new Selectors();
    loginPage = new LoginPage(page, selectors);
    commonPage = new CommonPage(page, selectors);
    adminPage = new MesAdminPage(page, selectors);
    employeePage = new EmployeePage(page, selectors);
    employeeFlow = new EmployeeFlow(employeePage, commonPage, loginPage);
    commonFlow = new CommonFlow(commonPage);
    // Login and navigate to Employee Master
    await page.goto(baseUrl);
    await loginPage.loginFlow(adminId, adminPassword);
    await commonPage.verifyToastMessage(testData.tost.succese);
    await commonPage.goToRoutingPage();
    await adminPage.clickMasters();
    await adminPage.employeeMasters();
  });

  // VALIDATION TESTS 

  test("Employee ID - Required validation", async () => {
    await employeePage.openAddEmployeeForm();
    const scenario = invalidData.employeeId.find((s) => s.type === "required")!;
    await employeePage.validateEmployeeIdRequired();
    await commonPage.verifyErrorMessage(scenario.errorMessage);
  });

  test("Name - Required validation", async () => {
    await employeePage.openAddEmployeeForm();
    const scenario = invalidData.name.find((s) => s.type === "required")!;
    await employeePage.validateNameRequired();
    await commonPage.verifyErrorMessage(scenario.errorMessage);
  });

  test("Department - Required validation", async () => {
    await employeePage.openAddEmployeeForm();
    const scenario = invalidData.department[0];
    await employeePage.validateDepartmentRequired();
    await commonPage.verifyErrorMessage(scenario.errorMessage);
  });

  test("Designation - Required validation", async () => {
    await employeePage.openAddEmployeeForm();
    const scenario = invalidData.designation[0];
    await employeePage.validateDesignationRequired();
    await commonPage.verifyErrorMessage(scenario.errorMessage);
  });

  test("Role - Required validation", async () => {
    await employeePage.openAddEmployeeForm();
    const scenario = invalidData.role[0];
    await employeePage.validateRoleRequired();
    await commonPage.verifyErrorMessage(scenario.errorMessage);
  });

  //Field Validations - Invalid Values
  test("Shop Floor - Invalid value shows no data", async () => {
    await employeePage.openAddEmployeeForm();
    await employeePage.validateDropdownInvalidValue("shopfloor", "abc123xyz");
  });

  test("Department - Invalid value shows no data", async () => {
    await employeePage.openAddEmployeeForm();
    await employeePage.validateDropdownInvalidValue("department", "invalidDept999");
  });

  test("Designation - Invalid value shows no data", async () => {
    await employeePage.openAddEmployeeForm();
    await employeePage.validateDropdownInvalidValue("designation", "invalidDesig456");
  });

  test("Role - Invalid value shows no data", async () => {
    await employeePage.openAddEmployeeForm();
    await employeePage.validateDropdownInvalidValue("role", "abc32xyz");
  });

  //  STATUS TOGGLE TEST

  test("Status toggle between Active and Inactive", async () => {
    await employeePage.openAddEmployeeForm();

    await employeePage.verifyFormStatus("Active");
    await employeePage.toggleStatus();
    await employeePage.verifyFormStatus("Inactive");
    await employeePage.toggleStatus();
    await employeePage.verifyFormStatus("Active");

    await employeePage.cancelForm();
  });

  // CREATE EMPLOYEE TESTS


  test("Create Employee - Role: Admin", async () => {
    await employeePage.openAddEmployeeForm();
    const employee = FakerUtils.generateEmployee();
    employee.role = "Admin";
    await employeeFlow.createEmployee(employee);
    const success = await employeeFlow.verifyEmployeeCreated(employee);

    expect(success).toBeTruthy();
  });

  test("Create Employee - Role: Production Planner", async () => {
    await employeePage.openAddEmployeeForm();
    const employee = FakerUtils.generateEmployee();
    employee.role = "Production Planner";
    await employeeFlow.createEmployee(employee);
    const success = await employeeFlow.verifyEmployeeCreated(employee);

    expect(success).toBeTruthy();
  });

  test("Create Employee - Role: Supervisor", async () => {
    await employeePage.openAddEmployeeForm();
    const employee = FakerUtils.generateEmployee();
    employee.role = "Supervisor";
    await employeeFlow.createEmployee(employee);
    const success = await employeeFlow.verifyEmployeeCreated(employee);

    expect(success).toBeTruthy();
  });

  test("Create Employee - Role: Operator", async () => {
    await employeePage.openAddEmployeeForm();
    const employee = FakerUtils.generateEmployee();
    employee.role = "Operator";
    await employeeFlow.createEmployee(employee);
    const success = await employeeFlow.verifyEmployeeCreated(employee);
    expect(success).toBeTruthy();
  });



  //  NEGATIVE TESTS 

  test("Create Employee - Duplicate Employee ID fails", async () => {
    const allEmployees = EmployeeData.getAllEmployees();
    expect(allEmployees.length).toBeGreaterThan(0);

    const lastEmployeeId = allEmployees[allEmployees.length - 1].id;
    await employeePage.openAddEmployeeForm();

    const errorMsg = await employeeFlow.attemptDuplicateEmployee(lastEmployeeId, "Admin");
    expect(errorMsg).toContain(testData.tost.duplicateEmployeeAdd);
  });

  test("Invalid Search - Employee not found", async () => {
    const lastEmployee = employeeFlow.getLastCreatedEmployee();
    expect(lastEmployee).not.toBeNull();

    const invalidId = lastEmployee!.id + "xx";
    await employeeFlow.searchInvalidEmployee(invalidId);
  });

  // EDIT & STATUS CHANGE TESTS 

  test("Toggle status Active and Inactive verify", async () => {
    const lastEmployee = employeeFlow.getLastCreatedEmployee();
    expect(lastEmployee).not.toBeNull();
    const result1 = await employeeFlow.editAndDeactivateEmployee(lastEmployee!);
    expect(result1.status).toBe("Inactive");
    const result2 = await employeeFlow.editAndActivateEmployee(lastEmployee!);
    expect(result2.status).toBe("Active");

  });


  // Edit Employee 

test("Edit Employee - Update name and random dropdown selections", async ({ page }) => {

  const lastEmployee = employeeFlow.getLastCreatedEmployee();
  expect(lastEmployee).not.toBeNull();
  const updatedData = {
    name: FakerUtils.name(),
    role:"Operator"
  };
  console.log("Editing employee with new name:", updatedData.name);
  const result = await employeeFlow.editEmployee(lastEmployee!.id, updatedData);
  expect(result.updatedEmployee.name).toBe(updatedData.name);
  expect(result.msg).toContain("success");

  console.log("Employee successfully edited:", result.updatedEmployee);
});

  //Delete Employee 
  test("Create and Delete Employee", async ({ page }) => {

    // Create new employee
    await employeePage.openAddEmployeeForm();
    const employee = FakerUtils.generateEmployee();
    employee.role = "UnAssigned";
    await employeeFlow.createEmployee(employee);
    const created = await employeeFlow.verifyEmployeeCreated(employee);
    expect(created).toBeTruthy();
    console.log(`Employee created successfully: ${employee.id}`);

    // Delete the same employee
    const deleteResult = await employeeFlow.deleteEmployee(employee.id);
    expect(deleteResult.deleted).toBeTruthy();
    expect(deleteResult.msg.toLowerCase()).toContain("deleted");
    console.log(`Employee deleted successfully: ${employee.id}`);
  });

  //Reset password
  test("Reset password flow for last created employee", async ({ page }) => {
    const employees = EmployeeData.getAllEmployees();
    const lastEmployee = employees[employees.length - 1];
    const employeeId = lastEmployee.id;

    console.log(`Testing reset password flow for employee: ${employeeId}`);
    const defaultPassword = await employeeFlow.adminResetPassword(employeeId);
    await commonPage.logout(true);
    await employeeFlow.employeeLogin(employeeId, defaultPassword);
    const newPassword = await employeeFlow.employeeChangePassword(employeeId);
    await commonPage.logout(true);
    await employeeFlow.employeeLogin(employeeId, newPassword);
    console.log(` Final password stored in JSON for ${employeeId}: ${newPassword}`);
  });

  //File Upload Test

  test("Negative - Missing required columns", async () => {
    const missingColumnsFile = path.resolve(__dirname, "../fixtures/data/missedColumn.csv");
    await employeePage.openUploadDialog();
    await employeePage.uploadInvalidFile(missingColumnsFile, testData.tost.employeeAdd);
  });

  test("Negative - File size exceeds 100 MB", async () => {
    const largeFile = path.resolve(__dirname, "../fixtures/data/100mb.xlsx");
    await employeePage.openUploadDialog();
    await employeePage.uploadLargeFile(largeFile);
  });

  test("Positive Flow - Upload valid employee file", async () => {
    const validFile = path.resolve(__dirname, "../fixtures/data/validEmployeeData.csv");
    await employeeFlow.uploadEmployeeFileFlow(validFile);
  });
  //pagination test
  test("Verify pagination controls", async ({ page }) => {
    await commonFlow.verifyPaginationFlow();
  });
  //table headings test
  test("Verify Table headings ", async ({ page }) => {
    await commonPage.verifyTableHeadings();
  });
});

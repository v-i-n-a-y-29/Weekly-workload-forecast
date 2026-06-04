import app from './app';
import { prisma } from './config/db';

const PORT = 3001;

async function runTests() {
  const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    
    try {
      // 1. Clear database
      console.log('Clearing database...');
      await prisma.task.deleteMany();
      await prisma.employee.deleteMany();

      const baseUrl = `http://localhost:${PORT}/api`;

      // 2. Test employee creation
      console.log('Testing Employee Creation...');
      
      const emp1Res = await fetch(`${baseUrl}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Alice Smith', role: 'Developer', weeklyCapacity: 40 }),
      });
      const alice = (await emp1Res.json()) as any;
      console.log('Created Alice:', alice);

      const emp2Res = await fetch(`${baseUrl}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Bob Jones', role: 'Designer', weeklyCapacity: 20 }),
      });
      const bob = (await emp2Res.json()) as any;
      console.log('Created Bob:', bob);

      const emp3Res = await fetch(`${baseUrl}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Charlie Brown', role: 'Manager', weeklyCapacity: 10 }),
      });
      const charlie = (await emp3Res.json()) as any;
      console.log('Created Charlie:', charlie);

      // Verify listing employees
      const listEmpRes = await fetch(`${baseUrl}/employees`);
      const employeesList = (await listEmpRes.json()) as any[];
      console.log(`Listed ${employeesList.length} employees`);
      if (employeesList.length !== 3) {
        throw new Error('Employee count does not match 3');
      }

      // 3. Test employee creation validation
      console.log('Testing Employee Validation...');
      const invalidEmpRes = await fetch(`${baseUrl}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', role: 'QA' }),
      });
      console.log('Invalid employee response status:', invalidEmpRes.status);
      if (invalidEmpRes.status !== 400) {
        throw new Error('Validation failed: empty name should return status 400');
      }

      // 4. Test task creation
      console.log('Testing Task Creation...');
      
      // Task 1: Alice - 25 hrs, IN_PROGRESS, due 2026-06-01 (Within selected week)
      const t1Res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Task A',
          estimatedHours: 25,
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dueDate: '2026-06-01',
          assignedEmployeeId: alice.id,
        }),
      });
      const taskA = (await t1Res.json()) as any;
      console.log('Created Task A:', taskA);

      // Task 2: Alice - 15 hrs, NOT_STARTED, due 2026-06-05 (Within selected week)
      const t2Res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Task B',
          estimatedHours: 15,
          priority: 'MEDIUM',
          status: 'NOT_STARTED',
          dueDate: '2026-06-05',
          assignedEmployeeId: alice.id,
        }),
      });
      const taskB = (await t2Res.json()) as any;

      // Task 3: Alice - 10 hrs, COMPLETED, due 2026-06-03 (Within selected week, but completed -> ignored in forecast)
      await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Task C (Completed)',
          estimatedHours: 10,
          priority: 'LOW',
          status: 'COMPLETED',
          dueDate: '2026-06-03',
          assignedEmployeeId: alice.id,
        }),
      });

      // Task 4: Bob - 18 hrs, NOT_STARTED, due 2026-06-02 (Within selected week)
      const t4Res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Task D',
          estimatedHours: 18,
          priority: 'HIGH',
          status: 'NOT_STARTED',
          dueDate: '2026-06-02',
          assignedEmployeeId: bob.id,
        }),
      });
      const taskD = (await t4Res.json()) as any;

      // Task 5: Bob - 12 hrs, IN_PROGRESS, due 2026-06-12 (Next week -> ignored in forecast)
      await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Task E (Next week)',
          estimatedHours: 12,
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          dueDate: '2026-06-12',
          assignedEmployeeId: bob.id,
        }),
      });

      // Task 6: Charlie - 12 hrs, NOT_STARTED, due 2026-06-04 (Within selected week)
      await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Task F',
          estimatedHours: 12,
          priority: 'HIGH',
          status: 'NOT_STARTED',
          dueDate: '2026-06-04',
          assignedEmployeeId: charlie.id,
        }),
      });

      // 5. Test task validation
      console.log('Testing Task Validation...');
      const invalidTaskRes = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Invalid Task',
          estimatedHours: -5,
          priority: 'INVALID',
          status: 'NOT_STARTED',
          dueDate: '2026-06-01',
        }),
      });
      console.log('Invalid task response status:', invalidTaskRes.status);
      if (invalidTaskRes.status !== 400) {
        throw new Error('Validation failed: negative hours & invalid priority should return 400');
      }

      // 6. Test forecast query
      console.log('Testing Workload Forecast...');
      const forecastRes = await fetch(`${baseUrl}/forecast?weekStart=2026-06-01`);
      const forecast = (await forecastRes.json()) as any[];
      console.log('Weekly Forecast:', JSON.stringify(forecast, null, 2));

      // Assert results
      // Alice: capacity = 40, planned = 40 (Task A 25 + Task B 15), utilization = 100%, warning = RED
      // Bob: capacity = 20, planned = 18 (Task D 18), utilization = 90%, warning = YELLOW
      // Charlie: capacity = 10, planned = 12 (Task F 12), utilization = 120%, warning = RED

      const aliceForecast = forecast.find((f: any) => f.employeeId === alice.id);
      const bobForecast = forecast.find((f: any) => f.employeeId === bob.id);
      const charlieForecast = forecast.find((f: any) => f.employeeId === charlie.id);

      if (!aliceForecast || aliceForecast.plannedHours !== 40 || aliceForecast.utilization !== 100 || aliceForecast.warning !== 'RED') {
        throw new Error(`Alice forecast validation failed: ${JSON.stringify(aliceForecast)}`);
      }
      if (!bobForecast || bobForecast.plannedHours !== 18 || bobForecast.utilization !== 90 || bobForecast.warning !== 'YELLOW') {
        throw new Error(`Bob forecast validation failed: ${JSON.stringify(bobForecast)}`);
      }
      if (!charlieForecast || charlieForecast.plannedHours !== 12 || charlieForecast.utilization !== 120 || charlieForecast.warning !== 'RED') {
        throw new Error(`Charlie forecast validation failed: ${JSON.stringify(charlieForecast)}`);
      }

      console.log('Initial forecast assertions passed!');

      // 7. Test updating task
      console.log('Testing Task Update...');
      // Update Task D: change estimatedHours from 18 to 15, and status to COMPLETED (should remove Bob's planned hours)
      const updateRes = await fetch(`${baseUrl}/tasks/${taskD.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          estimatedHours: 15,
        }),
      });
      const updatedTaskD = await updateRes.json();
      console.log('Updated Task D:', updatedTaskD);

      // Re-run forecast
      const updatedForecastRes = await fetch(`${baseUrl}/forecast?weekStart=2026-06-01`);
      const updatedForecast = (await updatedForecastRes.json()) as any[];
      console.log('Updated Weekly Forecast:', JSON.stringify(updatedForecast, null, 2));

      const updatedBobForecast = updatedForecast.find((f: any) => f.employeeId === bob.id);
      // Bob should have 0 plannedHours and 0% utilization, green warning now because Task D is completed
      if (!updatedBobForecast || updatedBobForecast.plannedHours !== 0 || updatedBobForecast.utilization !== 0 || updatedBobForecast.warning !== 'GREEN') {
        throw new Error(`Bob updated forecast validation failed: ${JSON.stringify(updatedBobForecast)}`);
      }

      console.log('Updated forecast assertions passed!');
      console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
      process.exit(0);

    } catch (err) {
      console.error('Test script failed with error:', err);
      process.exit(1);
    }
  });
}

runTests();

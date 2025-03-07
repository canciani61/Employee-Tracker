// index.js

const inquirer = require('inquirer');
const { Client } = require('pg');
require('console.table');

// 1. Create a new PG client
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',          // your PostgreSQL user
  password: 'Dukedaman@1',  // your PostgreSQL password
  database: 'employee_db'    // your database name
});

// 2. Connect to the database
client.connect()
  .then(() => {
    console.log('Connected to the database.');
    promptUser();
  })
  .catch(err => console.error('Connection error', err.stack));

// 3. Main menu prompt
function promptUser() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
          'View All Departments',
          'View All Roles',
          'View All Employees',
          'Add Department',
          'Add Role',
          'Add Employee',
          'Update Employee Role',
          'Quit'
        ]
      }
    ])
    .then((answer) => {
      switch (answer.choice) {
        case 'View All Departments':
          viewAllDepartments();
          break;
        case 'View All Roles':
          viewAllRoles();
          break;
        case 'View All Employees':
          viewAllEmployees();
          break;
        case 'Add Department':
          addDepartment();
          break;
        case 'Add Role':
          addRole();
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Update Employee Role':
          updateEmployeeRole();
          break;
        default:
          console.log('Goodbye!');
          client.end(); // close the database connection
          process.exit();
      }
    });
}

// 4. View all departments
async function viewAllDepartments() {
  try {
    const result = await client.query('SELECT * FROM department ORDER BY id;');
    console.table(result.rows);
  } catch (err) {
    console.error(err);
  }
  promptUser();
}

// 5. View all roles
async function viewAllRoles() {
  try {
    const query = `
      SELECT 
        role.id, 
        role.title, 
        department.name AS department, 
        role.salary
      FROM role
      JOIN department ON role.department_id = department.id
      ORDER BY role.id;
    `;
    const result = await client.query(query);
    console.table(result.rows);
  } catch (err) {
    console.error(err);
  }
  promptUser();
}

// 6. View all employees
async function viewAllEmployees() {
  try {
    const query = `
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        role.title AS job_title,
        department.name AS department, 
        role.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employee e
      JOIN role ON e.role_id = role.id
      JOIN department ON role.department_id = department.id
      LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY e.id;
    `;
    const result = await client.query(query);
    console.table(result.rows);
  } catch (err) {
    console.error(err);
  }
  promptUser();
}

// 7. Add a department
async function addDepartment() {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'Enter the name of the new department:'
    }
  ]);

  try {
    await client.query('INSERT INTO department (name) VALUES ($1)', [answer.departmentName]);
    console.log(`Added department "${answer.departmentName}" to the database.`);
  } catch (err) {
    console.error(err);
  }
  promptUser();
}

// 8. Add a role
async function addRole() {
  try {
    // Get the list of departments for the user to choose from
    const depResult = await client.query('SELECT * FROM department');
    const departments = depResult.rows.map(dep => ({
      name: dep.name,
      value: dep.id
    }));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the role title:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the role salary:'
      },
      {
        type: 'list',
        name: 'department_id',
        message: 'Select the department for this role:',
        choices: departments
      }
    ]);

    await client.query(
      'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
      [answers.title, answers.salary, answers.department_id]
    );
    console.log(`Added role "${answers.title}" to the database.`);
  } catch (err) {
    console.error(err);
  }
  promptUser();
}

// 9. Add an employee
async function addEmployee() {
  try {
    // Get the list of roles
    const roleResult = await client.query('SELECT * FROM role');
    const roles = roleResult.rows.map(r => ({
      name: r.title,
      value: r.id
    }));

    // Get the list of employees for possible managers
    const empResult = await client.query('SELECT * FROM employee');
    const employees = empResult.rows.map(e => ({
      name: e.first_name + ' ' + e.last_name,
      value: e.id
    }));
    // Option "None" for no manager
    employees.unshift({ name: 'None', value: null });

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "Enter the employee's first name:"
      },
      {
        type: 'input',
        name: 'last_name',
        message: "Enter the employee's last name:"
      },
      {
        type: 'list',
        name: 'role_id',
        message: "Select the employee's role:",
        choices: roles
      },
      {
        type: 'list',
        name: 'manager_id',
        message: "Select the employee's manager:",
        choices: employees
      }
    ]);

    await client.query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]
    );
    console.log(`Added employee "${answers.first_name} ${answers.last_name}" to the database.`);
  } catch (err) {
    console.error(err);
  }
  promptUser();
}

// 10. Update an employee role
async function updateEmployeeRole() {
  try {
    // Get all employees
    const empResult = await client.query('SELECT * FROM employee');
    const employees = empResult.rows.map(e => ({
      name: e.first_name + ' ' + e.last_name,
      value: e.id
    }));

    // Get all roles
    const roleResult = await client.query('SELECT * FROM role');
    const roles = roleResult.rows.map(r => ({
      name: r.title,
      value: r.id
    }));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee_id',
        message: "Which employee's role do you want to update?",
        choices: employees
      },
      {
        type: 'list',
        name: 'role_id',
        message: 'Select the new role:',
        choices: roles
      }
    ]);

    await client.query(
      'UPDATE employee SET role_id = $1 WHERE id = $2',
      [answers.role_id, answers.employee_id]
    );
    console.log('Employee role updated successfully.');
  } catch (err) {
    console.error(err);
  }
  promptUser();
}

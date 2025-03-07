-- Populate departments
INSERT INTO department (name)
VALUES
('Sales'),
('Engineering'),
('Finance'),
('Legal');

-- Populate roles
INSERT INTO role (title, salary, department_id)
VALUES
('Sales Lead', 100000, 1),
('Salesperson', 80000, 1),
('Software Engineer', 120000, 2),
('Accountant', 90000, 3),
('Legal Team Lead', 120000, 4);

-- Populate employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('John', 'Doe', 1, NULL),
('Ashley', 'Rodriguez', 2, 1),
('Kunal', 'Terry', 3, NULL),
('Malia', 'Brown', 4, NULL),
('Sarah', 'Lourd', 5, NULL);

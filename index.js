const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const logo = require('asciiart-logo');

let employeeArr, roleArr, departmentArr, managerArr;

const connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "MaCgYvEr29>?",
    database: "employee_trackerDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId);
    logoStart();
});

// Have a logo display before anything else
function logoStart() {
    console.log(
        logo({
            name: "MYSQL EMPLOYEE TRACKER",
            font: "Doom",
            borderColor: "bold-green",
            logoColor: "bold-green",
            textColor: "bold-green"
        }).render());
    directory();
}

// Make a directory to guide user to add, view or exit the app
function directory() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Employees, Departments, or Roles",
                "Add Employee, Department, or Role",
                "Delete An Employee, Role or Department",
                "Update an Employee Role",
                "Update an Employee Manager",
                "View Employees By Manager",
                "EXIT"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View All Employees, Departments, or Roles":
                    viewer();
                    break;

                case "Add Employee, Department, or Role":
                    adder();
                    break;

                case "Delete An Employee, Role or Department":
                    deleter();
                    break;

                case "Update an Employee Role":
                    updateEmployeeRole();
                    break;

                case "Update an Employee Manager":
                    updateEmployeeManager();
                    break;

                case "View Employees By Manager":
                    viewEmployeeManager();
                    break;

                case "EXIT":
                    connection.end();
                    break;
            }
        });
}

// Direct user to the individual view functions
function viewer() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to view?",
            choices: [
                "View All Employees",
                "View All Departments",
                "View All Roles"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View All Employees":
                    viewEmployeesDepartmentsRoles("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee AS e LEFT JOIN role AS r ON r.id = e.role_id LEFT JOIN department AS d ON d.id = r.department_id LEFT JOIN employee manager ON e.manager_id = manager.id");
                    break;

                case "View All Departments":
                    viewEmployeesDepartmentsRoles("SELECT * FROM department");
                    break;

                case "View All Roles":
                    viewEmployeesDepartmentsRoles("SELECT * FROM role");
                    break;
            }
        });
}

// Direct user to the individual add functions
function adder() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to add?",
            choices: [
                "Add New Employee",
                "Add New Department",
                "Add New Role"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Add New Employee":
                    addEmployee();
                    break;

                case "Add New Department":
                    addDepartment();
                    break;

                case "Add New Role":
                    addRole();
                    break;
            }
        });
}
// Direct user to the individual delete functions
function deleter() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to delete?",
            choices: [
                "Delete An Employee",
                "Delete A Department",
                "Delete A Role"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Delete An Employee":
                    deleteEmployee();
                    break;

                case "Delete A Department":
                    deleteDepartment();
                    break;

                case "Delete A Role":
                    deleteRole();
                    break;
            }
        });
}

function viewEmployeesDepartmentsRoles(fromQuery) {
    connection.query(fromQuery, (err, res) => {
        if (err) throw err;
        console.table(res);
        directory();
    });
}

function addEmployee() {
    roleArr = [];
    connection.query("SELECT title FROM role", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roleArr.push(res[i].title);
        }
    })
    inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter New Employee First Name:"
        },
        {
            name: "last",
            type: "input",
            message: "Enter New Employee Last Name:"
        },
        {
            name: "role",
            type: "list",
            message: "Enter New Employee Role:",
            choices: roleArr
        },
        {
            name: "manager_id",
            type: "input",
            message: "Enter New Employee Manager ID (if applicable):",
            default: "NULL"
        }
    ]).then((answer) => {
        let roleID;
        // console.log(answer);
        connection.query("SELECT id AS role_id FROM role WHERE title = ?", `${answer.role}`, function (err, result) {
            if (err) throw err;
            // console.log(result);
            roleID = result[0].role_id;
            // console.log(roleID);
            connection.query("INSERT INTO employee SET ?",
                {
                    first_name: answer.first,
                    last_name: answer.last,
                    role_id: roleID,
                    manager_id: answer.manager_id
                }, function (err) {
                    if (err) throw err;
                    console.log("New Employee Added! Thank you for your time!");
                    directory();
                });
        })
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            name: "department_name",
            type: "input",
            message: "Enter New Department Name:"
        }
    ]).then(function (answer) {
        connection.query("INSERT INTO department SET ?", { name: answer.department_name }, function (err) {
            if (err) throw err;
            console.log("New Department Added! Thank you for your time!");
            directory();
        });
    });
}

function addRole() {
    departmentArr = [];
    connection.query("SELECT name FROM department", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            departmentArr.push(res[i].name);
        }
    })
    inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "Enter New Role Title:"
        },
        {
            name: "salary",
            type: "input",
            message: "Enter Salary Amount:"
        },
        {
            name: "departmentName",
            type: "list",
            message: "Enter Department Associated With This Role:",
            choices: departmentArr
        }
    ]).then(function (answer) {
        let departmentID;
        connection.query("SELECT id AS department_id FROM department WHERE name = ?", `${answer.departmentName}`, function (err, result) {
            if (err) throw err;
            // console.log(result);
            departmentID = result[0].department_id;
            // console.log(departmentID);
            connection.query("INSERT INTO role SET ?",
                {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: departmentID
                }, function (err) {
                    if (err) throw err;
                    console.log("New Role Added! Thank you for your time!");
                    directory();
                });
        });
    });
}

function deleteEmployee() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "What Is The Employee's ID That You Wish To Delete?"
        }
    ]).then((answer) => {
        connection.query("DELETE FROM employee WHERE id = ?", `${answer.id}`, function (err) {
            if (err) throw err;
            console.log("Delete Successful!");
            directory();
        });
    });
}

function deleteDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "What Is The Department's ID That You Wish To Delete?"
        }
    ]).then((answer) => {
        connection.query("DELETE FROM department WHERE id = ?", `${answer.id}`, function (err) {
            if (err) throw err;
            console.log("Delete Successful!");
            directory();
        });
    });
}

function deleteRole() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "What Is The Role's ID That You Wish To Delete?"
        }
    ]).then((answer) => {
        connection.query("DELETE FROM role WHERE id = ?", `${answer.id}`, function (err) {
            if (err) throw err;
            console.log("Delete Successful!");
            directory();
        });
    });
}

function updateEmployeeRole() {
    inquirer.prompt([
        {
            type: "input",
            name: "first",
            message: "What is the Employee to Update First Name?"
        },
        {
            type: "input",
            name: "last",
            message: "What is the Employee to Update Last Name?"
        },
        {
            type: "input",
            name: "role_id",
            message: "What is the Employee to Update New Role ID?"
        }
    ]).then((data) => {
        connection.query("UPDATE employee SET ? WHERE ? and ?",
            {
                role_id: data.role_id,
                first_name: data.first,
                last_name: data.last
            });
        console.log("Employee Role Updated!");
        directory();
    });
}

function updateEmployeeManager() {
    inquirer.prompt([
        {
            type: "input",
            name: "first",
            message: "What is the Employee to Update First Name?"
        },
        {
            type: "input",
            name: "last",
            message: "What is the Employee to Update Last Name?"
        },
        {
            type: "input",
            name: "manager_id",
            message: "What is the Employee to Update New Manager ID?"
        }
    ]).then((data) => {
        connection.query("UPDATE employee SET ? WHERE ? and ?",
            {
                manager_id: data.manager_id,
                first_name: data.first,
                last_name: data.last
            }, (err) => {
                if (err) throw err;
            });
        console.log("Employee Role Updated!");
        directory();
    });
}

function viewEmployeeManager() {
    managerArr = [];
    connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", (err, res) => {
        if (err) throw err;
        console.log(res);
        for (let i = 0; i < res.length; i++) {
            managerArr.push(res[i].first_name + " " + res[i].last_name);
        }
        console.log(managerArr);
        inquirer.prompt([
            {
                type: "list",
                name: "managerName",
                message: "What Manager Would You Like To View Employees By?",
                choices: managerArr
            }
        ]).then(function (answer) {
            console.log(answer);
            let managerID;
            connection.query('SELECT id AS manager_id FROM employee WHERE CONCAT(first_name, " ", last_name) = ?', `${answer.managerName}`, function (err, result) {
                if (err) throw err;
                managerID = result[0].manager_id;
                connection.query("SELECT first_name, last_name FROM employee WHERE manager_id = ?", managerID, (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    directory();
                });
            });
        });
    });
}
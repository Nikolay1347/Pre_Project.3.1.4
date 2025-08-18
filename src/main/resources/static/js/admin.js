const API_URL = '/api/admin';


const dynamicModal = document.getElementById('dynamicModal');
const modalContent = document.getElementById('modalContent');
let modeAdminUser = 'USER';

async function selectRole() {
    let response =  await fetch(`${API_URL}/user`);
    const user = await response.json();
    user.roles.forEach(role => {
        if (role.name === "ROLE_ADMIN") {
            modeAdminUser = "ADMIN"
        }
    });
}

// ----- ЗАПОЛНЕНИЕ ШАПКИ САЙТА-------//
async function fillingHeader() {
    const response = await fetch(`${API_URL}/user`);
    const user = await response.json();

    if (user.email == null) {
        document.getElementById("headerMail").innerHTML = "null";
    } else {
        document.getElementById("headerMail").innerHTML = user.email;
    }
    document.getElementById("headerRoles").innerHTML = user.roles.map(role => role.name).join(', ');
}

//---------Заполнение левого столбца-------------------//
async function leftColumn() {
    const response = await fetch(`${API_URL}/user`);
    const user = await response.json();
    document.getElementById("leftRole").innerHTML = user.roles.map(role =>
        `<a class="btn btn-light d-block mb-2" data-role="${role.name}" style="display: block;">${role.name}</a>`
    ).join('');
}

//------ Получение списка ролей ----------------//
async function getRoles() {
    const response = await fetch(`${API_URL}/roles`);
    return await response.json(); // массив строк: ["ROLE_USER", "ROLE_ADMIN"]
}

async function adminPage() {
    document.getElementById('app').innerHTML = `
  
<h2>Admin panel</h2>
<!-- Табы -->
        <!-- Навигационные вкладки -->
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation"> <!-- Вкладка All users -->
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" 
            role="tab" aria-controls="home" aria-selected="true" > Users table 
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" 
            role="tab" aria-controls="profile" aria-selected="false" >New User <!-- Вкладка new User -->
            </button>
          </li>
        </ul> 
        
        <div class="tab-content">
  <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab" >
    <!-- Контент для Users table -->
  </div>
  <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab" >
    <!-- Контент для New User -->
  </div>
</div>
        
`;
    await loadUsersTable();
}

async function loadOneUser() {

    const response = await fetch(`${API_URL}/user`);
    const user = await response.json();
    document.getElementById('app').innerHTML = `
    <h2>User information-page</h2>
    <div class="alert alert-warning">About user:</div>
    <table class="table table-hover">
               <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">First name</th>
                    <th scope="col">Age</th>
                    <th scope="col">Email</th>
                    <th scope="col">Active</th>
                    <th scope="col">Role</th>
                  </tr>
               </thead>
                  <tbody>
                    <tr class="table-success">
                       <td>${user.id}</td>
                       <td>${user.username}</td>
                       <td>${user.age}</td>
                       <td>${user.email}</td>
                       <td>${user.active}</td>
                       <td>${user.roles.map(role => role.name).join(', ')}</td>
                    </tr>
                  </tbody>
       </table>
`;
}

async function loadUsersTable() {
    const response = await fetch(`${API_URL}/users`);
    const user = await response.json();
    const loadUsers = document.getElementById('home');
    loadUsers.innerHTML = `
         <div class="alert alert-warning">All users</div>
            <table <table class="table table-striped">
               <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">First name</th>
                    <th scope="col">Age</th>
                    <th scope="col">Email</th>
                    <th scope="col">Active</th>
                    <th scope="col">Role</th>
                    <th scope="col">Edit</th>
                    <th scope="col">Delete</th>
                  </tr>
               </thead>
                <tbody>
                  <tr class="table-success">
                    ${user.map(user => `
                      <tr>
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.age}</td>
                        <td>${user.email}</td>
                        <td>${user.active}</td>
                        <td>${user.roles.map(role => role.name).join(', ')}</td>
                        <td><button class="btn btn-info btn-sm" onclick="openEditUserModal(${user.id})">Edit</button></td>
                        <td><button class="btn btn-danger btn-sm" onclick="openDeleteUserModal(${user.id})">Delete</button></td>
                      </tr>
                    `).join('')}
                  </tr>
                </tbody>
            </table>
    `;
}

//------- Функция для отображения модального окна удаления пользователя ---------//
async function openDeleteUserModal(userId) {
    const [userData, roles] = await Promise.all([
        fetch(`${API_URL}/users/${userId}`).then(res => res.json()),
        getRoles()
    ]);
    const formHTML = generateDeleteUserFormHTML({user: userData, roles});
    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = formHTML;

    const modalInstance = new bootstrap.Modal(document.getElementById("dynamicModal"));
    modalInstance.show();

    modalContent.querySelector('#userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        deleteItem(userId);
        modalInstance.hide();
    });
}

//------- Функция для отображения модального окна добавления пользователя ---------//
async function openEditUserModal(userId) {

    const [userData, roles] = await Promise.all([
        fetch(`${API_URL}/users/${userId}`).then(res => res.json()),
        getRoles()
    ]);

    modalContent.innerHTML = generateUserFormHTML({user: userData, roles});
    $(dynamicModal).modal('show');

    setupFormSubmit(() => {
        $(dynamicModal).modal('hide');
        loadUsersTable();
    }, userId);
}

//---------- Открытие формы редактирования пользователя --------//
function generateUserFormHTML({user = {}, roles = []}) {

    let roleCheckboxes = '';  //заполняем div с ролями
    roles.forEach(role => {
        const checked = user.roles && user.roles.includes(role) ? 'checked' : '';
        roleCheckboxes += `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" name="roles" value="${role.name}" ${checked} >
                <label class="form-check-label">${role.name}</label>
            </div>`;
    });
    return `
        <form id="userForm">
            <div class="modal-header">
                <h5 class="modal-title">Edit User</h5>
                <button type="button" class="close" data-bs-dismiss="modal">x</button>
            </div>
            <div class="modal-body">
                <input type="hidden" name="id" value="${user.id}">
                
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" class="form-control" name="username" value="${user.username || ''}" required>
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="text" class="form-control" name="age" value="${user.age || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" value="${user.email || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="active">Active</label>
                    <select type="select" class="form-control" name="active" value="${user.active || ''}" required>
                      <option value="true" selected>true</option>
                      <option value="false">false</option>
                    </select>
                  </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" class="form-control" name="password">
                </div>
                <div class="form-group">
                    <label>Roles</label>
                    ${roleCheckboxes}
                </div>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-success">Update</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
        </form>
    `;
}

function generateDeleteUserFormHTML({user = {}, roles = []}) {
    let roleCheckboxes = '';  //заполняем div с ролями
    user.roles.forEach(role => {
        const checked = 'checked';
        roleCheckboxes += `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" name="roles" value="${role}" ${checked}>
                <label class="form-check-label">${role.name}</label>
            </div>`;
    });
    return `
        <form id="userForm">
            <div class="modal-header">
                <h5 class="modal-title">Delete</h5>
                <button type="button" class="close" data-bs-dismiss="modal">x</button>
            </div>
            <div class="modal-body"> 
                <div class="form-group">
                    <label>ID</label>
                    <input type="text" class="form-control" name="id" value="${user.id || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" class="form-control" name="username" value="${user.username || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="text" class="form-control" name="age" value="${user.age || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" value="${user.email || ''}" readonly>
                </div>
                <div class="form-group">
                    <label for="active">Active</label>
                    <input type="text" class="form-control" name="active" value="${user.active || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Roles</label>
                    ${roleCheckboxes}
                </div>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-danger">Delete</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
        </form>
    `;
}

async function submitForm(){
    setupFormSubmit(() => {
        loadUsersTable();
    }, null);
}

//------- Обработчик отправки формы --------------------//
function setupFormSubmit(onSuccess, userId = null) {
    const formUpdate = document.getElementById('userForm');
    const formAdd = document.getElementById('addUserForm');

    const form = userId ? formUpdate : formAdd;

    console.log(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            age: formData.get('age'),
            email: formData.get('email'),
            active:formData.get('active'),
            password: formData.get('password') || undefined,
            roles: [...formData.getAll('roles')]
        };

        console.log(data);

        const method = userId ? 'PUT' : 'POST';
        const url = userId ? `${API_URL}/users/${userId}` : `${API_URL}/users`;


        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)  // преобразуем из JSON в объект
        });

        //await loadUsersTable(); // Обновляем таблицу
        document.getElementById('home-tab').click(); // Переключаем на таблицу

        onSuccess();
    }, {once: true});
}

//---------Инициализация--------------//
document.addEventListener('DOMContentLoaded', async () => {
    await leftColumn();
    await fillingHeader();
    await selectRole();

    // Обработчик кликов
    document.getElementById("leftRole").addEventListener("click", function(e) {
        if (e.target.matches("[data-role]")) {
            const role = e.target.getAttribute("data-role");
            if (role === "ROLE_ADMIN") {
                adminPage();
                // Обработчик для вкладки "Users table"
                document.getElementById('home-tab').addEventListener('click', function() {
                    loadUsersTable();
                });
                // Обработчик для вкладки "New User"
                document.getElementById('profile-tab').addEventListener('click', function() {
                    loadNewUserForm();
                });
                async function loadNewUserForm() {
                    const addUser = document.getElementById("profile");
                    addUser.innerHTML = `
    
    <div class="alert alert-warning">Add new user</div>

    <div class="mx-auto" style="width: 300px;">  <!-- размер столбца -->
        
        <form id="addUserForm">
            <div class="text-center">
            
               <label for="username">Username</label>
                <input type="text" class="form-control" name="username" required>
            </div>
            <div class="text-center">
                <label for="age">Age</label>
                <input type="number" class="form-control" name="age" required>
            </div>
            <div class="text-center">
                <label for="email">Email</label>
                <input type="email" class="form-control" name="email" required>
            </div>
            <div class="text-center">
                <label for="password">Password</label>
                <input type="password" class="form-control" name="password" autocomplete="current-password" required >
            </div>
            <div class="text-center">
                <label for="active">Active</label>
                <select name="active" class="form-control" required>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div class="text-center">
                <label>Roles:</label>
                <select name="roles" class="form-select" size="2" aria-label="size 2 select example" multiple required>
                    <option value="ROLE_ADMIN">Admin</option>
                    <option value="ROLE_USER">User</option>
                </select>
            </div>
            <button type="submit" class="btn btn-success">Add new user</button>
        </form>
    </div>
    `;
                    await submitForm();
                    // Обработчик отправки формы
                    // document.getElementById('addUserForm').addEventListener('submit', function(e) {
                    //     e.preventDefault(); // Предотвращаем стандартную отправку формы
                    //     loadUsersTable();
                    //     createNewUser();
                    //});
                }

                modeAdminUser = "ADMIN"
            } else if (role === "ROLE_USER") {
                loadOneUser();
                modeAdminUser = "USER";

            }
        }
    });

if (modeAdminUser === "ADMIN") {
    await adminPage();

    // Обработчик для вкладки "Users table"
    document.getElementById('home-tab').addEventListener('click', function() {
        loadUsersTable();
    });
    // Обработчик для вкладки "New User"
    document.getElementById('profile-tab').addEventListener('click', function() {
        loadNewUserForm();
    });

    async function loadNewUserForm() {
        const addUser = document.getElementById("profile");
        addUser.innerHTML = `
    
    <div class="alert alert-warning">Add new user</div>

    <div class="mx-auto" style="width: 300px;">  <!-- размер столбца -->
        
        <form id="addUserForm">
            <div class="text-center">
            
               <label for="username">Username</label>
                <input type="text" class="form-control" name="username" required>
            </div>
            <div class="text-center">
                <label for="age">Age</label>
                <input type="number" class="form-control" name="age" required>
            </div>
            <div class="text-center">
                <label for="email">Email</label>
                <input type="email" class="form-control" name="email" required>
            </div>
            <div class="text-center">
                <label for="password">Password</label>
                <input type="password" class="form-control" name="password" autocomplete="current-password" required >
            </div>
            <div class="text-center">
                <label for="active">Active</label>
                <select name="active" class="form-control" required>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div class="text-center">
                <label>Roles:</label>
                <select name="roles" class="form-select" size="2" aria-label="size 2 select example" multiple required>
                    <option value="ROLE_ADMIN">Admin</option>
                    <option value="ROLE_USER">User</option>
                </select>
            </div>
            <button type="submit" class="btn btn-success">Add new user</button>
        </form>
    </div>
    `;

        await submitForm();

    }
}
    else if (modeAdminUser === "USER") {
    await loadOneUser();
}
});

//------- Удаление пользователя -------------------------//
async function deleteItem(userId) {
    await fetch(`${API_URL}/delete/${userId}`, {
        method: 'DELETE'
    });
    await loadUsersTable();
}

//------------Выход----------------//
function logout() {
    window.location.href = '/logout';
}


let path = new URLSearchParams(location.search);
let teacherId = path.get("teacherId");

let studentsContainer = document.getElementById("students");
let addStudentsBtn = document.getElementById("add-students");

let outerModal = document.getElementById("outer-modal");
let innerModal = document.getElementById("inner-modal");

let selectedId = null;
let studentsCache = [];

// SEARCH ELEMENTS
const searchInput = document.getElementById("default-search");
const searchBtn = document.querySelector("button[type='submit']");

// MODAL OPEN
addStudentsBtn.addEventListener("click", () => {
    outerModal.classList.remove("hidden");
});

// MODAL CLOSE
outerModal.addEventListener("click", () => {
    outerModal.classList.add("hidden");
    resetForm();
    selectedId = null;
});

innerModal.addEventListener("click", (e) => e.stopPropagation());

// FORM RESET
function resetForm() {
    for (let i = 0; i <= 10; i++) innerModal[i].value = "";
    innerModal[11].checked = false;
}

// RENDER STUDENTS
function renderStudents(data = studentsCache) {
    studentsContainer.innerHTML = "";

    if (!data.length) {
        studentsContainer.innerHTML = "<p class='text-center text-gray-700'>No students found</p>";
        return;
    }

    // Responsive grid container (card styles o'zgarmaydi)
    studentsContainer.className = "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4";

    data.forEach(student => {
        const card = document.createElement("div");
        card.className = "w-full bg-gradient-to-br from-black-600 via-blue-700 to-rose-600 text-white p-4 rounded-lg shadow hover:scale-105 transition-transform duration-300";

        card.innerHTML = `
            <div class="flex flex-col items-center rounded-xl w-full">
                <img class="w-24 h-24 mb-3 rounded-full shadow-lg object-cover" src="${student.avatar}" alt="Student Avatar" />
                <h5 class="mb-1 text-lg sm:text-xl font-medium text-white text-center">${student.firstname} ${student.lastname}</h5>
                <span class="text-sm text-gray-300">${student.rating}⭐</span>
                <div class="flex mt-4 gap-2 flex-wrap justify-center w-full">
                    <button class="edit-btn py-2 px-4 bg-white text-black rounded-lg hover:bg-blue-100 duration-200 w-full sm:w-auto">Edit</button>
                    <button class="delete-btn py-2 px-4 bg-white text-red-600 rounded-lg hover:bg-red-100 duration-200 w-full sm:w-auto">Delete</button>
                </div>
            </div>
        `;

        studentsContainer.appendChild(card);

        // Event listeners
        card.querySelector(".edit-btn").addEventListener("click", () => editStudent(student.id));
        card.querySelector(".delete-btn").addEventListener("click", () => deleteStudent(student.id, card));
    });
}



// GET STUDENTS FROM SERVER
async function getStudents() {
    try {
        let url = teacherId
            ? `https://691309fe52a60f10c823c566.mockapi.io/teachers/${teacherId}/students`
            : `https://691309fe52a60f10c823c566.mockapi.io/students`;

        const res = await axios.get(url);
        studentsCache = res.data;
        renderStudents();
    } catch (err) {
        console.log(err);
        studentsContainer.innerHTML = "<p>Error loading students</p>";
    }
}

// DELETE STUDENT
async function deleteStudent(id, cardElement) {
    studentsCache = studentsCache.filter(s => s.id !== id);
    if (cardElement) cardElement.remove();

    try {
        let url = teacherId
            ? `https://691309fe52a60f10c823c566.mockapi.io/teachers/${teacherId}/students/${id}`
            : `https://691309fe52a60f10c823c566.mockapi.io/students/${id}`;

        await axios.delete(url);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.warn(`Student with id ${id} not found on server, removed locally.`);
        } else {
            console.log("Server delete failed", err);
        }
    }
}


// ADD / EDIT SUBMIT
innerModal.addEventListener("submit", async (e) => {
    e.preventDefault();

    let studentData = {
        firstname: e.target[0].value,
        lastname: e.target[1].value,
        phone: e.target[2].value,
        email: e.target[3].value,
        age: e.target[4].value,
        experience: e.target[5].value,
        grade: e.target[6].value,
        avatar: e.target[7].value,
        rating: e.target[8].value,
        profession: e.target[9].value,
        telegram: e.target[10].value,
        gender: e.target[11].checked,
    };

    try {
        if (selectedId) {
            await axios.put(
                teacherId
                    ? `https://691309fe52a60f10c823c566.mockapi.io/teachers/${teacherId}/students/${selectedId}`
                    : `https://691309fe52a60f10c823c566.mockapi.io/students/${selectedId}`,
                studentData
            );
            studentsCache = studentsCache.map(s => s.id === selectedId ? { ...s, ...studentData } : s);
        } else {
            const res = await axios.post(
                teacherId
                    ? `https://691309fe52a60f10c823c566.mockapi.io/teachers/${teacherId}/students`
                    : `https://691309fe52a60f10c823c566.mockapi.io/students`,
                studentData
            );
            studentsCache.push(res.data);
        }

        outerModal.classList.add("hidden");
        resetForm();
        selectedId = null;
        renderStudents();
    } catch (err) {
        console.log(err);
        alert("Failed to save student");
    }
});

// EDIT STUDENT
async function editStudent(id) {
    outerModal.classList.remove("hidden");
    selectedId = id;

    try {
        let url = teacherId
            ? `https://691309fe52a60f10c823c566.mockapi.io/teachers/${teacherId}/students/${id}`
            : `https://691309fe52a60f10c823c566.mockapi.io/students/${id}`;

        const res = await axios.get(url);
        let data = res.data;

        innerModal[0].value = data.firstname;
        innerModal[1].value = data.lastname;
        innerModal[2].value = data.phone;
        innerModal[3].value = data.email;
        innerModal[4].value = data.age;
        innerModal[5].value = data.experience;
        innerModal[6].value = data.grade;
        innerModal[7].value = data.avatar;
        innerModal[8].value = data.rating;
        innerModal[9].value = data.profession;
        innerModal[10].value = data.telegram;
        innerModal[11].checked = data.gender;

    } catch (err) {
        console.log(err);
        alert("Failed to load student for editing");
    }
}

// SEARCH FUNCTIONALITY
function filterStudents() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderStudents();
        return;
    }

    const filtered = studentsCache.filter(student =>
        student.firstname.toLowerCase().includes(query) ||
        student.lastname.toLowerCase().includes(query) ||
        (student.email && student.email.toLowerCase().includes(query)) ||
        (student.profession && student.profession.toLowerCase().includes(query)) ||
        (student.telegram && student.telegram.toLowerCase().includes(query))
    );

    renderStudents(filtered);
}

searchInput.addEventListener("input", filterStudents);
searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    filterStudents();
});

// INITIAL FETCH
getStudents();

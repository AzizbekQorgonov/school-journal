let teachers = document.getElementById("teachers");
let addTeachers = document.getElementById("add-teachers");
let outerModal = document.getElementById("outer-modal");
let innerModal = document.getElementById("inner-modal");
let teachersCache = [];
let select = null;

// SEARCH
const searchInput = document.getElementById("default-search");
const searchBtn = document.querySelector("button[type='submit']");

// OPEN MODAL
addTeachers.addEventListener("click", () => {
    outerModal.classList.remove("hidden");
});

// CLOSE MODAL
outerModal.addEventListener("click", () => {
    outerModal.classList.add("hidden");
    resetForm();
    select = null;
});

innerModal.addEventListener("click", e => e.stopPropagation());

// RESET FORM
function resetForm() {
    Array.from(innerModal.elements).forEach(el => {
        if (el.type === "checkbox") el.checked = false;
        else el.value = "";
    });
}

// RENDER TEACHERS
function renderTeachers(data = teachersCache) {
    teachers.innerHTML = "";
    if (!data.length) {
        teachers.innerHTML = "<p class='col-span-full text-center text-white'>No teachers found</p>";
        return;
    }

    data.forEach(el => {
        teachers.innerHTML += `
<div class="max-w-[350px] w-full bg-gradient-to-br from-blue-700 via-sky-400 to-lime-200 text-white rounded-xl shadow-lg p-5 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
    <img class="w-24 h-24 rounded-full mb-3 border-2 border-white shadow" src="${el.avatar}" alt="Teacher">
    <h5 class="text-xl font-bold mb-1">${el.firstname} ${el.lastname}</h5>
    <span class="text-sm mb-3">${el.profession || 'No Profession'}</span>
    <div class="flex gap-2 mt-2">
        <a href="../pages/students.html?teacherId=${el.id}" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition">Students</a>
        <button onclick="editTeachers(${el.id})" class="edit-btn py-2 px-4 bg-white text-black rounded-lg hover:bg-blue-100 duration-200">Edit</button>
        <button onclick="deleteTeachers(${el.id})" class="delete-btn py-2 px-4 bg-white text-red-600 rounded-lg hover:bg-red-100 duration-200">Delete</button>
    </div>
</div>`;
    });
}

// GET TEACHERS
async function getTeachers() {
    try {
        const res = await axios.get("https://691309fe52a60f10c823c566.mockapi.io/teachers");
        teachersCache = res.data;
        renderTeachers();
    } catch (err) {
        console.log(err);
        teachers.innerHTML = "<p class='col-span-full text-center text-white'>Error loading teachers</p>";
    }
}

// DELETE TEACHER
async function deleteTeachers(id) {
    try {
        await axios.delete(`https://691309fe52a60f10c823c566.mockapi.io/teachers/${id}`);
        getTeachers();
    } catch (err) {
        console.log(err);
    }
}

// ADD / EDIT SUBMIT
innerModal.addEventListener("submit", async e => {
    e.preventDefault();
    let options = {};
    Array.from(innerModal.elements).forEach(el => {
        if (el.type !== "submit") {
            options[el.id] = el.type === "checkbox" ? el.checked : el.value;
        }
    });

    try {
        if (select) {
            await axios.put(`https://691309fe52a60f10c823c566.mockapi.io/teachers/${select}`, options);
        } else {
            await axios.post(`https://691309fe52a60f10c823c566.mockapi.io/teachers`, options);
        }
        outerModal.classList.add("hidden");
        getTeachers();
        resetForm();
        select = null;
    } catch (err) {
        console.log(err);
    }
});

// EDIT TEACHER
async function editTeachers(id) {
    outerModal.classList.remove("hidden");
    select = id;
    try {
        const res = await axios.get(`https://691309fe52a60f10c823c566.mockapi.io/teachers/${id}`);
        for (let key in res.data) {
            const el = innerModal.querySelector(`#${key}`);
            if (el) el.type === "checkbox" ? el.checked = res.data[key] : el.value = res.data[key];
        }
    } catch (err) {
        console.log(err);
    }
}

// SEARCH FUNCTION
function filterTeachers() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = teachersCache.filter(t =>
        t.firstname.toLowerCase().includes(query) ||
        t.lastname.toLowerCase().includes(query) ||
        (t.email && t.email.toLowerCase().includes(query)) ||
        (t.profession && t.profession.toLowerCase().includes(query))
    );
    renderTeachers(query ? filtered : teachersCache);
}

searchInput.addEventListener("input", filterTeachers);
searchBtn.addEventListener("click", e => {
    e.preventDefault();
    filterTeachers();
});

// INITIAL FETCH
getTeachers();

async function updateSections() {
    const curriculumId = document.getElementById('curriculum_id').value;
    const sectionSelect = document.getElementById('section_id');

    // Clear existing options
    sectionSelect.innerHTML = '';

    let sections = [];
    if (curriculumId === '1') {
        sections = [
            { id: 1, name: 'CS1' },
            
        ];
    } else if (curriculumId === '2') {
        sections = [
            { id: 3, name: 'IT1' },
            { id: 4, name: 'IT2' }
        ];
    }

    // Populate section options
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        sectionSelect.appendChild(option);
    });
}

// Handle form submission
// Handle form submission
document.getElementById('add-student-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        id: document.getElementById('id').value, // เพิ่มการส่ง `id`
        prefix_name: document.getElementById('prefix_name').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        date_of_birth: document.getElementById('date_of_birth').value,
        sex: document.getElementById('sex').value,
        curriculum_id: document.getElementById('curriculum_id').value,
        previous_school: document.getElementById('previous_school').value,
        address: document.getElementById('address').value,
        telephone: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        line_id: document.getElementById('line_id').value,
        status: document.getElementById('status').value,
        section_id: document.getElementById('section_id').value,
    };

    try {
        const response = await fetch('/add-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert('Student added successfully');
            document.getElementById('add-student-form').reset();
        } else {
            alert('Failed to add student');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding student');
    }
});


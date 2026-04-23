async function submitComplaint(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const description = document.querySelector('textarea').value;
    const title = document.querySelector('input[type="text"]').value;

    const formData = new FormData();
    formData.append('student_id', user.user_id);
    formData.append('title', title);
    formData.append('description', description);

    try {
        // AI Endpoint call ho raha hai
        const response = await fetch('http://127.0.0.1:8000/submit-complaint-ai', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        alert(`Complaint Submitted! AI Priority: ${result.ai_priority}`);
        window.location.href = 'student_dashboard.html';
    } catch (error) {
        alert("Error connecting to AI module");
    }
}
// Signup Functionality
async function handleSignup(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
        const response = await fetch('http://127.0.0.1:8000/signup', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        alert(result.message);
        if (result.status === "success") window.location.href = "login.html";
    } catch (error) {
        console.error("Error:", error);
    }
}

// Login Functionality
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
        const response = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (response.ok) {
            // LocalStorage mein user data save karna
            localStorage.setItem('user', JSON.stringify(result));
            // Role base redirection
            if (result.role === 'Admin') window.location.href = 'admin_dashboard.html';
            else window.location.href = 'student_dashboard.html';
        } else {
            alert("Invalid Email or Password");
        }
    } catch (error) {
        alert("Server not responding!");
    }
}
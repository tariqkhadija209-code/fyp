// Stripe ki Public Key yahan ayegi
const stripe = Stripe('your_publishable_key_here'); 
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // 1. Backend se "Payment Intent" mangwana
    const response = await fetch('https://hostelflow-production-e1ce.up.railway.app/create-payment-intent', { method: 'POST' });
    const { clientSecret } = await response.json();

    // 2. Stripe ke zariye payment confirm karna
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: cardElement,
            billing_details: { name: document.getElementById('card-name').value }
        }
    });

    if (error) {
        document.getElementById('card-errors').textContent = error.message;
    } else {
        if (paymentIntent.status === 'succeeded') {
            alert("Payment Successful! Fee Updated in Database.");
            window.location.href = 'student_dashboard.js';
        }
    }
});
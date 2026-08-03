const admin = require('firebase-admin');
const emailjs = require('@emailjs/nodejs');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});

const db = admin.firestore();

async function runDailyCheck() {
    try {
        const snapshot = await db.collection('inventory').get();
        const inventoryItems = [];
        snapshot.forEach((doc) => {
            inventoryItems.push(doc.data());
        });

        const today = new Date();
        const expiringItems = inventoryItems.filter(item => {
            const expiry = new Date(item.expiryDate);
            const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 3;
        });

        if (expiringItems.length === 0) {
            console.log("No items expiring soon.");
            return;
        }

        let messageBody = "⚠️ Automated Daily Alert: The following items are expiring soon:\n\n";
        expiringItems.forEach(item => {
            messageBody += `• ${item.name} (Expires: ${item.expiryDate})\n`;
        });
        // Replace the URL below with your actual dashboard link (e.g., GitHub Pages link or local server link)
        messageBody += "\nAccess your dashboard here: https://abdulrahimlindongan03-coder.github.io/Grocery-Inventory/";

        const templateParams = {
            to_email: "rmlinventory2026@gmail.com",
            to_name: "Abdulrahim",
            message: messageBody
        };

        await emailjs.send(
            'service_0jkjrh8', 
            'template_icemnt4', 
            templateParams, 
            {
                publicKey: 's9JVqJECJ6GtFy_70',
                privateKey: process.env.EMAILJS_PRIVATE_KEY
            }
        );
        console.log("Daily expiry alert email sent successfully!");
    } catch (error) {
        console.error("Error running daily expiry check:", error);
        process.exit(1);
    }
}

runDailyCheck();

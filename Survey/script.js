let currentStep = 0;
// PASTIKAN API_URL INI ADALAH URL WEB APP GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbzgyYBspAWmYrW19Wpn5wHBnAjZQtH2c_Mf1dnLQ0fPF8iM9Y6awZFIV5ypV4CBEwcr/exec";

// --- Pindah Step ---
function nextStep() {
    const steps = document.querySelectorAll(".question-step");

    if (currentStep < steps.length) {
        // Animasi keluar step sekarang
        steps[currentStep].classList.add("fade-out-slide");

        setTimeout(() => {
            // Sembunyikan step saat ini
            steps[currentStep].classList.remove("active", "fade-out-slide");
            currentStep++;

            // Jika masih ada step berikutnya (termasuk step final)
            if (currentStep < steps.length) {
                // Tampilkan step berikutnya
                steps[currentStep].classList.add("active");
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Opsional: Scroll ke atas
            }
            // Catatan: Jika currentStep = steps.length, maka survei selesai.

        }, 450);
    }
}

// --- Wrapper / Fungsi Tombol ---
function sendAnswer(question, answer) {
    // Tunda perpindahan step sampai pengiriman data selesai (success/error)
    sendVote(question, answer);
}

// --- Kirim Data ke Google Sheets ---
async function sendVote(question, answer) {
    const statusDiv = document.getElementById("status");
    
    // Fungsi utilitas untuk mendapatkan informasi browser
    const getClientInfo = () => {
        const ua = navigator.userAgent;
        let browser = "Other";
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";

        let device = "Desktop";
        if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
             device = "Mobile";
        }
        
        return {
            device: device + ' (' + (navigator.platform || "Unknown Platform") + ')',
            browser: browser,
            userAgent: ua
        };
    };

    statusDiv.innerHTML = "Mengirim jawaban...";
    statusDiv.style.color = "#333";

    const info = getClientInfo();

    const payload = {
        question: question,
        answer: answer,
        device: info.device,
        browser: info.browser,
        userAgent: info.userAgent
    };

    try {
        await fetch(
            API_URL,
            {
                method: "POST",
                // Menggunakan mode: 'no-cors' untuk mengatasi pemblokiran Live Server/Hosting Statis
                mode: 'no-cors', 
                body: JSON.stringify(payload)
            }
        );

        // Jika fetch berhasil tanpa network error (dianggap sukses karena no-cors)
        statusDiv.innerHTML = "Jawaban berhasil dikirim!";
        statusDiv.style.color = "#2e7d32";

        // PINDAH KE STEP SELANJUTNYA HANYA JIKA PENGIRIMAN BERHASIL
        nextStep(); 

    } catch (err) {
        // Ini menangkap error jaringan (internet mati, URL salah, dll.)
        console.error("Fetch Error:", err);
        statusDiv.innerHTML = "Gagal mengirim. Coba lagi ya.";
        statusDiv.style.color = "#d32f2f";
    }
}

// Inisialisasi: Pastikan langkah pertama aktif saat dimuat
document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll(".question-step");
    if (steps.length > 0) {
        steps[0].classList.add('active');
    }
});

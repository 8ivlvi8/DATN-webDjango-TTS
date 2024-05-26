// Function để lấy CSRF token từ cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



function fetchAudio() {
    const url = 'http://letam.myftp.org:8686/api/tts_api/getaudiostream/';
    const requestBody = {
        text: document.getElementById('inputtext').value,
        voice: 'vi-VN-HoaiMyNeural'
    };
    // Get CSRF token từ cookie
    const csrftoken = getCookie('csrftoken');

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken // Bao gồm CSRF token trong headers
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch audio from API');
            }
            return response.blob(); // Convert response to Blob
        })
        .then(blob => {
            const audioPlayer = document.getElementById('audioPlayer');
            const audioURL = URL.createObjectURL(blob); // Create URL from Blob
            audioPlayer.src = audioURL;
            audioPlayer.play(); // Play audio
        })
        .catch(error => {
            console.error('Error playing audio:', error);
        });
}

// Event listener for the button to fetch text
const fetchButton = document.getElementById('convertBtn');
fetchButton.addEventListener('click', fetchAudio);

// Hàm để lấy CSRF token từ cookie
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
// Lấy đối tượng button Phát
const playAudioButton = document.getElementById('playAudioButton');
// Lấy đối tượng prev_chapter
const prev_chapterButton = document.getElementById('prev_chapter');
// Lấy đối tượng next_chapter
const next_chapterButton = document.getElementById('next_chapter');
// Lấy đối tượng tốc độ phát 
var currentSpeedDisplay = document.getElementById("currentSpeed");
// Lấy đối tượng audioPlayer
var audioPlayer = document.getElementById("audioPlayer");
// Lấy đối tượng tên truyện
var truyen_title = document.getElementById("truyen_title");
// Lấy đối tượng tên chapter
var chapter_title = document.getElementById("chapter_title");
// Lấy đối tượng iframe
var iframe = document.getElementById("iframeTruyenfull");

// Lấy đối tượng input
var urlInput = document.getElementById("urlInput");
// Kiểm tra xem đã có url trong localStorage chưa
var storedUrl = localStorage.getItem("savedUrl");
// Nếu có dữ liệu trong localStorage, gán nó cho input
if (storedUrl)
    urlInput.value = storedUrl;
else
    urlInput.value = "https://truyenfull.vn/";
function updateStoredUrl() {
    localStorage.setItem("savedUrl", urlInput.value);
}
// Lắng nghe sự kiện input thay đổi
urlInput.addEventListener("input", updateStoredUrl);

// Lấy đối tượng tự động phát
var autoPlay = document.getElementById("autoPlay");
// Kiểm tra xem đã có autoPlay trong localStorage chưa
var autoPlayValue = localStorage.getItem("autoPlay");
// Nếu có dữ liệu trong localStorage, cập nhật checkbox
if (autoPlayValue !== null)
    autoPlay.checked = (autoPlayValue === "true");
else
    autoPlay.checked = false;
function updateAutoPlay() {
    // Lưu trạng thái của checkbox vào localStorage
    localStorage.setItem("autoPlay", autoPlay.checked);
}
// Lắng nghe sự kiện change thay đổi
autoPlay.addEventListener("change", updateAutoPlay);

// Đặt tốc độ phát mặc định của audioPlayer khi trang được tải
audioPlayer.playbackRate = 1.6;
currentSpeedDisplay.textContent = audioPlayer.playbackRate.toFixed(1); // Hiển thị tốc độ phát hiện tại
// Function để giảm tốc độ phát
function decreaseSpeed() {
    if (audioPlayer.playbackRate > 1) {
        audioPlayer.playbackRate -= 0.1;
        currentSpeedDisplay.textContent = audioPlayer.playbackRate.toFixed(1);
    }
}
// Function để tăng tốc độ phát
function increaseSpeed() {
    if (audioPlayer.playbackRate < 2.5) {
        audioPlayer.playbackRate += 0.1;
        currentSpeedDisplay.textContent = audioPlayer.playbackRate.toFixed(1);
    }
}
// Hàm để hiển thị biểu tượng loading
function showLoader() {
    playAudioButton.style.display = 'none';
    document.getElementById('loader').style.display = 'block';
}
// Hàm để ẩn biểu tượng loading
function hideLoader() {
    document.getElementById('loader').style.display = 'none';
    playAudioButton.style.display = 'block';
}


let textData = []; // Biến lưu trữ dữ liệu văn bản
let currentIndex = 0; // Chỉ số để theo dõi văn bản hiện đang được phát
let prev_chap_url = ''; // Biến lưu trữ URL của chương trước
let next_chap_url = ''; // Biến lưu trữ URL của chương sau

// Hàm để fetch văn bản từ API
function fetchText() {
    audioPlayer.pause();
    updateIframeSrc();
    const url = 'http://letam.myftp.org:8686/api/tts_api/gettext/';
    const requestBody = {
        url: urlInput.value,
        element: 'chapter-c'
    };
    showLoader();
    prev_chapterButton.setAttribute('disabled', true);
    next_chapterButton.setAttribute('disabled', true);
    // Lấy CSRF token từ cookie
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
                throw new Error('Failed to fetch text from API');
            }
            return response.json();
        })
        .then(responseData => {
            textData = responseData.extracted_text;
            prev_chap_url = responseData.prev_chap_url;
            next_chap_url = responseData.next_chap_url;
            chapter_title.innerText = responseData.chapter_title;
            truyen_title.innerText = "Tên truyện: " + responseData.truyen_title;
            prev_chapterButton.removeAttribute('disabled');
            next_chapterButton.removeAttribute('disabled');
            hideLoader();
            if (autoPlay.checked)
                playAudio();
        })
        .catch(error => {
            console.error('Error fetching text:', error);
            hideLoader(); // Ẩn biểu tượng loading trong trường hợp lỗi
            chapter_title.innerText = "";
            truyen_title.innerText = "Vui lòng dán link truyện vào ô bên dưới!";
        });
}
// Hàm để phát audio từ API
function playAudio() {
    if (currentIndex >= textData.length) {
        console.log('All text data has been played.');
        return;
    }
    showLoader();
    const url = 'http://letam.myftp.org:8686/api/tts_api/getaudiostream/';
    const csrftoken = getCookie('csrftoken'); // Lấy CSRF token từ cookie
    // Mảng để lưu trữ tất cả các Promise fetch audio
    audioPromises = [];
    // Duyệt qua các đoạn văn bản từ currentIndex đến cuối văn bản
    for (let i = currentIndex; i < textData.length; i++) {
        // Thêm Promise của mỗi đoạn văn bản vào mảng audioPromises
        audioPromises.push(fetchAudio(url, csrftoken, textData[i]));
    }
    // Khởi tạo một hàm async để xử lý việc fetch và phát audio
    async function playAudioSequentially(audioPromises) {
        for (let i = 0; i < audioPromises.length; i++) {
            audioURL = await audioPromises[i]; // Chờ cho đến khi Promise hoàn thành
            // Phát audio của đoạn hiện tại
            audioPlayer.src = audioURL;
            audioPlayer.playbackRate = currentSpeedDisplay.textContent;
            audioPlayer.play();
            // Chờ cho đến khi audio hiện tại kết thúc trước khi chuyển sang đoạn tiếp theo
            await new Promise(resolve => audioPlayer.onended = resolve);
        }
    }
    // Gọi hàm vừa tạo với danh sách Promise
    playAudioSequentially(audioPromises).catch(error => {
        console.error('Error playing audio:', error);
        hideLoader(); // Ẩn biểu tượng loading trong trường hợp lỗi
    }).finally(function () {
        hideLoader();
        urlInput.value = next_chap_url;
        updateIframeSrc();
        updateStoredUrl();
        if (autoPlay.checked)
            location.reload();
    });
}
// Hàm để fetch audio từ API
function fetchAudio(url, csrftoken, text) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Bao gồm CSRF token trong headers
            },
            body: JSON.stringify({
                text: text,
                voice: 'vi-VN-HoaiMyNeural'
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch audio from API');
                }
                return response.blob(); // Chuyển đổi response thành Blob
            })
            .then(blob => {
                const audioURL = URL.createObjectURL(blob); // Tạo URL từ Blob
                resolve(audioURL);
            })
            .catch(error => {
                console.error('Error fetching audio:', error);
                reject(error);
            });
    });
}
function updateIframeSrc() {
    // Lấy giá trị từ input cập nhật src của iframe
    var newUrl = urlInput.value;
    iframe.src = newUrl;
}
function updatePrevNextChapUrl(chap) {
    if (chap == 'prev')
        if (prev_chap_url.includes("truyenfull")) {
            audioPlayer.pause();
            urlInput.value = prev_chap_url
        } else
            alert("Bạn đang ở chương đầu tiên")
    if (chap == 'next')
        if (next_chap_url.includes("truyenfull")) {
            audioPlayer.pause();
            urlInput.value = next_chap_url
        }
        else
            alert("Bạn đang ở chương cuối cùng")
    updateStoredUrl();
    location.reload();
}

urlInput.addEventListener("input", fetchText);
window.onload = function () {
    fetchText();
};

// Kiểm tra URL hiện tại
var currentUrl = window.location.href;

// Kiểm tra xem URL có chứa "/tts" không
if (currentUrl.indexOf("/tts") !== -1) {
	// Thêm class "active" cho liên kết Text-to-speech
	document.querySelector('a[href="/tts"]').setAttribute('style', 'color: white;');
} else if (currentUrl.indexOf("/nghetruyen") !== -1) {
	// Thêm class "active" cho liên kết Nghe truyện
	document.querySelector('a[href="/nghetruyen"]').setAttribute('style', 'color: white;');
}

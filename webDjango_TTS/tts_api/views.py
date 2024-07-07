from django.http import JsonResponse, StreamingHttpResponse
from rest_framework.views import APIView
import requests
from bs4 import BeautifulSoup
import edge_tts


def get_text_by_link_and_element(link, element):
    response = requests.get(link)
    soup = BeautifulSoup(response.text, 'html.parser')
    # Lấy url chapter trước và sau
    prev_chap_url = soup.find('a', {'id': 'prev_chap'}).get('href')
    next_chap_url = soup.find('a', {'id': 'next_chap'}).get('href')
    chapter_title = soup.find('a', {'class': 'chapter-title'}).text
    truyen_title = soup.find('a', {'class': 'truyen-title'}).text
    # Lấy nội dung chapter hiện tại
    chapter_html = soup.find('div', {'class': element}).prettify()
    chapter_soup = BeautifulSoup(chapter_html, 'html.parser')
    # Loại bỏ các thẻ HTML và chỉ giữ lại nội dung văn bản
    text = chapter_soup.get_text(separator="\n", strip=True)
    # Tách văn bản thành các đoạn văn
    doan_van = text.split('\n')
    doan_van_da_tach = []
    doan_van_da_tach.append(truyen_title + '. ' + chapter_title)
    temp = ""
    k = 50
    for cau_van in doan_van:
        temp += cau_van + ' '
        if len(temp) > k:
            k = k + 50
            doan_van_da_tach.append(temp)
            temp = ""
    if temp != "":
        doan_van_da_tach.append(temp)
    # Khởi tạo dictionary để chứa kết quả
    result = {}
    result['prev_chap_url'] = prev_chap_url
    result['next_chap_url'] = next_chap_url
    result['content'] = doan_van_da_tach
    result['chapter_title'] = chapter_title
    result['truyen_title'] = truyen_title
    # Trả về kết quả dưới dạng JSON
    return result


class TTS_API_Get_Text(APIView):
    def post(self, request, format=None):
        url = request.query_params.get('url') or request.data.get('url')
        element = request.query_params.get(
            'element') or request.data.get('element')
        try:
            result = get_text_by_link_and_element(url, element)
            return JsonResponse({'extracted_text': result['content'], 'prev_chap_url': result['prev_chap_url'], 'next_chap_url': result['next_chap_url'], 'chapter_title': result['chapter_title'], 'truyen_title': result['truyen_title']}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


async def generate_audio_stream(text, voice):
    communicate = edge_tts.Communicate(text, voice, pitch="+5Hz", volume="+80%")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]


class TTS_API_Get_Audio_Stream(APIView):
    def post(self, request, format=None):
        text = request.query_params.get('text') or request.data.get('text')
        voice = request.query_params.get('voice') or request.data.get('voice')
        response = StreamingHttpResponse(generate_audio_stream(
            text, voice), content_type='audio/mpeg')
        return response

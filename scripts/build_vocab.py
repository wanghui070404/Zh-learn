import json
import os
import urllib.request
import ssl

# Bỏ qua kiểm tra SSL (nếu gặp vấn đề chứng chỉ)
ssl._create_default_https_context = ssl._create_unverified_context

def download_json(url, filename):
    """Tải file JSON từ URL và lưu vào thư mục tạm."""
    print(f"Đang tải {filename}...")
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode('utf-8'))
        print(f"Đã tải xong {filename}")
        return data
    except Exception as e:
        print(f"Lỗi khi tải {filename}: {e}")
        return None

def main():
    # URL nguồn dữ liệu
    # 1. Danh sách từ vựng HSK 3.0 đầy đủ (có nghĩa tiếng Anh)
    hsk_url = "https://raw.githubusercontent.com/leonsilicon/hsk3.0/main/HSK3.0_words.json"
    # 2. Dataset Hán-Việt (có nghĩa tiếng Việt cho 768 chữ HSK 1-3)
    hanviet_url = "https://raw.githubusercontent.com/binhbuithithanh/hanzi-sino-vietnamese/main/data/characters.json"

    # Tải dữ liệu
    hsk_data = download_json(hsk_url, "HSK3.0_words.json")
    hanviet_data = download_json(hanviet_url, "characters.json")

    if not hsk_data or not hanviet_data:
        print("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng hoặc URL.")
        return

    # Tạo từ điển tra cứu Hán-Việt: key là chữ Hán, value là thông tin
    hanviet_dict = {item['hanzi']: item for item in hanviet_data}

    merged_vocab = []

    # Duyệt qua danh sách HSK 3.0
    for item in hsk_data:
        # Cấu trúc của leonsilicon/hsk3.0 có thể là list các object hoặc list các string
        # Chúng ta sẽ xử lý linh hoạt
        if isinstance(item, str):
            # Nếu chỉ là chuỗi chữ Hán
            simplified = item
            pinyin = ""
            meaning_en = ""
            level = 0
        elif isinstance(item, dict):
            simplified = item.get('simplified', '')
            pinyin = item.get('pinyin', '')
            meaning_en = ", ".join(item.get('meanings', [])) if item.get('meanings') else item.get('meaning', '')
            level = item.get('level', 0)
        else:
            continue

        # Tìm nghĩa tiếng Việt trong dataset Hán-Việt
        meaning_vi = ""
        hanviet_info = hanviet_dict.get(simplified)
        if hanviet_info:
            meaning_vi = hanviet_info.get('meaningVi', '')
        
        # Nếu không có nghĩa tiếng Việt, tạm dùng nghĩa tiếng Anh
        final_meaning = meaning_vi if meaning_vi else meaning_en

        # Tạo ID duy nhất
        word_id = f"hsk{level}_{simplified}"

        merged_vocab.append({
            "id": word_id,
            "simplified": simplified,
            "pinyin": pinyin,
            "meaningVi": final_meaning,
            "level": level,
            "example": { "zh": "", "pinyin": "", "vi": "" }, # Tạm để trống, sẽ bổ sung sau
            "grammarNote": ""
        })

    # Lưu ra file JSON
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'vocabulary.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(merged_vocab, f, ensure_ascii=False, indent=2)

    print(f"Đã hợp nhất thành công {len(merged_vocab)} từ vựng vào {output_path}")

if __name__ == "__main__":
    main()

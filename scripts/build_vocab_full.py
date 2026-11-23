import json
import urllib.request
import ssl
from deep_translator import GoogleTranslator
import time

ssl._create_default_https_context = ssl._create_unverified_context
translator = GoogleTranslator(source='en', target='vi')

def download_json(url):
    print(f"Đang tải dữ liệu từ {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def main():
    # Tải danh sách HSK 1, 2, 3 (chuẩn HSK 2.0)
    urls = [
        "https://raw.githubusercontent.com/clem109/hsk-vocabulary/master/hsk-vocab-json/hsk-level-1.json",
        "https://raw.githubusercontent.com/clem109/hsk-vocabulary/master/hsk-vocab-json/hsk-level-2.json",
        "https://raw.githubusercontent.com/clem109/hsk-vocabulary/master/hsk-vocab-json/hsk-level-3.json"
    ]
    
    merged_vocab = []
    
    # Thêm một số từ vựng danh từ riêng / địa danh / giao tiếp cơ bản không có trong HSK
    custom_words = [
        {"hanzi": "越南", "pinyin": "Yuènán", "meaning": "Việt Nam", "level": 1},
        {"hanzi": "中国", "pinyin": "Zhōngguó", "meaning": "Trung Quốc", "level": 1},
        {"hanzi": "美国", "pinyin": "Měiguó", "meaning": "Mỹ", "level": 1},
        {"hanzi": "河内", "pinyin": "Hénèi", "meaning": "Hà Nội", "level": 1},
        {"hanzi": "胡志明市", "pinyin": "Húzhìmíng shì", "meaning": "Thành phố Hồ Chí Minh", "level": 1},
        {"hanzi": "你好", "pinyin": "nǐ hǎo", "meaning": "Xin chào", "level": 1},
        {"hanzi": "谢谢", "pinyin": "xièxie", "meaning": "Cảm ơn", "level": 1},
        {"hanzi": "再见", "pinyin": "zàijiàn", "meaning": "Tạm biệt", "level": 1},
    ]

    print(f"Đang dịch các từ tự chọn...")
    for cw in custom_words:
        merged_vocab.append({
            "id": f"custom_{cw['hanzi']}",
            "simplified": cw['hanzi'],
            "pinyin": cw['pinyin'],
            "meaningVi": cw['meaning'],
            "level": cw['level'],
            "example": {"zh": "", "pinyin": "", "vi": ""},
            "grammarNote": ""
        })

    for level, url in enumerate(urls, start=1):
        try:
            data = download_json(url)
            print(f"Đang dịch HSK {level} ({len(data)} từ)...")
            for item in data:
                hanzi = item.get('hanzi', '')
                pinyin = item.get('pinyin', '')
                meaning_en = item.get('translation', '')
                
                if not hanzi or not meaning_en:
                    continue

                # Dịch sang tiếng Việt (có delay 0.1s để tránh bị Google chặn)
                try:
                    meaning_vi = translator.translate(meaning_en)
                    time.sleep(0.1) 
                except Exception as e:
                    meaning_vi = meaning_en # Fallback to English if fail

                merged_vocab.append({
                    "id": f"hsk{level}_{hanzi}",
                    "simplified": hanzi,
                    "pinyin": pinyin,
                    "meaningVi": meaning_vi,
                    "level": level,
                    "example": {"zh": "", "pinyin": "", "vi": ""},
                    "grammarNote": ""
                })
        except Exception as e:
            print(f"Lỗi tải HSK {level}: {e}")

    # Lưu ra file
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'vocabulary.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(merged_vocab, f, ensure_ascii=False, indent=2)

    print(f"HOÀN TẤT! Đã tạo kho {len(merged_vocab)} từ vựng tại {output_path}")

if __name__ == "__main__":
    import os
    main()

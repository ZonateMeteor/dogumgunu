# README
Bu dalda site iskeleti oluşturuldu: şiirler, itiraflar, anılar, müzikler, oyunlar, etimoloji, temalar, geri bildirim.

Nasıl düzenlenir:
- İçerikler pages/* içindeki .json dosyalarına eklenir.
- Müzik dosyalarını /assets/muzikler/ içine koyun ve pages/muzikler/muzikler.json dosyasındaki "file" alanını dosya adıyla eşleştirin.
- Kapak görsellerini /assets/muzik-kapaklari/ içine koyun ve muzikler.json'daki "cover" alanını dosya adıyla eşleştirin.

Yerel test:
- Repo kökünde `python -m http.server 8000` çalıştırıp http://localhost:8000 adresinden test edebilirsiniz.

Notlar:
- Butonlarda metin seçimi ve yanlışlıkla sayfa yenilenmesi/çekerek yenileme (mobile) önlenmeye çalışıldı (overscroll-behavior ve user-select ayarları). Eğer halen mobilde sorun olursa bildir.

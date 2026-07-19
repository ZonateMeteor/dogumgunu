# README
Bu repo: doğum günü sitesi iskeleti.

Nasıl düzenlenir:
- İçerikler pages/* içindeki .json dosyalarına eklenir.
- Müzik dosyalarını assets/muzikler/ içine koyun ve pages/muzikler/muzikler.json dosyasındaki "file" alanını dosya adıyla eşleştirin.
- Kapak görsellerini assets/muzik-kapaklari/ içine koyun ve muzikler.json içindeki "cover" alanını dosya adıyla eşleştirin.

Yerel test:
- Repo kökünde `python -m http.server 8000` çalıştırıp http://localhost:8000/ adresinden test edebilirsiniz.

Notlar:
- Site hash-routing kullanır (#/siirler vb.) — bu nedenle doğrudan URL ile gezinme 404 sorununu önler.

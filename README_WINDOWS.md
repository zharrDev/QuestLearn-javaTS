# Cara Menjalankan di Windows (PowerShell)

## Masalah: `.\mvnw.cmd` not recognized

Itu karena file wrapper belum ada di versi awal. Sudah diperbaiki di zip terbaru. Tapi kamu tetap butuh **Maven** terinstall.

---

## Opsi 1: Install Maven (Recommended, 2 menit)

Jika punya Chocolatey (paling gampang):
```
choco install maven
# tutup PowerShell, buka lagi, cek:
mvn -version
```

Jika tidak, manual:
1. Download Maven dari https://maven.apache.org/download.cgi (apache-maven-3.9.6-bin.zip)
2. Extract ke `C:\apache-maven`
3. Tambah ke PATH:
```
$env:Path += ";C:\apache-maven\bin"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\apache-maven\bin", "User")
```
4. Restart PowerShell, cek:
```
mvn -version
```

Lalu jalankan backend:
```
cd C:\Users\dell\Documents\PROJEK\questlearn\backend
mvn spring-boot:run
# atau
.\mvnw.cmd spring-boot:run
```

Backend akan jalan di http://localhost:8080
- API: http://localhost:8080/api/public/dunia
- Swagger: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

## Opsi 2: Tanpa Maven — Pakai JAR langsung

Jika sudah pernah `mvn package` sekali:
```
cd backend
java -jar target\questlearn-backend-0.0.1-SNAPSHOT.jar
```

## Opsi 3: Jalankan Frontend Saja (Tanpa Backend, Mode Demo)

Frontend punya mock data fallback, jadi tetap bisa demo meski backend mati:

```
cd C:\Users\dell\Documents\PROJEK\questlearn\frontend
npm install
npm run dev
# Buka http://localhost:5173
# Login:
# Siswa: siswa@demo.id / demo123
# Admin: admin@questlearn.id / admin123
# Atau email apapun mengandung @ akan work di mode demo
```

## Fix Error Execution Policy

Kalau muncul error running scripts is disabled:
```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Struktur yang Benar Setelah Extract

```
questlearn/
├── backend/
│   ├── mvnw
│   ├── mvnw.cmd      <-- ini file wrapper, harus ada
│   ├── .mvn/wrapper/
│   ├── pom.xml
│   └── src/...
├── frontend/
│   ├── package.json
│   └── src/...
└── README.md
```

## Cek Java

Pastikan Java 11 atau 17+ terinstall:
```
java -version
```

Jika belum:
- Download Adoptium https://adoptium.net/ (Java 17 recommended)

## Masih Error? Pakai bat files

Double click:
- start-backend.bat
- start-frontend.bat

/* =========================
   DATABASE MYSQL (AMAN UNTUK HP & LAPTOP)
========================= */

async function simpanKeDatabase() {
    // 1. CEK: Jika BUKAN di laptop (artinya di HP / GitHub Pages), 
    // langsung hentikan fungsi database secara diam-diam (tanpa alert error merah).
    if (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
        console.log("Mode HP / GitHub Pages: Lewati database MySQL.");
        return false;
    }

    console.log("🔥 FUNGSI SIMPAN MYSQL DIPANGGIL DI LAPTOP");

    if (
        !data.nama ||
        !data.badge ||
        data.badge === "Belum Diisi"
    ) {
        return false;
    }

    const payload = {
        nama: data.nama,
        badge: data.badge,
        level: level(),
        hitung: Number(data.skor.hitung || 0),
        buah: Number(data.skor.buah || 0),
        tic: Number(data.skor.tic || 0),
        xp: Number(data.xp || 0)
    };

    try {
        const response = await fetch("simpan_data.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const teks = await response.text();
        console.log("Jawaban PHP:", teks);

        const hasil = JSON.parse(teks);

        if (hasil.success) {
            console.log("✅ DATA BERHASIL MASUK MYSQL:", hasil.data);
            return true;
        }

        alert(
            "❌ Data gagal masuk database!\n\n" +
            (hasil.message || "Tidak diketahui")
        );

        return false;

    } catch (error) {
        alert(
            "❌ Gagal terhubung ke database!\n\n" +
            error.message
        );

        return false;
    }
}
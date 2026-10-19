// Cek apakah game dibuka di Laptop (XAMPP) atau di HP (GitHub Pages)
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const KEY = "gameCenterWhiteV2";
const BOARD_KEY = "gameCenterScoresWhiteV2";

/* =========================
   DATA
========================= */

function tanggalHariIni() {
    const d = new Date();

    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}

function dataAwal() {
    return {
        nama: "Pemain Baru",
        badge: "Belum Diisi",
        xp: 0,

        skor: {
            hitung: 0,
            buah: 0,
            tic: 0
        },

        misiTanggal: tanggalHariIni(),

        misi: {
            hitung: false,
            buah: false,
            tic: false
        }
    };
}

let data;

try {
    data = JSON.parse(localStorage.getItem(KEY)) || dataAwal();
} catch (e) {
    data = dataAwal();
}

data.skor = data.skor || {
    hitung: 0,
    buah: 0,
    tic: 0
};

data.misi = data.misi || {
    hitung: false,
    buah: false,
    tic: false
};

data.xp = Number(data.xp) || 0;


/* =========================
   VARIABEL GAME
========================= */

let hitungTimer = null;
let buahTimer = null;
let spawnTimer = null;

let hitungAktif = false;
let buahAktif = false;
let ticAktif = false;

let hitungScore = 0;
let buahScore = 0;

let hitungTime = 60;
let buahTime = 60;

let angkaA = 0;
let angkaB = 0;
let operator = "+";

let board = Array(9).fill("");


/* =========================
   XP & LEVEL
========================= */

function level() {
    return Math.floor(data.xp / 300) + 1;
}

function xpDalamLevel() {
    return data.xp % 300;
}

function totalSkor() {
    return (
        Number(data.skor.hitung || 0) +
        Number(data.skor.buah || 0) +
        Number(data.skor.tic || 0)
    );
}


/* =========================
   DATABASE MYSQL
========================= */

async function simpanKeDatabase() {
    console.log("🔥 FUNGSI SIMPAN MYSQL DIPANGGIL");

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


/* =========================
   PENYIMPANAN
========================= */

function simpanData() {

    localStorage.setItem(
        KEY,
        JSON.stringify(data)
    );
}

/* =========================
   PERIKSA HARI
========================= */

function periksaHari() {

    if (data.misiTanggal !== tanggalHariIni()) {

        data.misiTanggal = tanggalHariIni();

        data.misi = {
            hitung: false,
            buah: false,
            tic: false
        };

        simpanData();
    }
}


/* =========================
   RENDER UTAMA
========================= */

function render() {

    periksaHari();

    /* PROFIL */

    document.getElementById(
        "tampilNama"
    ).textContent = data.nama;

    document.getElementById(
        "tampilBadge"
    ).textContent = data.badge;

    document.getElementById(
        "tampilLevel"
    ).textContent = level();

    document.getElementById(
        "tampilXP"
    ).textContent = data.xp;

    document.getElementById(
        "teksXP"
    ).textContent =
        xpDalamLevel() + " / 300 XP";

    document.getElementById(
        "progressXP"
    ).style.width =
        (xpDalamLevel() / 300 * 100) + "%";


    /* BERANDA */

    document.getElementById(
        "homeNama"
    ).textContent = data.nama;

    document.getElementById(
        "homeBadge"
    ).textContent = data.badge;

    document.getElementById(
        "homeLevel"
    ).textContent = level();

    document.getElementById(
        "homeXP"
    ).textContent = data.xp;

    document.getElementById(
        "homeTeksXP"
    ).textContent =
        xpDalamLevel() + " / 300 XP";

    document.getElementById(
        "homeProgressXP"
    ).style.width =
        (xpDalamLevel() / 300 * 100) + "%";


    /* SKOR PROFIL */

    document.getElementById(
        "skorHitungProfil"
    ).textContent =
        data.skor.hitung;

    document.getElementById(
        "skorBuahProfil"
    ).textContent =
        data.skor.buah;

    document.getElementById(
        "skorTicProfil"
    ).textContent =
        data.skor.tic;

    renderMisi();
}


/* =========================
   NAVIGASI TAB
========================= */

document.querySelectorAll(
    ".nav-btn"
).forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            document.querySelectorAll(
                ".nav-btn"
            ).forEach(b =>
                b.classList.remove("active")
            );

            btn.classList.add("active");

            const tabId =
                btn.dataset.tab;

            document.querySelectorAll(
                ".tab"
            ).forEach(tab =>
                tab.classList.remove("active")
            );

            document.getElementById(
                tabId
            ).classList.add("active");
        }
    );
});


/* =========================
   BUKA GAME
========================= */

function tutupSemuaPanelGame() {

    document.querySelectorAll(
        ".game-panel"
    ).forEach(p =>
        p.classList.remove("active")
    );
}


document.querySelectorAll(
    "[data-open-game]"
).forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            tutupSemuaPanelGame();

            const id =
                btn.dataset.openGame;

            const panel =
                document.getElementById(
                    "panel" +
                    id.charAt(0).toUpperCase() +
                    id.slice(1)
                );

            if (panel) {

                panel.classList.add(
                    "active"
                );

                panel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            document.querySelectorAll(
                ".nav-btn"
            ).forEach(b =>
                b.classList.remove("active")
            );

            const gameNav =
                document.querySelector(
                    '[data-tab="game"]'
                );

            if (gameNav) {
                gameNav.classList.add("active");
            }

            document.querySelectorAll(
                ".tab"
            ).forEach(t =>
                t.classList.remove("active")
            );

            const gameTab =
                document.getElementById("game");

            if (gameTab) {
                gameTab.classList.add("active");
            }
        }
    );
});


/* =========================
   PROFIL
========================= */

/* =========================
   PROFIL
========================= */

document.getElementById(
    "simpanProfil"
).addEventListener(
    "click",
    async () => {

        const nama =
            document.getElementById(
                "namaPemain"
            ).value.trim();

        const badge =
            document.getElementById(
                "badgePemain"
            ).value.trim();

        if (!nama || !badge) {

            alert(
                "⚠️ Nama dan Badge harus diisi!"
            );

            return;
        }

        data.nama = nama;
        data.badge = badge;

        // Simpan ke localStorage
        simpanData();

        // Perbarui tampilan
        render();
        perbaruiPapan();

        // Kirim ke MySQL (HANYA JIKA DIBUKA DI LAPTOP / LOCALHOST)
if (isLocalhost) {
    const berhasil = await simpanKeDatabase();
    if (berhasil) {
        alert(" Data berhasil disimpan ke MySQL!");
    }
}

/* =========================
   MISI HARIAN
========================= */

function renderMisi() {

    const daftar = [

        [
            "hitung",
            "🧮 Hitung Cepat",
            "Raih skor minimal 100"
        ],

        [
            "buah",
            "🍉 Penghancur Buah",
            "Raih skor minimal 50"
        ],

        [
            "tic",
            "⭕ Tic Tac Toe",
            "Menangkan satu pertandingan"
        ]

    ];

    document.getElementById(
        "daftarMisi"
    ).innerHTML = daftar.map(
        ([id, nama, desc]) => `

        <div class="mission ${
            data.misi[id]
                ? "done"
                : ""
        }">

            <div>

                <strong>
                    ${nama}
                </strong>

                <p>
                    ${desc}
                </p>

            </div>

            <span class="mission-status">

                ${
                    data.misi[id]
                        ? "✅ Selesai"
                        : "🎁 +70 XP"
                }

            </span>

        </div>

    `).join("");
}


function klaimMisi(
    game,
    berhasil
) {

    periksaHari();

    if (
        berhasil &&
        !data.misi[game]
    ) {

        data.misi[game] = true;

        data.xp += 70;
    }
}


/* =========================
   CATAT HASIL GAME
========================= */

async function catatHasil(
    game,
    skor,
    misiBerhasil = false
) {

    if (skor <= 0) {
        return;
    }

    data.skor[game] += skor;

    /* XP GAME */
    data.xp += 50;

    /* XP MISI */
    klaimMisi(
        game,
        misiBerhasil
    );

    /* SIMPAN LOCAL */
    simpanData();

    /* UPDATE TAMPILAN */
    render();

    perbaruiPapan();

    /* SIMPAN KE MYSQL */
    await simpanKeDatabase();
}
/* =========================
   HITUNG CEPAT
========================= */

function soalBaru() {

    angkaA =
        Math.floor(
            Math.random() * 12
        ) + 1;

    angkaB =
        Math.floor(
            Math.random() * 12
        ) + 1;

    operator =
        Math.random() < 0.5
            ? "+"
            : "-";

    if (
        operator === "-" &&
        angkaB > angkaA
    ) {

        [
            angkaA,
            angkaB
        ] = [
            angkaB,
            angkaA
        ];
    }

    document.getElementById(
        "soalHitung"
    ).textContent =
        `${angkaA} ${operator} ${angkaB} = ?`;
}


document.getElementById(
    "mulaiHitung"
).addEventListener(
    "click",
    () => {

        clearInterval(
            hitungTimer
        );

        hitungScore = 0;
        hitungTime = 60;
        hitungAktif = true;

        document.getElementById(
            "skorHitung"
        ).textContent = "0";

        document.getElementById(
            "waktuHitung"
        ).textContent = "60";

        document.getElementById(
            "pesanHitung"
        ).textContent =
            "Semangat! Jawab sebanyak mungkin.";

        document.getElementById(
            "jawabanHitung"
        ).value = "";

        soalBaru();

        hitungTimer =
            setInterval(
                () => {

                    hitungTime--;

                    document.getElementById(
                        "waktuHitung"
                    ).textContent =
                        hitungTime;

                    if (
                        hitungTime <= 0
                    ) {

                        selesaiHitung();
                    }

                },
                1000
            );
    }
);


function periksaJawaban() {

    if (!hitungAktif) {
        return;
    }

    const benar =
        operator === "+"
            ? angkaA + angkaB
            : angkaA - angkaB;

    const jawaban =
        Number(
            document.getElementById(
                "jawabanHitung"
            ).value
        );

    if (jawaban === benar) {

        hitungScore += 10;

        document.getElementById(
            "pesanHitung"
        ).textContent =
            "✅ Benar! +10 skor";

    } else {

        document.getElementById(
            "pesanHitung"
        ).textContent =
            "❌ Belum tepat!";
    }

    document.getElementById(
        "skorHitung"
    ).textContent =
        hitungScore;

    document.getElementById(
        "jawabanHitung"
    ).value = "";

    soalBaru();
}


document.getElementById(
    "kirimJawaban"
).addEventListener(
    "click",
    periksaJawaban
);


document.getElementById(
    "jawabanHitung"
).addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            periksaJawaban();
        }
    }
);


function selesaiHitung() {

    if (!hitungAktif) {
        return;
    }

    clearInterval(
        hitungTimer
    );

    hitungAktif = false;

    document.getElementById(
        "soalHitung"
    ).textContent =
        "🎉 Permainan selesai!";

    document.getElementById(
        "pesanHitung"
    ).textContent =
        "Skor akhir: " +
        hitungScore;

    if (hitungScore > 0) {

        catatHasil(
            "hitung",
            hitungScore,
            hitungScore >= 100
        );
    }
}


/* =========================
   PENGHANCUR BUAH
========================= */

function buatBuah() {

    if (!buahAktif) {
        return;
    }

    const area =
        document.getElementById(
            "fruitArea"
        );

    const f =
        document.createElement(
            "div"
        );

    const daftarBuah = [
        "🍎",
        "🍊",
        "🍉",
        "🍇",
        "🍓",
        "🍍",
        "🥝",
        "🍒"
    ];

    f.className = "fruit";

    f.textContent =
        daftarBuah[
            Math.floor(
                Math.random() *
                daftarBuah.length
            )
        ];

    f.style.left =
        Math.random() * 85 + "%";

    f.onclick = function () {

        if (
            !buahAktif ||
            f.classList.contains("pop")
        ) {
            return;
        }

        f.classList.add("pop");

        buahScore += 5;

        document.getElementById(
            "skorBuah"
        ).textContent =
            buahScore;

        setTimeout(
            () => f.remove(),
            250
        );
    };

    area.appendChild(f);

    setTimeout(
        () => {

            if (f.parentElement) {
                f.remove();
            }

        },
        4200
    );
}


document.getElementById(
    "mulaiBuah"
).addEventListener(
    "click",
    () => {

        clearInterval(
            buahTimer
        );

        clearInterval(
            spawnTimer
        );

        document.querySelectorAll(
            ".fruit"
        ).forEach(
            f => f.remove()
        );

        buahScore = 0;
        buahTime = 60;
        buahAktif = true;

        document.getElementById(
            "skorBuah"
        ).textContent = "0";

        document.getElementById(
            "waktuBuah"
        ).textContent = "60";

        buatBuah();

        spawnTimer =
            setInterval(
                buatBuah,
                700
            );

        buahTimer =
            setInterval(
                () => {

                    buahTime--;

                    document.getElementById(
                        "waktuBuah"
                    ).textContent =
                        buahTime;

                    if (
                        buahTime <= 0
                    ) {

                        selesaiBuah();
                    }

                },
                1000
            );
    }
);


function selesaiBuah() {

    if (!buahAktif) {
        return;
    }

    clearInterval(
        buahTimer
    );

    clearInterval(
        spawnTimer
    );

    buahAktif = false;

    document.querySelectorAll(
        ".fruit"
    ).forEach(
        f => f.remove()
    );

    if (buahScore > 0) {

        catatHasil(
            "buah",
            buahScore,
            buahScore >= 50
        );
    }

    alert(
        "🍉 Permainan selesai!\nSkor akhir: " +
        buahScore
    );
}


/* =========================
   TIC TAC TOE
========================= */

function pemenang(b) {

    const garis = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (
        const [a, c, d]
        of garis
    ) {

        if (
            b[a] &&
            b[a] === b[c] &&
            b[a] === b[d]
        ) {

            return b[a];
        }
    }

    return b.every(Boolean)
        ? "seri"
        : null;
}


function renderBoard() {

    document.querySelectorAll(
        ".cell"
    ).forEach(
        (cell, i) => {

            cell.textContent =
                board[i];

            cell.disabled =
                !!board[i] ||
                !ticAktif;
        }
    );
}


function akhirTic(hasil) {

    ticAktif = false;

    renderBoard();

    const pesan =
        document.getElementById(
            "statusTic"
        );

    if (hasil === "X") {

        pesan.textContent =
            "🎉 Kamu menang! +1 skor & misi selesai!";

        data.skor.tic += 1;

        data.xp += 50;

        klaimMisi(
            "tic",
            true
        );

        simpanData();

        render();

        perbaruiPapan();

        simpanKeDatabase();

    } else if (hasil === "O") {

        pesan.textContent =
            "🤖 Komputer menang. Coba lagi ya!";

    } else {

        pesan.textContent =
            "🤝 Permainan seri.";
    }
}


function langkahTic(index) {

    if (
        !ticAktif ||
        board[index]
    ) {
        return;
    }

    board[index] = "X";

    renderBoard();

    let hasil =
        pemenang(board);

    if (hasil) {

        akhirTic(hasil);

        return;
    }

    ticAktif = false;

    setTimeout(
        () => {

            const kosong =
                board
                    .map(
                        (v, i) =>
                            v
                                ? null
                                : i
                    )
                    .filter(
                        i =>
                            i !== null
                    );

            if (kosong.length) {

                const pilih =
                    kosong[
                        Math.floor(
                            Math.random() *
                            kosong.length
                        )
                    ];

                board[pilih] = "O";
            }

            hasil =
                pemenang(board);

            if (hasil) {

                akhirTic(hasil);

                return;
            }

            ticAktif = true;

            document.getElementById(
                "statusTic"
            ).textContent =
                "🎯 Giliran kamu!";

            renderBoard();

        },
        400
    );
}


document.getElementById(
    "mulaiTic"
).addEventListener(
    "click",
    () => {

        board =
            Array(9).fill("");

        ticAktif = true;

        document.getElementById(
            "statusTic"
        ).textContent =
            "🎯 Giliran kamu!";

        renderBoard();
    }
);


document.querySelectorAll(
    ".cell"
).forEach(
    cell => {

        cell.addEventListener(
            "click",
            () =>
                langkahTic(
                    Number(
                        cell.dataset.index
                    )
                )
        );
    }
);


/* =========================
   PAPAN PERINGKAT
========================= */

function ambilPapan() {

    try {

        return JSON.parse(
            localStorage.getItem(
                BOARD_KEY
            )
        ) || [];

    } catch {

        return [];
    }
}


function perbaruiPapan() {

    let daftar =
        ambilPapan();

    let pemain =
        daftar.find(
            x =>
                x.nama === data.nama &&
                x.badge === data.badge
        );

    if (!pemain) {

        pemain = {

            nama: data.nama,
            badge: data.badge,

            hitung: 0,
            buah: 0,
            tic: 0,

            total: 0,
            xp: 0,
            level: 1
        };

        daftar.push(
            pemain
        );
    }

    pemain.nama =
        data.nama;

    pemain.badge =
        data.badge;

    pemain.hitung =
        data.skor.hitung;

    pemain.buah =
        data.skor.buah;

    pemain.tic =
        data.skor.tic;

    pemain.total =
        totalSkor();

    pemain.xp =
        data.xp;

    pemain.level =
        level();

    daftar.sort(
        (a, b) =>
            b.total - a.total
    );

    localStorage.setItem(
        BOARD_KEY,
        JSON.stringify(daftar)
    );

    renderPapan();
}


function aman(teks) {

    return String(teks)
        .replace(
            /[&<>"']/g,
            c =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[c])
        );
}


function renderPapan() {

    const daftar =
        ambilPapan().sort(
            (a, b) =>
                b.total - a.total
        );

    document.getElementById(
        "isiPeringkat"
    ).innerHTML =
        daftar.length

            ? daftar.map(
                (x, i) => `

                <tr>

                    <td>
                        ${i + 1}
                    </td>

                    <td>
                        ${aman(x.nama)}
                    </td>

                    <td>
                        ${aman(x.badge)}
                    </td>

                    <td>
                        ${x.level || 1}
                    </td>

                    <td>
                        ${x.hitung || 0}
                    </td>

                    <td>
                        ${x.buah || 0}
                    </td>

                    <td>
                        ${x.tic || 0}
                    </td>

                    <td>
                        <strong>
                            ${x.total || 0}
                        </strong>
                    </td>

                    <td>
                        ${x.xp || 0}
                    </td>

                </tr>

            `
            ).join("")

            :

            `
            <tr>
                <td colspan="9">
                    Belum ada data
                </td>
            </tr>
            `;
}


/* =========================
   HAPUS PAPAN PERINGKAT
========================= */

document.getElementById(
    "hapusPeringkat"
).addEventListener(
    "click",
    () => {

        if (
            confirm(
                "Yakin hapus papan peringkat?"
            )
        ) {

            localStorage.removeItem(
                BOARD_KEY
            );

            renderPapan();

            alert(
                "🏆 Papan peringkat dihapus."
            );
        }
    }
);


/* =========================
   HAPUS SEMUA
========================= */

document.getElementById(
    "hapusSemua"
).addEventListener(
    "click",
    () => {

        if (
            !confirm(
                "Hapus SEMUA data pemain, XP, misi, skor & papan peringkat?"
            )
        ) {
            return;
        }

        clearInterval(
            hitungTimer
        );

        clearInterval(
            buahTimer
        );

        clearInterval(
            spawnTimer
        );

        hitungAktif = false;
        buahAktif = false;
        ticAktif = false;

        localStorage.removeItem(
            KEY
        );

        localStorage.removeItem(
            BOARD_KEY
        );

        data =
            dataAwal();

        document.getElementById(
            "namaPemain"
        ).value = "";

        document.getElementById(
            "badgePemain"
        ).value = "";

        document.querySelectorAll(
            ".fruit"
        ).forEach(
            f => f.remove()
        );

        board =
            Array(9).fill("");

        document.getElementById(
            "statusTic"
        ).textContent =
            "Tekan mulai untuk bermain.";

        renderBoard();

        render();

        renderPapan();

        alert(
            "✅ Semua data berhasil dihapus."
        );
    }
);


/* =========================
   INISIALISASI
========================= */

render();

renderPapan();
console.log("TES SCRIPT BERHASIL");
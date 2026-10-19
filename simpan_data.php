<?php

header("Content-Type: application/json");
require_once "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Data tidak diterima"
    ]);
    exit;
}

$nama   = $data["nama"] ?? "Pemain Baru";
$badge  = $data["badge"] ?? "";
$level  = intval($data["level"] ?? 1);
$hitung = intval($data["hitung"] ?? 0);
$buah   = intval($data["buah"] ?? 0);
$tic    = intval($data["tic"] ?? 0);
$xp     = intval($data["xp"] ?? 0);

/*
   Total skor dihitung dari hasil 3 game,
   bukan dari nilai yang dikirim browser.
*/
$skor = $hitung + $buah + $tic;

if ($badge === "") {
    echo json_encode([
        "success" => false,
        "message" => "Badge belum diisi"
    ]);
    exit;
}

$sql = "
    INSERT INTO pemain
    (nama, badge, level, hitung, buah, tic, skor, xp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        level = VALUES(level),
        hitung = VALUES(hitung),
        buah = VALUES(buah),
        tic = VALUES(tic),
        skor = VALUES(skor),
        xp = VALUES(xp)
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "ssiiiiii",
    $nama,
    $badge,
    $level,
    $hitung,
    $buah,
    $tic,
    $skor,
    $xp
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Data berhasil disimpan",
        "data" => [
            "nama" => $nama,
            "badge" => $badge,
            "level" => $level,
            "hitung" => $hitung,
            "buah" => $buah,
            "tic" => $tic,
            "skor" => $skor,
            "xp" => $xp
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>
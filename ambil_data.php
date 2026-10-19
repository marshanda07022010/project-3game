<?php

header("Content-Type: application/json");
require_once "koneksi.php";

$badge = $_GET["badge"] ?? "";

if ($badge !== "") {

    $stmt = $conn->prepare("
        SELECT nama, badge, level, hitung, buah, tic, skor, xp
        FROM pemain
        WHERE badge = ?
    ");

    $stmt->bind_param("s", $badge);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {

        echo json_encode([
            "success" => true,
            "data" => $row
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Pemain tidak ditemukan"
        ]);
    }

    $stmt->close();

} else {

    $result = $conn->query("
        SELECT nama, badge, level, hitung, buah, tic, skor, xp
        FROM pemain
        ORDER BY skor DESC
    ");

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
}

$conn->close();

?>
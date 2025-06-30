const xlsx = require("xlsx");
const fs = require("fs");

// Đọc file Excel
const workbook = xlsx.readFile(
  "project-niad-bic-web/src/data/To roi Ung thư_4CT-4.xlsx"
);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Xác định vị trí bắt đầu dữ liệu (bỏ qua header)
const startRow = 4; // Dòng 5 trong Excel (index 4 trong mảng)
const result = [];

for (let i = startRow; i < data.length; i++) {
  const row = data[i];
  if (!row[1]) continue; // Bỏ qua dòng trống

  const age = parseInt(row[1]);
  // Chương trình 1
  result.push({
    age,
    gender: "male",
    program: 1,
    fee: parseInt((row[2] + "").replace(/,/g, "")),
  });
  result.push({
    age,
    gender: "female",
    program: 1,
    fee: parseInt((row[3] + "").replace(/,/g, "")),
  });
  // Chương trình 2
  result.push({
    age,
    gender: "male",
    program: 2,
    fee: parseInt((row[4] + "").replace(/,/g, "")),
  });
  result.push({
    age,
    gender: "female",
    program: 2,
    fee: parseInt((row[5] + "").replace(/,/g, "")),
  });
  // Chương trình 3
  result.push({
    age,
    gender: "male",
    program: 3,
    fee: parseInt((row[6] + "").replace(/,/g, "")),
  });
  result.push({
    age,
    gender: "female",
    program: 3,
    fee: parseInt((row[7] + "").replace(/,/g, "")),
  });
  // Chương trình 4
  result.push({
    age,
    gender: "male",
    program: 4,
    fee: parseInt((row[8] + "").replace(/,/g, "")),
  });
  result.push({
    age,
    gender: "female",
    program: 4,
    fee: parseInt((row[9] + "").replace(/,/g, "")),
  });
}

// Ghi ra file JSON
fs.writeFileSync(
  "project-niad-bic-web/src/data/cancer_fee_table.json",
  JSON.stringify(result, null, 2),
  "utf8"
);
console.log("Đã chuyển đổi xong!");

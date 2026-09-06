const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const inputHtmlPath = path.resolve(__dirname, "summary.html");
const outputPdfPath = path.resolve(__dirname, "student-enrollment-masterclass-summary.pdf");

async function generatePdf() {
  console.log("Reading HTML content from:", inputHtmlPath);
  const htmlContent = fs.readFileSync(inputHtmlPath, "utf-8");

  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  console.log("Rendering PDF to:", outputPdfPath);
  await page.pdf({
    path: outputPdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "14mm",
      bottom: "14mm",
      left: "14mm",
      right: "14mm",
    },
  });

  await browser.close();
  console.log("✅ PDF successfully generated at:", outputPdfPath);
}

generatePdf().catch((err) => {
  console.error("❌ Failed to generate PDF:", err);
  process.exit(1);
});

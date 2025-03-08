import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";
import mammoth from "mammoth";

function App() {
  const [text, setText] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      if (file.type === "application/pdf") {
        extractTextFromPDF(arrayBuffer);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        extractTextFromDOCX(arrayBuffer);
      } else {
        setText("Unsupported file type. Please upload a PDF or DOCX file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTextFromPDF = async (arrayBuffer) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        extractedText += pageText + "\n";
      }

      setText(extractedText || "No text found in PDF.");
    } catch (error) {
      setText("Error extracting text from PDF: " + error.message);
    }
  };

  const extractTextFromDOCX = async (arrayBuffer) => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      setText(result.value || "No text found in DOCX.");
    } catch (error) {
      setText("Error extracting text from DOCX: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload PDF or DOCX to Extract Text</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} />
      <textarea
        value={text}
        readOnly
        rows={10}
        style={{ width: "100%", marginTop: "10px" }}
      />
    </div>
  );
}

export default App;

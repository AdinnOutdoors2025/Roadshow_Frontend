// QA-02 Unit Testing (client scope) — src/lib/roadshowAgencyPoDocument.ts
// File-upload validation for the optional agency PO document (CampaignRequest flow).

import { describe, it, expect } from "vitest";
import {
  validatePoDocumentFile,
  resolvePoDocumentUrl,
  PO_DOCUMENT_IMAGE_MAX_MB,
  PO_DOCUMENT_FILE_MAX_MB,
} from "@/lib/roadshowAgencyPoDocument";
import { baseUrl } from "@/BaseUrl";

function makeFile(name: string, sizeMB: number): File {
  const bytes = Math.max(1, Math.round(sizeMB * 1024 * 1024));
  return new File([new Uint8Array(bytes)], name);
}

describe("validatePoDocumentFile", () => {
  it("accepts a valid image under the 5MB image limit", () => {
    expect(validatePoDocumentFile(makeFile("po.jpg", 1))).toBeNull();
  });

  it("accepts a valid doc under the 10MB doc limit", () => {
    expect(validatePoDocumentFile(makeFile("po.pdf", 5))).toBeNull();
  });

  it("rejects an unsupported extension", () => {
    expect(validatePoDocumentFile(makeFile("po.exe", 1))).toMatch(/not a supported file type/);
  });

  it("is case-insensitive on extension", () => {
    expect(validatePoDocumentFile(makeFile("PO.JPG", 1))).toBeNull();
  });

  it("rejects an image at exactly the 5MB boundary (>= not >)", () => {
    expect(validatePoDocumentFile(makeFile("po.png", PO_DOCUMENT_IMAGE_MAX_MB))).toMatch(/max allowed/);
  });

  it("accepts a doc just under the 10MB boundary", () => {
    expect(validatePoDocumentFile(makeFile("po.docx", PO_DOCUMENT_FILE_MAX_MB - 0.01))).toBeNull();
  });

  it("rejects a doc at exactly the 10MB boundary", () => {
    expect(validatePoDocumentFile(makeFile("po.doc", PO_DOCUMENT_FILE_MAX_MB))).toMatch(/max allowed/);
  });
});

describe("resolvePoDocumentUrl", () => {
  it("returns an empty string for an empty input", () => {
    expect(resolvePoDocumentUrl("")).toBe("");
  });

  it("passes through an already-absolute http(s) URL unchanged", () => {
    expect(resolvePoDocumentUrl("https://cdn.example.com/po.pdf")).toBe("https://cdn.example.com/po.pdf");
  });

  it("prefixes a relative path with baseUrl (leading slash)", () => {
    expect(resolvePoDocumentUrl("/uploads/po.pdf")).toBe(`${baseUrl}/uploads/po.pdf`);
  });

  it("prefixes a relative path with baseUrl (no leading slash)", () => {
    expect(resolvePoDocumentUrl("uploads/po.pdf")).toBe(`${baseUrl}/uploads/po.pdf`);
  });
});

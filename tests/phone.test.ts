import { describe, expect, it } from "vitest";
import { formatName, isValidName } from "@/lib/utils/name";
import { formatPhone, isValidPhone, normalizePhone, phoneMaxLength } from "@/lib/utils/phone";
import { TimeoutError, withTimeout } from "@/lib/utils/withTimeout";

describe("phone validation", () => {
  it("starting with 0: needs exactly 10 digits", () => {
    expect(isValidPhone("0712345678")).toBe(true);
    expect(isValidPhone("071234567")).toBe(false); // 9 digits with a leading 0
    expect(isValidPhone("07123456789")).toBe(false); // 11
  });

  it("starting with another digit: needs exactly 9 digits", () => {
    expect(isValidPhone("712345678")).toBe(true);
    expect(isValidPhone("1234567890")).toBe(false); // 10 digits without a leading 0
    expect(isValidPhone("71234567")).toBe(false); // 8
  });

  it("limits typing to 10 digits after a leading 0, otherwise 9", () => {
    expect(phoneMaxLength("")).toBe(10);
    expect(phoneMaxLength("0")).toBe(10);
    expect(phoneMaxLength("071234")).toBe(10);
    expect(phoneMaxLength("7")).toBe(9);
    expect(phoneMaxLength("712345")).toBe(9);
  });

  it("rejects letters, symbols and empty input", () => {
    expect(isValidPhone("07123456a8")).toBe(false);
    expect(isValidPhone("+94712345678")).toBe(false);
    expect(isValidPhone("071-234-567")).toBe(false);
    expect(isValidPhone("")).toBe(false);
    expect(isValidPhone("          ")).toBe(false);
  });

  it("strips spaces", () => {
    expect(normalizePhone(" 071 234 5678 ")).toBe("0712345678");
    expect(isValidPhone("071 234 5678")).toBe(true);
  });

  it("formats as 071 234 5678, also while typing", () => {
    expect(formatPhone("0712345678")).toBe("071 234 5678");
    expect(formatPhone("712345678")).toBe("712 345 678");
    expect(formatPhone("07")).toBe("07");
    expect(formatPhone("07123")).toBe("071 23");
    expect(formatPhone("")).toBe("");
  });
});

describe("name formatting", () => {
  it("stores names with normal capitalisation", () => {
    expect(formatName("KASUN PERERA")).toBe("Kasun Perera");
    expect(formatName("  kasun   perera ")).toBe("Kasun Perera");
    expect(formatName("anne-marie")).toBe("Anne-Marie");
  });

  it("requires a name after trimming, max 30 characters", () => {
    expect(isValidName("   ")).toBe(false);
    expect(isValidName("A")).toBe(true);
    expect(isValidName("A".repeat(30))).toBe(true);
    expect(isValidName("A".repeat(31))).toBe(false);
  });
});

describe("withTimeout", () => {
  it("resolves when the promise is fast enough", async () => {
    await expect(withTimeout(Promise.resolve(42), 50)).resolves.toBe(42);
  });

  it("rejects with TimeoutError when too slow", async () => {
    await expect(withTimeout(new Promise(() => {}), 10)).rejects.toBeInstanceOf(TimeoutError);
  });
});

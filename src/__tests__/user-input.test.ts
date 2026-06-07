import { describe, expect, it } from "bun:test";
import {
	parseCreateUserBody,
	parseUpdateUserBody,
	parseUserId,
} from "../api/user-input";

describe("user-input", () => {
	it("parseUserId accepts positive integers", () => {
		expect(parseUserId("1")).toBe(1);
		expect(parseUserId("42")).toBe(42);
	});

	it("parseUserId rejects invalid ids", () => {
		expect(parseUserId("0")).toBeNull();
		expect(parseUserId("-1")).toBeNull();
		expect(parseUserId("abc")).toBeNull();
		expect(parseUserId("1.5")).toBeNull();
	});

	it("parseCreateUserBody requires email", () => {
		expect(parseCreateUserBody({ email: "a@b.co" })).toEqual({
			email: "a@b.co",
		});
		expect(typeof parseCreateUserBody({})).toBe("string");
		expect(typeof parseCreateUserBody({ email: "" })).toBe("string");
	});

	it("parseUpdateUserBody allows empty patch", () => {
		expect(parseUpdateUserBody({})).toEqual({});
	});
});
import { beforeEach, describe, expect, it } from "vitest";

describe("Main.js", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("mounts the application", async () => {
    await import("./main.js");

    expect(document.getElementById("app").innerHTML).not.toBe("");
  });
});

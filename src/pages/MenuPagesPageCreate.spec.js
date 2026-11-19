import { render, router, screen, waitFor } from "../../test/helper.js";
import "../../test/afterlogin.js";

import MenuPagesPage from "./MenuPagesPage.vue";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { API_SECRET } from "../config.js";

const apiSecret = API_SECRET ? "/" + API_SECRET : "";
const newPageId = 220;
let pageCreateCount = 0;
let pageGetCount = 0;
let lastPageCreate = null;

const server = setupServer(
  http.get("/api" + apiSecret + "/pages", () =>
    HttpResponse.json({ success: true, data: [] }),
  ),
  http.get("/api" + apiSecret + "/menus", () =>
    HttpResponse.json({ success: true, data: [] }),
  ),
  http.get("/api" + apiSecret + "/tag-categories", () =>
    HttpResponse.json({ success: true, data: {} }),
  ),
  http.post("/api" + apiSecret + "/pages", async ({ request }) => {
    pageCreateCount += 1;
    lastPageCreate = await request.json();

    return HttpResponse.json({
      success: true,
      data: { pageId: newPageId },
    });
  }),
  http.get(`/api${apiSecret}/pages/${newPageId}`, () => {
    pageGetCount += 1;

    return HttpResponse.json({
      success: true,
      data: {
        id: newPageId,
        published: 0,
        commented: 0,
        after_login: 0,
        position: 1,
        type: "cms",
        menu_id: null,
        page_id: null,
        title: { en: "New title" },
        short_title: { en: "New short title" },
        h1: { en: "New title" },
        url_slug: { en: "new-title" },
        description: { en: "" },
        content: { en: "" },
        images: [],
        tags: [],
      },
    });
  }),
);

beforeAll(() => server.listen());

beforeEach(() => {
  pageCreateCount = 0;
  pageGetCount = 0;
  lastPageCreate = null;
  server.resetHandlers();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterAll(() => server.close());

it("creates a CMS page and reloads it by the ID returned by the server", async () => {
  router.push("/pages");
  await router.isReady();
  render(MenuPagesPage);

  await screen.findByPlaceholderText("title en");
  await userEvent.type(screen.getByPlaceholderText("title en"), "New title");
  await userEvent.type(
    screen.getByPlaceholderText("short title en"),
    "New short title",
  );

  expect(screen.getByLabelText(/Page type:/)).toHaveValue("cms");
  await userEvent.click(screen.getByRole("button_save_edit_page"));

  await waitFor(() => {
    expect(pageCreateCount).toBe(1);
    expect(pageGetCount).toBe(1);
    expect(screen.getByPlaceholderText("url slug en")).toHaveValue("new-title");
    expect(screen.getByPlaceholderText("h1 en")).toHaveValue("New title");
  });

  expect(lastPageCreate.type).toBe("cms");
  expect(lastPageCreate.title).toEqual({ en: "New title" });
  expect(lastPageCreate.short_title).toEqual({ en: "New short title" });
  expect(lastPageCreate.url_slug).toEqual({});
  expect(lastPageCreate.h1).toEqual({});
});

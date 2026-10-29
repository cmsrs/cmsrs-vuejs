import {
  render,
  router,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  //fireEvent,
} from "../../test/helper.js";

import MenuPagesPage from "./MenuPagesPage.vue";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";
import trans from "../helpers/trans.js";
//import trans from "../helpers/trans.js";
import storage from "../state/storage.js";
import { afterAll, beforeAll, expect } from "vitest";
//import { afterAll, beforeAll, describe, expect } from "vitest";
import { API_SECRET } from "../config.js";
const apiSecret = API_SECRET ? "/" + API_SECRET : "";

const contentPl = "lorem ipsum pl";
const contentEn = "lorem ipsum en";
const pages = [
  {
    id: 1,
    published: 1,
    commented: 0,
    after_login: 0,
    position: 1,
    type: "main_page",
    menu_id: null,
    page_id: null,
    title: {
      pl: "test p2 pl",
      en: "test p2 en",
    },
    short_title: {
      pl: "short p22 pl",
      en: "short p22 en",
    },
    description: {
      pl: "test1234 pl",
      en: "test1234 en",
    },
    content: {
      pl: contentPl,
      en: contentEn,
    },
  },
];

let counter = 0;
let counterEdit = 0;

let server = setupServer(
  http.get("/api" + apiSecret + "/pages", async () => {
    counter += 1;
    const jsonRes = {
      success: true,
      data: pages,
    };

    return HttpResponse.json(jsonRes);
  }),

  http.get("/api" + apiSecret + "/tag-categories", async () => {
    return HttpResponse.json({
      success: true,
      data: {},
    });
  }),

  http.get("/api" + apiSecret + "/pages/1", async () => {
    counter += 1;
    const jsonRes = {
      success: true,
      data: pages[0],
    };

    return HttpResponse.json(jsonRes);
  }),

  http.put("/api" + apiSecret + "/pages/1", async () => {
    counterEdit += 1;
    return new HttpResponse(null, {
      status: 403,
    });
  }),

  http.get("/api" + apiSecret + "/menus", async () => {
    counter += 1;
    const jsonRes = {
      success: true,
      data: [],
    };

    return HttpResponse.json(jsonRes);
  }),
);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  counter = 0;
  counterEdit = 0;
  server.resetHandlers();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});

const waitForAjaxes = async () => {
  const spinner = screen.queryByRole("pre_loader_save_edit_page");
  expect(spinner).not.toBeNull();
  await waitForElementToBeRemoved(spinner);
};

describe("Pages page", () => {
  describe("Interactions when demo_status is true", () => {
    const jsonStore2 = {
      auth: {
        token: "abcde12345",
      },
      //this data came from api/config and save to local storage
      config: {
        page_types: ["cms", "gallery", "main_page"],
        langs: ["pl", "en"],
        default_lang: "pl",
        cache_enable: 1,
        demo_status: 1, //!!!
      },
    };

    const setup2 = async () => {
      const firstPageIdOnThePage = 1;
      router.push("/pages/1");
      await router.isReady();
      return render(MenuPagesPage, {
        props: {
          id: firstPageIdOnThePage,
        },
      });
    };

    it("edit first page", async () => {
      localStorage.clear();
      storage.setItem("auth", jsonStore2.auth);
      storage.setItem("config", jsonStore2.config);

      await setup2();
      await waitForAjaxes();
      expect(counter).toBe(3);

      const pageEdit = screen.queryByRole("button_save_edit_page");
      expect(counterEdit).toBe(0);
      await userEvent.click(pageEdit);

      await waitFor(() => {
        expect(counterEdit).toBe(1);
        const alertDangerAfter = screen.queryByRole("alert_danger");
        expect(alertDangerAfter).toBeInTheDocument();

        const msg = trans.ttt("is_demo_true");
        expect(screen.queryByText(msg)).toBeInTheDocument();
      });
    });
  });
});

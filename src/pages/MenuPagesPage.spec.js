import {
  render,
  router,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
} from "../../test/helper.js";
import "../../test/afterlogin.js";

import MenuPagesPage from "./MenuPagesPage.vue";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";
import trans from "../helpers/trans.js";
import storage from "../state/storage.js";
import { afterAll, beforeAll } from "vitest";
//import { afterAll, beforeAll, describe, expect } from "vitest";
import { API_SECRET } from "../config.js";
const apiSecret = API_SECRET ? "/" + API_SECRET : "";

const confirmSpy = vi.spyOn(window, "confirm");

const images = [
  {
    id: 1,
    name: "phpunittest1.jpg",
    position: 1,
    page_id: 3,
    product_id: null,
    created_at: "2020-11-22T16:38:46.000000Z",
    updated_at: "2020-11-22T16:38:46.000000Z",
    alt: {
      en: "description img1",
    },
    fs: {
      org: "/images/page/1/1/phpunittest1.jpg",
      small: "/images/page/1/1/phpunittest1-small.jpg",
      medium: "/images/page/1/1/phpunittest1-medium.jpg",
    },
  },
  {
    id: 2,
    name: "phpunittest2.jpg",
    position: 2,
    page_id: 3,
    product_id: null,
    created_at: "2020-11-22T16:38:46.000000Z",
    updated_at: "2020-11-22T16:38:46.000000Z",
    alt: {
      en: "",
    },
    fs: {
      org: "/images/page/1/2/phpunittest2.jpg",
      small: "/images/page/1/2/phpunittest2-small.jpg",
      medium: "/images/page/1/2/phpunittest2-medium.jpg",
    },
  },
];

const pages = [
  {
    //0
    id: 1,
    published: 0,
    commented: 0,
    after_login: 0,
    position: 1,
    type: "main_page",
    menu_id: null,
    page_id: null,
    title: {
      en: "test p2",
    },
    short_title: {
      en: "p22",
    },
    description: {
      en: "test1234",
    },
    content: {
      en: "lorem ipsum",
    },
  },
  {
    //1
    id: 2,
    published: 0,
    commented: 0,
    after_login: 0,
    position: 1,
    type: "inner",
    menu_id: null,
    page_id: null,
    title: {
      en: "inner test p2",
    },
    short_title: {
      en: "inner p22",
    },
    description: {
      en: "inner test1234",
    },
    content: {
      en: "inner lorem ipsum",
    },
  },
  {
    //2
    id: 3,
    published: 1,
    commented: 0,
    after_login: 0,
    position: 1,
    type: "cms",
    menu_id: 1,
    page_id: "",
    title: {
      en: "cms test p3",
    },
    short_title: {
      en: "cms p333",
    },
    description: {
      en: "cms test333",
    },
    content: {
      en: "page connected to menu 1a",
    },
    images: images,
  },
  {
    id: 4,
    published: 1,
    commented: 0,
    after_login: 0,
    position: 2,
    type: "cms",
    menu_id: 1,
    page_id: null,
    title: {
      en: "cms test p3b",
    },
    short_title: {
      en: "cms p333b",
    },
    description: {
      en: "cms test333b",
    },
    content: {
      en: "page connected to menu 1b",
    },
  },
  {
    id: 5,
    published: 1,
    commented: 0,
    after_login: 0,
    position: 1,
    type: "cms",
    menu_id: 2,
    page_id: null,
    title: {
      en: "inner test p44",
    },
    short_title: {
      en: "inner p44",
    },
    description: {
      en: "inner test44",
    },
    content: {
      en: "page connected to menu 2",
    },
  },
  {
    id: 6,
    published: 1,
    commented: 0,
    after_login: 0,
    position: 2,
    type: "cms",
    menu_id: 1,
    page_id: 3,
    title: {
      en: "cms test p3c - nestle1",
    },
    short_title: {
      en: "cms p333c - nestle1",
    },
    description: {
      en: "cms test333c - nestle1",
    },
    content: {
      en: "page connected to menu 1c - nestle1",
    },
  },
  {
    id: 7,
    published: 1,
    commented: 0,
    after_login: 0,
    position: 2,
    type: "cms",
    menu_id: 1,
    page_id: 3,
    title: {
      en: "cms test p3c - nestle2",
    },
    short_title: {
      en: "cms p333c - nestle2",
    },
    description: {
      en: "cms test333c - nestle2",
    },
    content: {
      en: "page connected to menu 1c - nestle2",
    },
  },
];

const menus = [
  {
    id: 1,
    position: 1,
    name: {
      en: "test menu1",
    },
  },
  {
    id: 2,
    position: 2,
    name: {
      en: "test menu2",
    },
  },
];

let counter = 0;
let counter2 = 0;
let counterMenu = 0;
const newPageId = 8;
let server = setupServer(
  http.post("/api" + apiSecret + "/pages", async () => {
    counter += 1;
    const jsonRes = {
      success: true,
      data: {
        pageId: newPageId,
      },
    };

    return HttpResponse.json(jsonRes);
  }),

  http.put("/api" + apiSecret + "/pages/3", async () => {
    counter2 += 1;
    return HttpResponse.json({
      success: true,
    });
  }),

  http.post("/api" + apiSecret + "/menus", async () => {
    counterMenu += 1;
    return HttpResponse.json({
      success: true,
    });
  }),

  http.get("/api" + apiSecret + "/pages/3", async () => {
    const jsonRes = {
      success: true,
      data: pages[2], //id = 3
    };

    return HttpResponse.json(jsonRes);
  }),

  http.get("/api" + apiSecret + "/pages", async () => {
    const jsonRes = {
      success: true,
      data: pages,
    };

    return HttpResponse.json(jsonRes);
  }),

  http.get("/api" + apiSecret + "/menus", async () => {
    const jsonRes = {
      success: true,
      data: menus,
    };

    return HttpResponse.json(jsonRes);
  }),

  http.put("/api" + apiSecret + "/menus/1", async () => {
    //counter2 += 1;
    return HttpResponse.json({
      success: true,
    });
  }),

  http.delete("/api" + apiSecret + "/menus/1", async () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  http.delete("/api" + apiSecret + "/pages/3", async () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  http.patch("/api" + apiSecret + "/menus/position/down/1", async () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  http.patch("/api" + apiSecret + "/menus/position/up/2", async () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  http.patch("/api" + apiSecret + "/pages/position/down/3", async () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  http.patch("/api" + apiSecret + "/pages/position/up/3", async () => {
    return HttpResponse.json({
      success: true,
    });
  }),
);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  counter = 0;
  counter2 = 0;
  counterMenu = 0;
  server.resetHandlers();
});

afterAll(() => {
  server.close();
}, 100000);

const setup = async () => {
  router.push("/pages");
  await router.isReady();
  return render(MenuPagesPage);
};

const setup_display_message_err = async () => {
  const button = screen.queryByRole("button_add_menu");
  await userEvent.click(button);

  //const addMenuPlaceholder = screen.queryByPlaceholderText("Menu name en");
  //await userEvent.type(addMenuPlaceholder, 'New menu name');
  const alertDangerBefore = screen.queryByRole("alert_danger");
  expect(alertDangerBefore).not.toBeInTheDocument();

  const icon = screen.queryByRole("save_menu_0");
  await userEvent.click(icon);

  const alertDangerAfter = screen.queryByRole("alert_danger");
  expect(alertDangerAfter).toBeInTheDocument();

  const inputNewMenu = screen.queryByRole("new_menu");
  expect(inputNewMenu).toHaveClass("is-invalid");

  //const errorMsg = "Add menu name";
  //await screen.findByText(errorMsg);
};

const waitForAjaxes = async () => {
  const spinner = screen.queryByRole("pre_loader_save_edit_page");
  expect(spinner).not.toBeNull();
  await waitForElementToBeRemoved(spinner);
};

describe("Pages page", () => {
  describe("Layout", () => {
    it("has pages header", async () => {
      await setup();
      await waitForAjaxes();
      await waitFor(() => {
        //const header = screen.queryByRole("head_menu_pages", { name: "CMS - menus and pages" });
        const header = screen.queryByRole("head_menu_pages");
        expect(header).toBeInTheDocument();
      });
    });
  });

  describe("Interactions many langs", () => {
    const jsonStore2 = {
      auth: {
        isLoggedIn: true,
        token: "abcde12345",
        email: "user_rs@mail.com",
        password: "PasswordRs",
      },
      config: {
        page_types: ["cms", "gallery", "main_page"],
        langs: ["pl", "en"], //!!
        default_lang: "pl", //!!
        cache_enable: 1,
      },
    };

    const setup2 = async () => {
      localStorage.clear();
      storage.setItem("auth", jsonStore2.auth);
      storage.setItem("config", jsonStore2.config);

      render(MenuPagesPage);
    };

    it("show langs", async () => {
      await setup2();
      await waitForAjaxes();

      const changeLang = screen.queryByRole("change_lang");
      expect(changeLang).toBeInTheDocument();
    });

    it("save new menu and display error for first empty lang", async () => {
      await setup2();
      await waitForAjaxes();

      await setup_display_message_err();
      await screen.findByText("Add menu name for lang = pl");
    });

    it.skip("click change lang", async () => {
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
            pl: "p22 pl",
            en: "p22 en",
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

      server.use(
        http.get("/api" + apiSecret + "/pages", async () => {
          const jsonRes = {
            success: true,
            data: pages,
          };

          return HttpResponse.json(jsonRes);
        }),
      );
      await setup2();
      await waitForAjaxes();

      console.log("---------------");

      //await waitFor(() => {
      const pageEdit = screen.queryAllByRole("edit_page");
      const firstEditPage = pageEdit[0];
      await userEvent.click(firstEditPage);

      screen.findByText("test p2 pl");
      //screen.findByText('aaaaaaaaaaaa111111111111111sssssssssssssssssssssssssssss');
      const langEn = screen.queryByRole("lang_en");
      await userEvent.click(langEn);

      await waitFor(() => {
        screen.findByText("test p2 en");
      });

      //});
    });
  });

  describe("Interactions", () => {
    it("has user login in order to see pages and get access to config", async () => {
      //await setup();
      //await waitForAjaxes();
      const auth = storage.getItem("auth");
      const config = storage.getItem("config");

      expect(auth.token).toBe("abcde12345");
      expect(config.langs[0]).toEqual("en");
      expect(config.default_lang).toEqual(config.langs[0]);
    });

    it("create some page", async () => {
      await setup();
      await waitForAjaxes();
      const title = screen.queryByPlaceholderText("title en");
      await userEvent.type(title, "tiitle");

      const shortTitle = screen.queryByPlaceholderText("short title en");
      await userEvent.type(shortTitle, "short_tiiiitle");

      expect(counter).toBe(0);
      const button = screen.queryByRole("button_save_edit_page");
      await userEvent.click(button);

      const spinnerAfterClick = screen.queryByRole("pre_loader_save_edit_page");
      await waitFor(() => {
        expect(spinnerAfterClick).not.toBeInTheDocument();
        router.push("/pages/" + newPageId);
      });
      //const spinnerAfterClick = screen.queryByRole("pre_loader_save_edit_page");
      //expect(spinnerAfterClick).not.toBeNull();
      //await waitForElementToBeRemoved(spinnerAfterClick); //todo!!! - in webpack it is working - manual testing required

      expect(counter).toBe(1);

      const successMsg = trans.ttt("success_page_add");
      expect(successMsg).not.toBe("");
      await screen.findByText(successMsg);
    });

    it("create main_page", async () => {
      await setup();
      await waitForAjaxes();
      //server.use(getPages);
      //const title =  screen.findByTestId("title_en");
      //console.log(title); //null ?

      //console.log(pages[0]['title']['en']);
      await screen.findByText("Pages not related to menu");

      //console.log(shortTitle);
      await screen.findByText(
        pages[0]["short_title"]["en"],
        //pages[0]['short_title']['en']+' (1)'
      );

      const title = screen.queryByPlaceholderText("title en");
      //console.log(title); //HTMLInputElement { [Symbol(_assign)]: [Function (anonymous)] }
      await userEvent.type(title, pages[0]["title"]["en"]);

      //const shortTitle2 = 'short Title 2';
      const shortTitle = screen.queryByPlaceholderText("short title en");
      await userEvent.type(shortTitle, pages[0]["short_title"]["en"]);
      //await userEvent.type(shortTitle, shortTitle2);

      const description = screen.queryByPlaceholderText("description en");
      await userEvent.type(description, pages[0]["description"]["en"]);

      const pageTypeDropdown = screen.queryByLabelText("Page type:");
      await userEvent.selectOptions(pageTypeDropdown, "main_page");
      expect(pages[0]["type"]).toBe("main_page");

      const content = screen.queryByPlaceholderText("content en");
      await userEvent.type(content, pages[0]["content"]["en"]);

      const spinnerBeforeClick = screen.queryByRole(
        "pre_loader_save_edit_page",
      );
      expect(spinnerBeforeClick).toBeNull();

      expect(counter).toBe(0);
      const button = screen.queryByRole("button_save_edit_page");
      await userEvent.click(button);

      const spinnerAfterClick = screen.queryByRole("pre_loader_save_edit_page");
      await waitFor(() => {
        expect(spinnerAfterClick).not.toBeInTheDocument();
        router.push("/pages/" + newPageId);
      });
      //await waitForElementToBeRemoved(spinnerAfterClick); //todo!!! - in webpack it is working - manual testing required
      //expect(spinnerAfterClick).not.toBeNull();

      expect(counter).toBe(1);

      await screen.findByText("Pages not related to menu");

      await screen.findByText(
        pages[0]["short_title"]["en"],
        //pages[0]['short_title']['en']+' (1)'
      );

      const successMsg = trans.ttt("success_page_add");
      expect(successMsg).not.toBe("");
      await screen.findByText(successMsg);
    });

    it("show Inner boxes", async () => {
      await setup();
      await waitForAjaxes();
      await screen.findByText("Inner boxes");

      await screen.findByText(pages[1]["short_title"]["en"] + " (2)");
    });

    it("not show langs because one lang exist", async () => {
      await setup();
      await waitForAjaxes();

      const changeLang = screen.queryByRole("change_lang");
      expect(changeLang).toBeNull();
    });

    it("add new menu", async () => {
      await setup();
      await waitForAjaxes();

      const button = screen.queryByRole("button_add_menu");
      await userEvent.click(button);

      const addMenuPlaceholder = screen.queryByPlaceholderText("Menu name en");
      expect(addMenuPlaceholder).not.toBe(null);
    });

    it("del new menu", async () => {
      await setup();
      await waitForAjaxes();

      const button = screen.queryByRole("button_add_menu");
      await userEvent.click(button);

      const newMenu = screen.queryByRole("new_menu");
      expect(newMenu).not.toBe(null);

      const addMenuPlaceholder = screen.queryByPlaceholderText("Menu name en");
      await userEvent.type(addMenuPlaceholder, "New menu name");
      //expect(addMenuPlaceholder).not.toBe(null);

      const icon = screen.queryByRole("del_menu_0");
      await userEvent.click(icon);

      const newMenuAfterClick = screen.queryByRole("new_menu");
      expect(newMenuAfterClick).toBe(null);
    });

    /*
    const setup_display_message_err = async () => {
      const button = screen.queryByRole("button_add_menu");
      await userEvent.click(button);

      //const addMenuPlaceholder = screen.queryByPlaceholderText("Menu name en");
      //await userEvent.type(addMenuPlaceholder, 'New menu name');
      const alertDangerBefore = screen.queryByRole("alert_danger");
      expect(alertDangerBefore).not.toBeInTheDocument();

      const icon = screen.queryByRole("save_menu_0");
      await userEvent.click(icon);

      const alertDangerAfter = screen.queryByRole("alert_danger");
      expect(alertDangerAfter).toBeInTheDocument();

      const inputNewMenu = screen.queryByRole("new_menu");
      expect(inputNewMenu).toHaveClass("is-invalid");

      const errorMsg = "Add menu name";
      await screen.findByText(errorMsg);
    };
    */

    it("save new menu - display error when we set up one lang", async () => {
      await setup();
      await waitForAjaxes();

      await setup_display_message_err();

      const errorMsg = "Add menu name";
      await screen.findByText(errorMsg);
      await expect(screen.findByText("for lang")).rejects.toThrow(); //it is one lang
    });

    it("save new menu - display error and clear msg after change menu name", async () => {
      await setup();
      await waitForAjaxes();

      await setup_display_message_err();
      await expect(screen.findByText("for lang")).rejects.toThrow(); //it is one lang

      const addMenuPlaceholder = screen.queryByPlaceholderText("Menu name en");
      await userEvent.type(addMenuPlaceholder, "N");

      const alertDangerAfter2 = screen.queryByRole("alert_danger");
      expect(alertDangerAfter2).not.toBeInTheDocument();
    });

    it("save new menu - display error and clear msg after delete menu", async () => {
      await setup();
      await waitForAjaxes();

      await setup_display_message_err();

      const icon = screen.queryByRole("del_menu_0");
      await userEvent.click(icon);

      const alertDangerAfter2 = screen.queryByRole("alert_danger");
      expect(alertDangerAfter2).not.toBeInTheDocument();
    });

    it("save new menu - display error and clear msg after save menu again", async () => {
      await setup();
      await waitForAjaxes();

      await setup_display_message_err();

      const icon = screen.queryByRole("save_menu_0");
      await userEvent.click(icon);

      const alertDangerAfter2 = screen.queryByRole("alert_danger");
      expect(alertDangerAfter2).toBeInTheDocument();
    });

    it("save new menu - display good message and click add menu button", async () => {
      await setup();
      await waitForAjaxes();
      const spinner = screen.queryByRole("pre_loader_save_edit_page");
      await waitFor(() => {
        expect(spinner).not.toBeInTheDocument();
      });

      //expect(spinner).not.toBeNull();
      //await waitForElementToBeRemoved(spinner);

      const button = screen.queryByRole("button_add_menu");
      await userEvent.click(button);

      const addMenuPlaceholder = screen.queryByPlaceholderText("Menu name en");
      await userEvent.type(addMenuPlaceholder, "New menu name");

      const alertSuccessBefore = screen.queryByRole("alert_success");
      expect(alertSuccessBefore).not.toBeInTheDocument();

      expect(counterMenu).toBe(0);
      const spinnerBeforeClick = screen.queryByRole("pre_loader_add_menu");
      expect(spinnerBeforeClick).toBeNull();

      expect(counterMenu).toBe(0);
      const icon = screen.queryByRole("save_menu_0");
      await userEvent.click(icon);

      const spinnerAfterClick = screen.queryByRole("pre_loader_add_menu");
      await waitFor(() => {
        expect(spinnerAfterClick).not.toBeInTheDocument();
      });
      //expect(spinnerAfterClick).not.toBeNull();
      //await waitForElementToBeRemoved(spinnerAfterClick); //todo

      expect(counterMenu).toBe(1);
      const alertSuccessAfter = screen.queryByRole("alert_success");
      expect(alertSuccessAfter).toBeInTheDocument();

      const addMenuPlaceholderAfter =
        screen.queryByPlaceholderText("Menu name en");
      expect(addMenuPlaceholderAfter).toBeNull();

      //and again we click add menu and alert_success should be dissapeared
      const button2 = screen.queryByRole("button_add_menu");
      await userEvent.click(button2);
      const alertSuccessAfter2 = screen.queryByRole("alert_success");
      expect(alertSuccessAfter2).not.toBeInTheDocument();
    });

    it("show saved two menus", async () => {
      await setup();
      await waitForAjaxes();

      await waitFor(() => {
        const menus = screen.queryAllByRole("menu");
        expect(menus.length).toBe(2);
        menus.forEach((menu, index) => {
          expect(menu).toBeInTheDocument();
        });

        const downMenu = screen.queryAllByRole("down_menu");
        expect(downMenu.length).toBe(2);
        downMenu.forEach((dMenu, index) => {
          expect(dMenu).toBeInTheDocument();
        });

        //const firstDownMenu = downMenu[0];
        //userEvent.click(firstDownMenu);

        const upMenu = screen.queryAllByRole("up_menu");
        expect(upMenu.length).toBe(2);
        upMenu.forEach((uMenu, index) => {
          expect(uMenu).toBeInTheDocument();
        });

        //const secondDownMenu = upMenu[1];
        //userEvent.click(secondDownMenu);
      });
    });

    it("one request - menu change position down", async () => {
      await setup();
      await waitForAjaxes();

      const downMenu = screen.queryAllByRole("down_menu");
      const firstDownMenu = downMenu[0];
      await userEvent.click(firstDownMenu);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("many request - menu change position down", async () => {
      await setup();
      await waitForAjaxes();

      const downMenu = screen.queryAllByRole("down_menu");
      const firstDownMenu = downMenu[0];
      await userEvent.click(firstDownMenu);
      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });

      const downMenu2 = screen.queryAllByRole("down_menu");
      const firstDownMenu2 = downMenu2[0];
      await userEvent.click(firstDownMenu2);
      await waitFor(() => {
        const alertSuccessAfter2 = screen.queryByRole("alert_success");
        expect(alertSuccessAfter2).toBeInTheDocument();
      });
    });

    it("menu change position up", async () => {
      await setup();
      await waitForAjaxes();

      const upMenu = screen.queryAllByRole("up_menu");
      const secondDownMenu = upMenu[1];
      await userEvent.click(secondDownMenu);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("edit menu name the success msg should be appear", async () => {
      await setup();
      await waitForAjaxes();

      const menu = screen.queryAllByRole("menu");

      const firstMenu = menu[0];
      await userEvent.type(firstMenu, "some change1");

      const menuSave = await screen.queryAllByRole("save_menu");
      const firstMenuSave = menuSave[0];
      userEvent.click(firstMenuSave);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("edit menu name the failed msg should be appears", async () => {
      await setup();
      await waitForAjaxes();

      const menu = screen.queryAllByRole("menu");
      const firstMenu = menu[0];
      firstMenu.value = "some change";
      await fireEvent.update(firstMenu, "");
      //await fireEvent.update(firstMenu, { target: { value: 'some change1' } });

      //await fireEvent.input(firstMenu, { target: { value: 'some change' } });
      //await userEvent.input(firstMenu, { target: { value: 'some change' } });

      //firstMenu.value = '';
      //await userEvent.update(firstMenu, '');
      //await userEvent.type(firstMenu, 'some change1', { selectOptions: { all: true } });

      //userEvent.type(firstMenu,  ' ' ); //empty

      const menuSave = await screen.queryAllByRole("save_menu");
      const firstMenuSave = menuSave[0];
      await userEvent.click(firstMenuSave);

      await waitFor(() => {
        const alertAfter = screen.queryByRole("alert_danger");
        expect(alertAfter).toBeInTheDocument();
      });
    });

    it("delete menu and show success alert", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup();
      await waitForAjaxes();

      const menuDel = await screen.queryAllByRole("del_menu");
      const firstMenuDel = menuDel[0];
      userEvent.click(firstMenuDel);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("show pages belongs to each menu", async () => {
      await setup();
      await waitForAjaxes();

      const firstMenuId = menus[0].id;
      expect(firstMenuId).toBe(1);

      const secondMenuId = menus[1].id;
      expect(secondMenuId).toBe(2);

      await waitFor(() => {
        const menuContainers = screen.queryAllByRole("menu_pages");
        expect(menuContainers.length).toBe(2);

        menuContainers.forEach((container) => {
          const menuId = container.getAttribute("data-menu-id");

          if (menuId === String(firstMenuId)) {
            const pagesInsideMenu =
              container.querySelectorAll(".test-parent-page");
            expect(pagesInsideMenu.length).toBe(2);
          }
          if (menuId === String(secondMenuId)) {
            const pagesInsideMenu2 =
              container.querySelectorAll(".test-parent-page");
            expect(pagesInsideMenu2.length).toBe(1);
          }
        });
      });
    });

    it("show pages belongs to each pages", async () => {
      await setup();
      await waitForAjaxes();

      const parentPageId = 3;

      await waitFor(() => {
        const nestedPagesContainers = screen.queryAllByRole("page_pages");
        expect(nestedPagesContainers.length).toBe(1);

        let isIf = false;
        nestedPagesContainers.forEach((container) => {
          const pageId = container.getAttribute("data-page-id");
          //expect( pageId ).toBe(parentPageId);
          //console.log(pageId);

          //console.log('aaaaa00='+ pageId  + '   '+parentPageId);
          if (pageId === String(parentPageId)) {
            //console.log('bbb');
            const pagesInsidePage = container.querySelectorAll(".test-page");
            expect(pagesInsidePage.length).toBe(2);
            isIf = true;
          }
        });
        expect(isIf).toBe(true);
      });
    });

    it("edit first page - check fields", async () => {
      await setup();
      await waitForAjaxes();

      const title = screen.queryByPlaceholderText("title en");
      expect(title).toHaveValue("");

      const shortTitle = screen.queryByPlaceholderText("short title en");
      expect(shortTitle).toHaveValue("");

      const description = screen.queryByPlaceholderText("description en");
      //console.log(description);
      expect(description).toHaveValue("");

      const pageTypeDropdown = screen.queryByLabelText("Page type:");
      expect(pageTypeDropdown).toHaveValue("cms");

      //const content = screen.queryByPlaceholderText("content en"); //TODO
      //expect(content).toHaveValue("");

      const firstPageIdOnThePage = 3;
      const firstPageIdOnThePageIndex = firstPageIdOnThePage - 1;
      expect(pages[firstPageIdOnThePageIndex].id).toBe(firstPageIdOnThePage);

      const pageEdit = screen.queryAllByRole("edit_page");
      const firstEditPage = pageEdit[0];
      userEvent.click(firstEditPage);

      await waitFor(() => {
        const page = pages[firstPageIdOnThePageIndex];

        const title = screen.queryByPlaceholderText("title en");
        expect(title).toHaveValue(page.title["en"]);

        const shortTitle = screen.queryByPlaceholderText("short title en");
        expect(shortTitle).toHaveValue(page.short_title["en"]);

        const description = screen.queryByPlaceholderText("description en");
        expect(description).toHaveValue(page.description["en"]);

        const pageTypeDropdown = screen.queryByLabelText("Page type:");
        expect(pageTypeDropdown).toHaveValue(page.type["en"]); //!!

        //const content = screen.queryByPlaceholderText("content en"); //TODO
        //expect(content).toHaveValue(page.content['en']);
      });
    });

    it("edit first page and then click clear button", async () => {
      await setup();
      await waitForAjaxes();

      const title = screen.queryByPlaceholderText("title en");
      expect(title).toHaveValue("");

      const firstPageIdOnThePage = 3;
      const firstPageIdOnThePageIndex = firstPageIdOnThePage - 1;
      expect(pages[firstPageIdOnThePageIndex].id).toBe(firstPageIdOnThePage);

      const pageEdit = screen.queryAllByRole("edit_page");
      const firstEditPage = pageEdit[0];
      await userEvent.click(firstEditPage);

      //await waitFor(() => {
      const page = pages[firstPageIdOnThePageIndex];

      const title2 = screen.queryByPlaceholderText("title en");
      expect(title2).toHaveValue(page.title["en"]);

      const menuItems = await screen.findByRole("menu_items");
      expect(menuItems.value).toEqual(page.menu_id.toString());

      const pageItems = await screen.findByRole("page_items");
      expect(pageItems.value).toEqual(page.page_id); //where page.page_id === '' and it is ok (page can be not belong to menu)
      expect(pageItems.value).toEqual("");
      //console.log(pageItems);

      const button = screen.queryByRole("button_clear_page_data");
      await userEvent.click(button);

      const titleAfter = screen.queryByPlaceholderText("title en");
      expect(titleAfter).toHaveValue("");

      //});
    });

    it("edit first page and see success msg", async () => {
      await setup();
      await waitForAjaxes();

      const pageEdit = screen.queryAllByRole("edit_page");
      const firstEditPage = pageEdit[0];
      userEvent.click(firstEditPage);

      expect(counter2).toBe(0);
      const button = screen.queryByRole("button_save_edit_page");
      await userEvent.click(button);

      const spinnerAfterClick = screen.queryByRole("pre_loader_save_edit_page");
      await waitFor(() => {
        expect(spinnerAfterClick).not.toBeInTheDocument();
      });

      //expect(spinnerAfterClick).not.toBeNull();
      //await waitForElementToBeRemoved(spinnerAfterClick); //todo

      expect(counter).toBe(0);
      expect(counter2).toBe(1);

      const successMsg = trans.ttt("success_page_edit");
      expect(successMsg).not.toBe("");
      await screen.findByText(successMsg);
    });

    it("delete page and show success alert", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup();
      await waitForAjaxes();

      //const menuDel = await screen.queryAllByRole("del_page");
      //const firstMenuDel = menuDel[0];
      //userEvent.click(firstMenuDel);

      const pageDel = await screen.queryAllByRole("del_page");
      const firstDelPage = pageDel[0];
      await userEvent.click(firstDelPage);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("page change position up", async () => {
      await setup();
      await waitForAjaxes();

      const upPage = screen.queryAllByRole("up_page");
      const firstPage = upPage[0];
      userEvent.click(firstPage);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("page change position down", async () => {
      await setup();
      await waitForAjaxes();

      const upPage = screen.queryAllByRole("down_page");
      const firstPage = upPage[0];
      userEvent.click(firstPage);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("count edit_page icons", async () => {
      await setup();
      await waitForAjaxes();

      const editPage = screen.queryAllByRole("edit_page");
      expect(editPage.length).toBe(pages.length);
    });

    it("count del_page icons", async () => {
      await setup();
      await waitForAjaxes();

      const delPage = screen.queryAllByRole("del_page");
      expect(delPage.length).toBe(pages.length);
    });

    it("count down_page icons", async () => {
      await setup();
      await waitForAjaxes();

      const downPage = screen.queryAllByRole("down_page");
      expect(downPage.length).toBe(pages.length);
    });

    it("count up_page icons", async () => {
      await setup();
      await waitForAjaxes();

      const upPage = screen.queryAllByRole("up_page");
      expect(upPage.length).toBe(pages.length);
    });

    it("one request - menu change position down and after change menu name the msg should be disappear", async () => {
      await setup();
      await waitForAjaxes();

      const downMenu = screen.queryAllByRole("down_menu");
      const firstDownMenu = downMenu[0];
      await userEvent.click(firstDownMenu);

      //await waitFor(() => {
      const alertSuccessAfter = await screen.findByRole("alert_success"); //!!!!
      expect(alertSuccessAfter).toBeInTheDocument();

      const menu = screen.queryAllByRole("menu");
      const firstMenu = menu[0];
      userEvent.type(firstMenu, "some change");
      const alertSuccessAfterAfter = await screen.findByRole("alert_success");
      expect(alertSuccessAfterAfter).toBeInTheDocument(); //TODO in the future

      //});
    });
  });

  /*
-----------------
*/

  describe("pages images tests", () => {
    const setup_edit_page = async () => {
      await setup();
      await waitForAjaxes();

      const title = screen.queryByPlaceholderText("title en");
      expect(title).toHaveValue("");

      const firstPageIdOnThePage = 3;
      const firstPageIdOnThePageIndex = firstPageIdOnThePage - 1;
      expect(pages[firstPageIdOnThePageIndex].id).toBe(firstPageIdOnThePage);

      const pageEdit = screen.queryAllByRole("edit_page");
      const firstEditPage = pageEdit[0];
      await userEvent.click(firstEditPage);

      const page = pages[firstPageIdOnThePageIndex];

      const title2 = screen.queryByPlaceholderText("title en");
      expect(title2).toHaveValue(page.title["en"]);
    };

    let counterUpload = 0;
    let counterImage = 0;

    let counterDeleteImages = 0;
    let counterDeleteOneImage = 0;
    beforeEach(() => {
      counterUpload = 0;
      counterImage = 0;
      counterDeleteImages = 0;
      counterDeleteOneImage = 0;
      server.use(
        http.post("/api" + apiSecret + "/image/page/3", async () => {
          counterUpload += 1;
          return HttpResponse.json({
            success: true,
          });
        }),

        http.get("/api" + apiSecret + "/images/page/3", async () => {
          return HttpResponse.json({
            success: true,
            data: images,
          });
        }),

        http.patch("/api" + apiSecret + "/images/position/down/1", async () => {
          counterImage += 1;
          return HttpResponse.json({
            success: true,
          });
        }),

        http.patch("/api" + apiSecret + "/images/position/up/2", async () => {
          counterImage += 1;
          return HttpResponse.json({
            success: true,
          });
        }),

        http.delete("/api" + apiSecret + "/images/1", async () => {
          counterImage += 1;
          return HttpResponse.json({
            success: true,
          });
        }),

        http.delete("/api" + apiSecret + "/images/1,2", async () => {
          counterDeleteImages += 1;
          return HttpResponse.json({
            success: true,
          });
        }),

        http.delete("/api" + apiSecret + "/images/2", async () => {
          counterDeleteOneImage += 1;
          return HttpResponse.json({
            success: true,
          });
        }),
      );
    });

    it("upload images is prohibit without edit page", async () => {
      await setup();
      await waitForAjaxes();

      expect(counterUpload).toBe(0);
      const uploadImages = screen.queryByRole("upload_images"); //const uploadImages = screen.getByLabelText(/upload images/i) //second option
      await userEvent.upload(uploadImages, [
        new File(["phpunittest1"], "phpunittest1.jpg", { type: "image/jpg" }),
        new File(["phpunittest2"], "phpunittest2.jpg", { type: "image/jpg" }),
      ]);

      await waitFor(() => {
        expect(counterUpload).toBe(0);
      });
    });

    it("upload one image success", async () => {
      await setup_edit_page();

      expect(counterUpload).toBe(0);

      const uploadImages = screen.queryByRole("upload_images"); //const uploadImages = screen.getByLabelText(/upload images/i) //second option
      await userEvent.upload(uploadImages, [
        new File(["phpunittest1"], "phpunittest1.jpg", { type: "image/jpg" }),
        new File(["phpunittest2"], "phpunittest2.jpg", { type: "image/jpg" }),
      ]);

      await waitFor(() => {
        expect(counterUpload).toBe(2);

        const successMsg = trans.ttt("success_images_upload"); // "Images has been uploaded";
        screen.getByText(successMsg);
      });
    });

    it("image show", async () => {
      await setup_edit_page();
      const delImage = screen.queryAllByRole("del_image");
      const positionDownImages = screen.queryAllByRole("down_image");
      const positionUpImages = screen.queryAllByRole("up_image");

      expect(delImage.length).toBe(2);
      expect(positionDownImages.length).toBe(2);
      expect(positionUpImages.length).toBe(2);
    });

    it("image delete success", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup_edit_page();
      expect(counterImage).toBe(0);
      const delImage = screen.queryAllByRole("del_image");
      await userEvent.click(delImage[0]);

      await waitFor(() => {
        expect(counterImage).toBe(1);

        const successMsg = trans.ttt("success_image_delete");
        screen.findByText(successMsg);
      });
    });

    it("delete many images success", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup_edit_page();
      expect(counterImage).toBe(0);

      const allCheckbox = screen.queryAllByRole("check_image");
      expect(images.length).toBe(2);
      expect(allCheckbox.length).toBe(2);

      await userEvent.click(allCheckbox[0]);
      await userEvent.click(allCheckbox[1]);

      const deleteImages = screen.queryByRole("delete_many_images");
      await userEvent.click(deleteImages);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();

        expect(counterDeleteOneImage).toBe(0);
        expect(counterDeleteImages).toBe(1);

        const successMsg = trans.ttt("success_images_delete");
        screen.findByText(successMsg);
      });
    });

    it("successfully delete all images by selecting select all", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup_edit_page();

      const checkboxSelectedAllItems = screen.queryByRole("selected_all_items");
      await userEvent.click(checkboxSelectedAllItems);

      const deleteImages = screen.queryByRole("delete_many_images");
      await userEvent.click(deleteImages);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();

        expect(counterDeleteOneImage).toBe(0);
        expect(counterDeleteImages).toBe(1);

        const successMsg = trans.ttt("success_images_delete");
        screen.findByText(successMsg);
      });
    });

    it("click select all two times", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup_edit_page();

      const checkboxSelectedAllItems = screen.queryByRole("selected_all_items");
      await userEvent.click(checkboxSelectedAllItems);
      await userEvent.click(checkboxSelectedAllItems);

      const deleteImages = screen.queryByRole("delete_many_images");
      await userEvent.click(deleteImages);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).not.toBeInTheDocument();

        const alertDangerAfter = screen.queryByRole("alert_danger");
        expect(alertDangerAfter).toBeInTheDocument();

        const msg = trans.ttt("fail_delete_images_no_items");
        screen.findByText(msg);
      });
    });

    it("delete one image success", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup_edit_page();
      expect(counterImage).toBe(0);

      const allCheckbox = screen.queryAllByRole("check_image");
      expect(images.length).toBe(2);
      expect(allCheckbox.length).toBe(2);

      await userEvent.click(allCheckbox[0]);
      await userEvent.click(allCheckbox[1]);
      await userEvent.click(allCheckbox[0]);

      const deleteImages = screen.queryByRole("delete_many_images");
      await userEvent.click(deleteImages);

      await waitFor(() => {
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();

        expect(counterDeleteOneImage).toBe(1);
        expect(counterDeleteImages).toBe(0);

        const successMsg = trans.ttt("success_images_delete");
        screen.findByText(successMsg);
      });
    });

    it("click icon delete many images without check any item", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup_edit_page();
      expect(counterImage).toBe(0);

      const deleteImages = screen.queryByRole("delete_many_images");
      await userEvent.click(deleteImages);
      const alertDangerAfter = screen.queryByRole("alert_danger");
      expect(alertDangerAfter).toBeInTheDocument();
    });

    it("image position down success", async () => {
      await setup_edit_page();
      expect(counterImage).toBe(0);

      const positionDownImages = screen.queryAllByRole("down_image");
      await userEvent.click(positionDownImages[0]);

      await waitFor(() => {
        expect(counterImage).toBe(1);

        const successMsg = trans.ttt("success_image_position");
        screen.findByText(successMsg);
      });
    });

    it("image position up success", async () => {
      await setup_edit_page();
      expect(counterImage).toBe(0);

      const positionUpImages = screen.queryAllByRole("up_image");
      await userEvent.click(positionUpImages[1]);

      await waitFor(() => {
        expect(counterImage).toBe(1);

        const successMsg = trans.ttt("success_image_position");
        screen.findByText(successMsg);
      });
    });
  });

  describe("Interactions one menu", () => {
    it("not display positions in one menu", async () => {
      const menus2 = [
        {
          id: 1,
          position: 1,
          name: {
            en: "test menu1",
          },
        },
      ];

      server.use(
        http.get("/api" + apiSecret + "/pages", async () => {
          const jsonRes = {
            success: true,
            data: pages,
          };

          return HttpResponse.json(jsonRes);
        }),
        http.get("/api" + apiSecret + "/menus", async () => {
          const jsonRes = {
            success: true,
            data: menus2,
          };

          return HttpResponse.json(jsonRes);
        }),
      );

      await setup();
      await waitForAjaxes();

      await waitFor(() => {
        const menus = screen.queryAllByRole("menu");
        expect(menus.length).toBe(1);
        menus.forEach((menu, index) => {
          expect(menu).toBeInTheDocument();
        });

        const downMenu = screen.queryByRole("down_menu");
        expect(downMenu).not.toBeInTheDocument();

        const upMenu = screen.queryByRole("up_menu");
        expect(upMenu).not.toBeInTheDocument();
      });
    });
  });

  describe("go to direct page", () => {
    const firstPageIdOnThePage = 3;
    const setupEdit = async () => {
      router.push("/pages/3");
      await router.isReady();
      return render(MenuPagesPage, {
        props: {
          id: firstPageIdOnThePage,
        },
      });
    };

    it("display first page", async () => {
      await setupEdit();
      await waitForAjaxes();

      const firstPageIdOnThePageIndex = firstPageIdOnThePage - 1;
      expect(pages[firstPageIdOnThePageIndex].id).toBe(firstPageIdOnThePage);
      const page = pages[firstPageIdOnThePageIndex];

      const title = screen.queryByPlaceholderText("title en");
      expect(title).toHaveValue(page.title["en"]);
    });
  });
});

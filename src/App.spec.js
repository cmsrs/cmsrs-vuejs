import {
  render,
  router,
  screen,
  waitFor,
  //waitForElementToBeRemoved,
  //fireEvent,
} from "../test/helper.js";
import "../test/afterlogin.js";
import functions from "./helpers/functions.js";
import trans from "./helpers/trans.js";
import storage from "./state/storage.js";
import App from "./App.vue";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll } from "vitest";
import { API_SECRET } from "./config.js";
import axios from "axios";

const apiSecret = API_SECRET ? "/" + API_SECRET : "";

const successMsgToggle = "Cache enabled";
let responseToggle = {
  success: 1,
  data: {
    value: 1,
    message: successMsgToggle,
  },
};

let counterToggle = 0;
let counter = 0;

let pagesRequestCount = 0;
let menusRequestCount = 0;

let server = setupServer(
  http.post("/api" + apiSecret + "/config/toggle-cache-enable-file", () => {
    counterToggle += 1;
    return HttpResponse.json(responseToggle);
  }),

  http.get("/api" + apiSecret + "/logout", async () => {
    counter += 1;
    const jsonRes = {
      success: true,
      message: "You have successfully logged out.",
    };

    return HttpResponse.json(jsonRes);
  }),

  http.get("/api" + apiSecret + "/pages", async () => {
    pagesRequestCount += 1;
    const jsonRes = {
      success: true,
      data: [],
    };

    return HttpResponse.json(jsonRes);
  }),

  http.get("/api" + apiSecret + "/menus", async () => {
    menusRequestCount += 1;
    const jsonRes = {
      success: true,
      data: [],
    };

    return HttpResponse.json(jsonRes);
  }),
);

beforeAll(() => {
  //server.listen();
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  counter = 0;
  counterToggle = 0;
  pagesRequestCount = 0;
  menusRequestCount = 0;
  server.resetHandlers();
});

afterAll(() => server.close());

const jsonStore2 = {
  auth: {
    token: "abcde12345",
  },
  //this data came from api/config and save to local storage
  config: {
    page_types: ["cms", "gallery", "main_page"],
    langs: ["en"],
    default_lang: "en",
    cache_enable: 1, //!!
    is_cache_enable: 0, //!!
    demo_status: 0, //!!!
  },
};

const setupStorage = async () => {
  localStorage.clear();
  storage.setItem("auth", jsonStore2.auth);
  storage.setItem("config", jsonStore2.config);
};

const setup = async (path) => {
  await router.push(path);
  await router.isReady();
  return render(App);
};

describe("sign out", () => {
  it("sign out exist", async () => {
    await setup("/");
    const linkSignOut = await screen.findByRole("link_sign_out");
    expect(linkSignOut).toBeInTheDocument();
  });

  it("click sign out link", async () => {
    setupStorage();
    await setup("/pages");

    const { token } = functions.retrieveParamsFromStorage();
    expect(token).not.toBe(0);

    const linkSignOut = await screen.findByRole("link_sign_out");

    expect(counter).toBe(0);
    expect(router.currentRoute.value.path).toBe("/pages");

    await userEvent.click(linkSignOut);

    await waitFor(() => {
      expect(counter).toBe(1);
      const { token } = functions.retrieveParamsFromStorage();
      expect(token).toBe(0);
      const header = screen.queryByRole("heading", { name: "Login" });
      expect(header).toBeInTheDocument();

      //it's worked
      expect(screen.queryByTestId("login-page")).toBeInTheDocument();
      expect(router.currentRoute.value.path).toBe("/");
    });
  });
});

describe("change cache in nav bar", () => {
  it("in nav bar cache enable by click input toggle cache", async () => {
    setupStorage();
    await setup("/pages");

    const isCacheEnable0 = storage.getItem("config").is_cache_enable;
    expect(isCacheEnable0).toBe(0);
    expect(counterToggle).toBe(0);

    const changeCacheEnable = await screen.queryByRole(
      "toggle_cache_enable_in_nav_bar",
    );
    await userEvent.click(changeCacheEnable);
    expect(counterToggle).toBe(1);

    const alertSuccessAfter = screen.queryByRole("alert_success");
    expect(alertSuccessAfter).not.toBeInTheDocument();

    await screen.findByText("cache enable"); //appear in nav bar

    const isCacheEnable1 = storage.getItem("config").is_cache_enable;
    expect(isCacheEnable1).toBe(1);
  });
});

describe("change cache in nav bar for demo version", () => {
  const jsonStore3 = {
    auth: {
      token: "abcde12345",
    },
    //this data came from api/config and save to local storage
    config: {
      page_types: ["cms", "gallery", "main_page"],
      langs: ["en"],
      default_lang: "en",
      cache_enable: 1, //!!
      is_cache_enable: 0, //!!
      demo_status: 1, //!!!
    },
  };

  const setupStorage3 = async () => {
    localStorage.clear();
    storage.setItem("auth", jsonStore3.auth);
    storage.setItem("config", jsonStore3.config);
  };

  it("in nav bar cache enable by click input toggle cache", async () => {
    setupStorage3();
    await setup("/pages");

    const isCacheEnable0 = storage.getItem("config").is_cache_enable;
    expect(isCacheEnable0).toBe(0);
    expect(counterToggle).toBe(0);

    const changeCacheEnable = await screen.queryByRole(
      "toggle_cache_enable_in_nav_bar",
    );

    // Mock the alert function
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    await userEvent.click(changeCacheEnable);

    // Check if the alert is displayed
    //const alert = await screen.findByRole("alert"); // Adjust the selector based on how the alert is implemented
    //expect(alert).toBeInTheDocument();

    // Verify the alert message
    const msg = trans.ttt("is_demo_true");
    expect(alertSpy).toHaveBeenCalledWith(msg);

    // Restore the original alert function
    alertSpy.mockRestore();
  });
});

describe("prevent redirect when user is auth", () => {
  it("MSW intercepts menus", async () => {
    const response = await fetch("http://localhost:3000/api/menus?token=test");

    expect(response.ok).toBe(true);

    const data = await response.json();

    expect(data).toEqual({
      success: true,
      data: [],
    });
  });

  it("MSW intercepts axios", async () => {
    const response = await axios.get(
      "http://localhost:3000/api/menus?token=test",
    );

    expect(response.status).toBe(200);

    expect(response.data).toEqual({
      success: true,
      data: [],
    });
  });

  it("MSW intercepts axios relative URL", async () => {
    const response = await axios.get("/api/menus?token=test");

    expect(response.status).toBe(200);

    expect(response.data).toEqual({
      success: true,
      data: [],
    });
  });

  it("prevent redirect to login page when user is auth", async () => {
    setupStorage();
    const { result } = await setup("/");

    const { token } = functions.retrieveParamsFromStorage();

    expect(token).not.toBe(0);

    await screen.findByTestId("pages-page");

    await waitFor(() => {
      //expect(screen.queryByTestId("pages-page")).toBeInTheDocument();
      expect(router.currentRoute.value.path).toBe("/pages");
    });

    await waitFor(() => {
      expect(counter).toBe(0);
    });

    await waitFor(() => {
      expect(pagesRequestCount).toBe(1);
    });

    await waitFor(() => {
      expect(menusRequestCount).toBe(1);
    });
  });
});

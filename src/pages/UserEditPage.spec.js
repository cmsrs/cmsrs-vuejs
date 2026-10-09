import {
  render,
  router,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "../../test/helper.js";
import "../../test/afterlogin.js";

import UserEditPage from "./UserEditPage.vue";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";
import trans from "../helpers/trans.js";
import storage from "../state/storage.js";
import { afterAll, beforeAll } from "vitest";
import { API_SECRET } from "../config.js";
const apiSecret = API_SECRET ? "/" + API_SECRET : "";

const responseGetClient = {
  success: 1,
  data: {
    id: 1,
    name: "Robert Test",
    email: "rob@unittest.com",
    email_verified_at: null,
    role: "client",
    created_at: "2024-04-04T09:50:48.000000Z",
    updated_at: "2024-04-04T09:50:48.000000Z",
  },
};

let server = setupServer(
  http.get("/api" + apiSecret + "/clients/1", () => {
    counter += 1;
    return HttpResponse.json(responseGetClient);
  }),

  http.put("/api" + apiSecret + "/clients/1", () => {
    counter += 1;
    return HttpResponse.json({
      success: true,
    });
  }),

  http.post("/api" + apiSecret + "/clients", () => {
    counter += 1;
    return HttpResponse.json({
      success: true,
    });
  }),
);

let counter = 0;

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});

afterAll(() => server.close());

const setupAdd = async () => {
  router.push("/user/add/");
  await router.isReady();
  return render(UserEditPage, {
    props: {
      mode: "add",
    },
  });
};

const setupEdit = async () => {
  router.push("/user/edit/1");
  await router.isReady();
  return render(UserEditPage, {
    props: {
      mode: "edit",
      id: "1",
    },
  });
};

const waitForAjax = async () => {
  const spinner = screen.queryByRole("pre_loader_add_edit_client");

  //console.log(spinner);
  expect(spinner).not.toBeNull();
  await waitForElementToBeRemoved(spinner);
};

describe.skip("empty token", () => {
  //TODO
  it("has user redirect", async () => {
    storage.setItem("auth", { token: "" });
    await setupAdd();
    const header = screen.queryByRole("heading", { name: "Add client" });
    expect(header).not.toBeInTheDocument();
  });
});

describe("User edit page", () => {
  describe("Layout", () => {
    it("has edit client header", async () => {
      await setupEdit();
      const header = screen.queryByRole("heading", { name: "Edit client" });
      expect(header).toBeInTheDocument();
      await waitForAjax();
    });

    it("has add client header", async () => {
      await setupAdd();
      const header = screen.queryByRole("heading", { name: "Add client" });
      expect(header).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("load client data", async () => {
      await setupEdit();

      await waitForAjax();
      expect(counter).toBe(1); //mount
    });

    it("new data", async () => {
      await setupAdd();
      expect(counter).toBe(0);
    });

    it("load edit client", async () => {
      await setupEdit();
      await waitForAjax();
      expect(counter).toBe(1);

      const email = screen.queryByPlaceholderText("email");
      expect(email).toHaveValue(responseGetClient.data.email);

      const name = screen.queryByPlaceholderText("name");
      expect(name).toHaveValue(responseGetClient.data.name);

      const password = screen.queryByPlaceholderText("password");
      expect(password).toHaveValue("");

      const password_confirmation = screen.queryByPlaceholderText(
        "password confirmation",
      );
      expect(password_confirmation).toHaveValue("");
    });

    it("load add client", async () => {
      await setupAdd();
      expect(counter).toBe(0);

      const email = screen.queryByPlaceholderText("email");
      expect(email).toHaveValue("");

      const name = screen.queryByPlaceholderText("name");
      expect(name).toHaveValue("");

      const password = screen.queryByPlaceholderText("password");
      expect(password).toHaveValue("");

      const password_confirmation = screen.queryByPlaceholderText(
        "password confirmation",
      );
      expect(password_confirmation).toHaveValue("");
    });

    it("edit client by click", async () => {
      await setupEdit();
      await waitForAjax();
      expect(counter).toBe(1);

      const email = screen.queryByPlaceholderText("email");
      await userEvent.type(email, "aaaa@example.com"); //email is not changeable in edit mode

      const name = screen.queryByPlaceholderText("name");
      await userEvent.type(name, "aaaaaaaaaaaaa");

      const password = screen.queryByPlaceholderText("password");
      await userEvent.type(password, "abc");

      const password_confirmation = screen.queryByPlaceholderText(
        "password confirmation",
      );
      await userEvent.type(password_confirmation, "abc");

      const buttonSubmit = screen.queryByRole("button_save_edit_client");
      await userEvent.click(buttonSubmit);
      expect(counter).toBe(2);

      const successMsg = trans.ttt("success_client_edit");
      expect(successMsg).not.toBe("");
      await screen.findByText(successMsg);
    });

    it("add client by click", async () => {
      await setupAdd();
      //await waitForAjax();
      expect(counter).toBe(0);

      const email = screen.queryByPlaceholderText("email");
      await userEvent.type(email, "aaaabb@example.com"); //email is not changeable in edit mode

      const name = screen.queryByPlaceholderText("name");
      await userEvent.type(name, "aaaaaaaaaaaaa");

      const password = screen.queryByPlaceholderText("password");
      await userEvent.type(password, "abc2");

      const password_confirmation = screen.queryByPlaceholderText(
        "password confirmation",
      );
      await userEvent.type(password_confirmation, "abc2");

      const buttonSubmit = screen.queryByRole("button_save_edit_client");
      await userEvent.click(buttonSubmit);
      expect(counter).toBe(1);

      const successMsg = trans.ttt("success_client_add");
      expect(successMsg).not.toBe("");
      await screen.findByText(successMsg);
    });
  });

  describe("Interactions validation errors", () => {
    it("add client with errors", async () => {
      const responseError = {
        success: false,
        error: {
          name: ["The name field is required."],
          email: ["The email has already been taken."],
          password: [
            "The password must be at least 8 characters.",
            "The password confirmation does not match.",
          ],
        },
      };

      server.use(
        http.post("/api" + apiSecret + "/clients", () => {
          counter += 1;
          return HttpResponse.json(responseError);
        }),
      );

      await setupAdd();
      //await waitForAjax();
      expect(counter).toBe(0);

      const email = screen.queryByPlaceholderText("email");
      await userEvent.type(email, "aaaabb@example.com"); //email is not changeable in edit mode

      const name = screen.queryByPlaceholderText("name");
      await userEvent.type(name, "aaaaaaaaaaaaa");

      const password = screen.queryByPlaceholderText("password");
      await userEvent.type(password, "abc");

      const password_confirmation = screen.queryByPlaceholderText(
        "password confirmation",
      );
      await userEvent.type(password_confirmation, "abc");

      const alertDangerAfter = screen.queryByRole("alert_danger");
      expect(alertDangerAfter).not.toBeInTheDocument();

      const buttonSubmit = screen.queryByRole("button_save_edit_client");
      await userEvent.click(buttonSubmit);
      expect(counter).toBe(1);

      await waitFor(() => {
        const alertDangerAfter2 = screen.queryByRole("alert_danger");
        expect(alertDangerAfter2).toBeInTheDocument();

        const email2 = screen.queryByPlaceholderText("email");
        expect(email2).toHaveClass("is-invalid");

        const name2 = screen.queryByPlaceholderText("name");
        expect(name2).toHaveClass("is-invalid");

        const password2 = screen.queryByPlaceholderText("password");
        expect(password2).toHaveClass("is-invalid");

        const password_confirmation2 = screen.queryByPlaceholderText(
          "password confirmation",
        );
        expect(password_confirmation2).toHaveClass("is-invalid");
      });
    });
  });
});

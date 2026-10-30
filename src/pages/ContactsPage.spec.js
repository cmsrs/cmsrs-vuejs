import {
  render,
  router,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "../../test/helper.js";
import "../../test/afterlogin.js";

import ContactsPage from "./ContactsPage.vue";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll } from "vitest";
import { API_SECRET } from "../config.js";
const apiSecret = API_SECRET ? "/" + API_SECRET : "";

const confirmSpy = vi.spyOn(window, "confirm");

const responseGetContacts = {
  success: 1,
  data: {
    current_page: 1,
    data: [
      {
        id: 2,
        email: "tt@cmsrs.pl",
        message: "test contact abc",
        created_at: "2024-05-23T11:21:56.000000Z",
        updated_at: "2024-05-23T11:21:56.000000Z",
      },
      {
        id: 1,
        email: "abc@cmsrs.pl",
        message: "test contact message",
        created_at: "2024-05-23T11:21:56.000000Z",
        updated_at: "2024-05-23T11:21:56.000000Z",
      },
    ],
    first_page_url:
      "http://127.0.0.1:8000/api/contacts/pagination/id/desc?page=1",
    from: 1,
    last_page: 1,
    last_page_url:
      "http://127.0.0.1:8000/api/contacts/pagination/id/desc?page=1",
    links: [
      {
        url: null,
        label: "« Previous",
        active: false,
      },
      {
        url: "http://127.0.0.1:8000/api/contacts/pagination/id/desc?page=1",
        label: "1",
        active: true,
      },
      {
        url: null,
        label: "Next »",
        active: false,
      },
    ],
    next_page_url: null,
    path: "http://127.0.0.1:8000/api/contacts/pagination/id/desc",
    per_page: 10,
    prev_page_url: null,
    to: 2,
    total: 2,
  },
};

let server = setupServer(
  http.get("/api" + apiSecret + "/contacts/pagination/created_at/desc", () => {
    counter += 1;
    return HttpResponse.json(responseGetContacts);
  }),

  http.get("/api" + apiSecret + "/contacts/pagination/email/asc", () => {
    counter += 1;
    return HttpResponse.json(responseGetContacts);
  }),

  http.get("/api" + apiSecret + "/contacts/pagination/email/desc", () => {
    counter += 1;
    return HttpResponse.json(responseGetContacts);
  }),

  http.delete("/api" + apiSecret + "/contacts/2", () => {
    counter += 1;
    return HttpResponse.json({
      success: true,
    });
  }),
);

beforeAll(() => {
  server.listen();
});

let counter = 0;

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterAll(() => server.close());

const setup = async () => {
  render(ContactsPage);
};

const waitForAjax = async () => {
  const spinner = screen.queryByRole("pre_loader_search_contact");
  expect(spinner).not.toBeNull();
  await waitForElementToBeRemoved(spinner);
};

describe("Contacts page", () => {
  describe("Layout", () => {
    it("has contacts header", async () => {
      await setup();
      const header = screen.queryByRole("heading", { name: "Contacts" });
      expect(header).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("show data in table", async () => {
      await setup();
      await waitForAjax();
      const email1 = responseGetContacts.data.data[0].email;
      await screen.findByText(email1);
      const message1 = responseGetContacts.data.data[0].message;
      await screen.findByText(message1);

      const email2 = responseGetContacts.data.data[1].email;
      await screen.findByText(email2);
      const message2 = responseGetContacts.data.data[1].message;
      await screen.findByText(message2);
    });

    it("stops the loader when loading contacts fails", async () => {
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

      server.use(
        http.get(
          "/api" + apiSecret + "/contacts/pagination/created_at/desc",
          () => HttpResponse.json({ message: "Server error" }, { status: 500 }),
        ),
      );

      try {
        await setup();
        const spinner = await screen.findByRole("pre_loader_search_contact");
        await waitForElementToBeRemoved(spinner);

        expect(
          screen.queryByRole("pre_loader_search_contact"),
        ).not.toBeInTheDocument();
        expect(consoleLog).toHaveBeenCalled();
      } finally {
        consoleLog.mockRestore();
      }
    });

    it("sorting asc by email", async () => {
      await setup();
      await waitForAjax();

      expect(counter).toBe(1);
      const button = screen.queryByRole("sorting_email_asc");
      await userEvent.click(button);
      expect(counter).toBe(2);

      const email1 = responseGetContacts.data.data[0].email;
      await screen.findByText(email1);
    });

    it("sorting desc by email", async () => {
      await setup();
      await waitForAjax();

      expect(counter).toBe(1);
      const button = screen.queryByRole("sorting_email_desc");
      await userEvent.click(button);
      expect(counter).toBe(2);

      const email1 = responseGetContacts.data.data[0].email;
      await screen.findByText(email1);
    });

    it("change pagination page", async () => {
      await setup();
      await waitForAjax();

      const aHref = screen.queryAllByRole("pagination_links");

      expect(counter).toBe(1); //mount
      await userEvent.click(aHref[1]);
      expect(counter).toBe(2); //mount+click
    });

    it("delete contact", async () => {
      confirmSpy.mockReturnValueOnce(true);
      await setup();
      await waitForAjax();

      expect(counter).toBe(1); //mount
      const contactDel = screen.queryAllByRole("del_contact");
      await userEvent.click(contactDel[0]);

      await waitFor(() => {
        expect(counter).toBe(3);
        const alertSuccessAfter = screen.queryByRole("alert_success");
        expect(alertSuccessAfter).toBeInTheDocument();
      });
    });

    it("search contact", async () => {
      await setup();
      await waitForAjax();

      expect(counter).toBe(1); //mount
      const search = screen.queryByRole("button_search_contact");
      await userEvent.click(search);
      await waitFor(() => {
        expect(counter).toBe(2);
      });
    });
  });
});

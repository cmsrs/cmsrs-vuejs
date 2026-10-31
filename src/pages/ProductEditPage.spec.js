import {
  render,
  router,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "../../test/helper.js";
import "../../test/afterlogin.js";

import ProductEditPage from "./ProductEditPage.vue";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";
import trans from "../helpers/trans.js";
import storage from "../state/storage.js";
import { afterAll, beforeAll } from "vitest";
import { API_SECRET } from "../config.js";
const apiSecret = API_SECRET ? "/" + API_SECRET : "";

const confirmSpy = vi.spyOn(window, "confirm");

const responseGetProduct = {
  success: 1,
  data: {
    id: 1,
    published: 1,
    sku: "AN/34534_1",
    price: 101,
    page_id: 1,
    product_name: {
      en: "php3 db app_1",
      pl: "php3 jako app bazodanowe",
    },
    product_name_slug: {
      en: "php3-db-app-1",
      pl: "php3-jako-app-bazodanowe",
    },
    product_description: {
      en: "book desc_1",
      pl: "php3 app bazodanowe",
    },
    product_name_default_lang: "php3 db app_1",
    tags: [91],
    images: [
      {
        id: 1,
        name: "phpunittest1.jpg",
        position: 1,
        page_id: null,
        product_id: 1,
        created_at: "2024-04-25T16:54:10.000000Z",
        updated_at: "2024-04-25T16:54:10.000000Z",
        alt: {
          en: "description img1 - product image",
          pl: "opis img1 - obraz produktu",
        },
        fs: {
          org: "/images/product/1/1/phpunittest1.jpg",
          small: "/images/product/1/1/phpunittest1-small.jpg",
          medium: "/images/product/1/1/phpunittest1-medium.jpg",
        },
      },
      {
        id: 2,
        name: "phpunittest2.jpg",
        position: 2,
        page_id: null,
        product_id: 1,
        created_at: "2024-04-25T16:54:10.000000Z",
        updated_at: "2024-04-25T16:54:10.000000Z",
        alt: {
          en: "",
          pl: "",
        },
        fs: {
          org: "/images/product/1/2/phpunittest2.jpg",
          small: "/images/product/1/2/phpunittest2-small.jpg",
          medium: "/images/product/1/2/phpunittest2-medium.jpg",
        },
      },
    ],
  },
};

const responsePagesTypeShop = {
  success: 1,
  data: [
    {
      id: 1,
      published: 0,
      commented: 0,
      after_login: 0,
      position: 1,
      type: "shop",
      menu_id: null,
      page_id: null,
      title: {
        en: "test p2",
      },
      short_title: {
        en: "p22",
      },
      description: {
        en: "",
      },
      content: {
        en: "aaa bbbb",
      },
      images: [],
    },
  ],
};

const productTagCategories = {
  success: true,
  data: {
    product: [
      {
        id: 10,
        name: { en: "Product category", pl: "Kategoria produktu" },
        tags: [
          { id: 91, name: { en: "Product tag", pl: "Tag produktu" } },
          { id: 92, name: { en: "Other product tag", pl: "Inny tag" } },
        ],
      },
    ],
    page: [
      {
        id: 11,
        name: { en: "Page category", pl: "Kategoria strony" },
        tags: [{ id: 93, name: { en: "Page tag", pl: "Tag strony" } }],
      },
    ],
  },
};

let lastProductUpdate = null;
let lastProductTagsUpdate = null;

let server = setupServer(
  http.get("/api" + apiSecret + "/tag-categories", () => {
    return HttpResponse.json(productTagCategories);
  }),

  http.get("/api" + apiSecret + "/pages/type/shop", () => {
    counter += 1;
    return HttpResponse.json(responsePagesTypeShop);
  }),

  http.get("/api" + apiSecret + "/products/1", () => {
    counter += 1;
    return HttpResponse.json(responseGetProduct);
  }),

  http.put("/api" + apiSecret + "/products/1", async ({ request }) => {
    counter += 1;
    lastProductUpdate = await request.json();
    return HttpResponse.json({
      success: true,
    });
  }),

  http.put("/api" + apiSecret + "/products/1/tags", async ({ request }) => {
    lastProductTagsUpdate = await request.json();
    return HttpResponse.json({ success: true });
  }),

  http.post("/api" + apiSecret + "/products", async ({ request }) => {
    counter += 1;
    lastProductUpdate = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        productId: 1,
        data: {},
      },
    });
  }),
);

let counter = 0;

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  counter = 0;
  lastProductUpdate = null;
  lastProductTagsUpdate = null;
  server.resetHandlers();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterAll(() => server.close());

const setupAdd = async () => {
  router.push("/product/add/");
  await router.isReady();
  return render(ProductEditPage, {
    props: {
      mode: "add",
    },
  });
};

const setupEdit = async () => {
  router.push("/product/edit/1");
  await router.isReady();
  return render(ProductEditPage, {
    props: {
      mode: "edit",
      id: "1",
    },
  });
};

const waitForAjax = async () => {
  const spinner = screen.queryByRole("pre_loader_add_edit_product");

  //console.log(spinner);
  expect(spinner).not.toBeNull();
  await waitForElementToBeRemoved(spinner);
};

describe.skip("empty token", () => {
  //TODO
  it("has product redirect", async () => {
    storage.setItem("auth", { token: "" });
    await setupAdd();
    await waitForAjax();
    const header = screen.queryByRole("heading", { name: "Add product" });
    expect(header).not.toBeInTheDocument();
  });
});

describe("Product edit or add page", () => {
  describe("Layout", () => {
    it("has edit product header", async () => {
      await setupEdit();
      await waitForAjax();
      const header = screen.queryByRole("heading", { name: "Edit product" });
      expect(header).toBeInTheDocument();
    });

    it("has add product header", async () => {
      await setupAdd();
      await waitForAjax();

      const header = screen.queryByRole("heading", { name: "Add product" });
      expect(header).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("load product data", async () => {
      await setupEdit();

      await waitForAjax();
      expect(counter).toBe(2); //mount
    });

    it("new data", async () => {
      await setupAdd();
      await waitForAjax();
      expect(counter).toBe(1);
    });

    it("load edit product", async () => {
      await setupEdit();
      await waitForAjax();
      expect(counter).toBe(2);

      const product_name = screen.queryByPlaceholderText("product name");
      expect(product_name).toHaveValue(
        responseGetProduct.data.product_name["en"],
      );

      const sku = screen.queryByPlaceholderText("sku");
      expect(sku).toHaveValue(responseGetProduct.data.sku);

      const price = screen.queryByPlaceholderText("price");
      expect(price).toHaveValue(responseGetProduct.data.price.toString());

      const published = screen.queryByLabelText("Published");
      expect(published).toBeChecked(); //  toHaveValue(responseGetProduct.data.published);

      const productDescription = screen.queryByPlaceholderText(
        "product description",
      );
      expect(productDescription).toHaveValue(
        responseGetProduct.data.product_description["en"],
      );

      const assignedTags = screen.getByTestId("assigned-product-tags");
      expect(assignedTags).toHaveTextContent("Product tag");
      expect(screen.getByRole("product_tag_select")).toHaveTextContent(
        "Other product tag",
      );
      expect(screen.getByRole("product_tag_select")).not.toHaveTextContent(
        "Page tag",
      );
    });

    it("load add product", async () => {
      await setupAdd();
      await waitForAjax();
      expect(counter).toBe(1);

      const sku = screen.queryByPlaceholderText("sku");
      expect(sku).toHaveValue("");

      const product_name = screen.queryByPlaceholderText("product name");
      expect(product_name).toHaveValue("");

      const price = screen.queryByPlaceholderText("price");
      expect(price).toHaveValue("");

      const published = screen.queryByLabelText("Published");
      expect(published).not.toBeChecked();

      const productDescription = screen.queryByPlaceholderText(
        "product description",
      );
      expect(productDescription).toHaveValue("");
    });

    it("edit product by click", async () => {
      await setupEdit();
      await waitForAjax();
      expect(counter).toBe(2);

      const sku = screen.queryByPlaceholderText("sku");
      await userEvent.type(sku, "sku/test/123");

      const buttonSubmit = screen.queryByRole("button_save_edit_product");
      await userEvent.click(buttonSubmit);
      expect(counter).toBe(3);
      expect(lastProductUpdate.tags).toEqual([91]);

      const successMsg = trans.ttt("success_product_edit");
      expect(successMsg).not.toBe("");
      await screen.findByText(successMsg);
    });

    it("add product by click and redirect to edit page", async () => {
      await setupAdd();
      await waitForAjax();
      expect(counter).toBe(1);

      const product_name = screen.queryByPlaceholderText("product name");
      await userEvent.type(product_name, "aaaaaaaaaaaaa");

      const sku = screen.queryByPlaceholderText("sku");
      await userEvent.type(sku, "aaaabb/16/3");

      const price = screen.queryByPlaceholderText("price");
      await userEvent.type(price, "323");

      //const published = screen.queryByLabelText("Published");
      //expect(published).toBeChecked();//  toHaveValue(responseGetProduct.data.published);

      const productDescription = screen.queryByPlaceholderText(
        "product description",
      );
      await userEvent.type(productDescription, "323");

      await userEvent.selectOptions(
        screen.getByRole("product_tag_select"),
        "92",
      );
      expect(screen.getByTestId("assigned-product-tags")).toHaveTextContent(
        "Other product tag",
      );

      const buttonSubmit = screen.queryByRole("button_save_edit_product");
      await userEvent.click(buttonSubmit);
      expect(counter).toBe(2);
      expect(lastProductUpdate.tags).toEqual([92]);

      expect(router.currentRoute.value.path).toBe("/product/edit/1");
      const header = screen.queryByRole("heading", { name: "Edit product" });
      expect(header).toBeInTheDocument();

      const successMsg = trans.ttt("success_product_add");
      expect(successMsg).not.toBe("");
      await screen.findByText(successMsg);
    });

    it("removes an existing product tag after confirmation", async () => {
      await setupEdit();
      await waitForAjax();
      expect(screen.getByTestId("assigned-product-tags")).toHaveTextContent(
        "Product tag",
      );

      confirmSpy.mockReturnValueOnce(true);
      await userEvent.click(
        screen
          .getByTestId("assigned-product-tags")
          .querySelector(
            '[data-assigned-tag-id="91"] [role="del_product_tag"]',
          ),
      );

      await waitFor(() => expect(lastProductTagsUpdate).toEqual({ tags: [] }));
      expect(screen.getByTestId("assigned-product-tags")).not.toHaveTextContent(
        "Product tag",
      );
    });

    it("keeps an existing product tag when deletion is cancelled", async () => {
      await setupEdit();
      await waitForAjax();

      confirmSpy.mockReturnValueOnce(false);
      await userEvent.click(
        screen
          .getByTestId("assigned-product-tags")
          .querySelector(
            '[data-assigned-tag-id="91"] [role="del_product_tag"]',
          ),
      );

      expect(lastProductTagsUpdate).toBeNull();
      expect(screen.getByTestId("assigned-product-tags")).toHaveTextContent(
        "Product tag",
      );
    });
  });

  describe("Interactions edit product change lang", () => {
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
        is_shop: 1,
      },
    };

    it("show data in Polish language", async () => {
      localStorage.clear();
      storage.setItem("auth", jsonStore2.auth);
      storage.setItem("config", jsonStore2.config);
      await setupEdit();
      await waitForAjax();
      expect(counter).toBe(2);

      await waitFor(() => {
        const productPl = screen.queryByRole("product_name_pl");
        expect(productPl).toBeInTheDocument();

        const product_name1 = responseGetProduct.data.product_name["pl"];
        expect(productPl.value).toBe(product_name1);

        const productEn = screen.queryByRole("product_name_en");
        expect(productEn).not.toBeInTheDocument();

        //const sku1 = responseGetProduct.data.sku;
        //screen.findByText(sku1);

        //const product_name1 = responseGetProduct.data.product_name['pl'];
        //screen.findByText(product_name1);
      });
    });

    it("change lang from Polish to England", async () => {
      localStorage.clear();
      storage.setItem("auth", jsonStore2.auth);
      storage.setItem("config", jsonStore2.config);
      await setupEdit();
      await waitForAjax();

      //see previous test
      //const product_name1 = responseGetProduct.data.product_name['pl'];
      //await screen.findByText(product_name1);

      const productPl = screen.queryByRole("product_name_pl");
      expect(productPl).toBeInTheDocument();

      const productEn = screen.queryByRole("product_name_en");
      expect(productEn).not.toBeInTheDocument();

      const langEn = screen.queryByRole("lang_en");
      await userEvent.click(langEn);

      await waitFor(() => {
        const product_name2 = responseGetProduct.data.product_name["en"];

        const productEn = screen.queryByRole("product_name_en");
        expect(productEn).toBeInTheDocument();
        expect(productEn.value).toBe(product_name2);

        const productPl = screen.queryByRole("product_name_pl");
        expect(productPl).not.toBeInTheDocument();
      });
    });
  });

  describe("Interactions validation errors", () => {
    it("add product with errors", async () => {
      const responseError = {
        success: false,
        error: {
          sku: ["The sku has already been taken."],
          price: [
            "The price must be an integer.",
            "The price field is required.",
          ],
        },
      };

      server.use(
        http.post("/api" + apiSecret + "/products", () => {
          counter += 1;
          return HttpResponse.json(responseError);
        }),
        http.get("/api" + apiSecret + "/pages/type/shop", () => {
          counter += 1;
          return HttpResponse.json(responsePagesTypeShop);
        }),
      );

      await setupAdd();
      await waitForAjax();
      expect(counter).toBe(1);

      //const sku = screen.queryByPlaceholderText("sku");
      //await userEvent.type(sku, "b/4345");

      const product_name = screen.queryByPlaceholderText("product name");
      await userEvent.type(product_name, "TV");

      const alertDangerAfter = screen.queryByRole("alert_danger");
      expect(alertDangerAfter).not.toBeInTheDocument();

      const buttonSubmit = screen.queryByRole("button_save_edit_product");
      await userEvent.click(buttonSubmit);
      expect(counter).toBe(2);

      await waitFor(() => {
        const alertDangerAfter2 = screen.queryByRole("alert_danger");
        expect(alertDangerAfter2).toBeInTheDocument();

        const sku2 = screen.queryByPlaceholderText("sku");
        expect(sku2).toHaveClass("is-invalid");

        const price = screen.queryByPlaceholderText("price");
        expect(price).toHaveClass("is-invalid");
      });
    });
  });
});

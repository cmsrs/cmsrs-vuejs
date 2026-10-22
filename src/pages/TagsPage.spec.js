import { render, screen, waitFor } from "../../test/helper.js";

import "../../test/afterlogin.js";

import TagsPage from "./TagsPage.vue";

import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import userEvent from "@testing-library/user-event";

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import trans from "../helpers/trans.js";
import storage from "../state/storage.js";
import { API_SECRET } from "../config.js";

const apiSecret = API_SECRET ? "/" + API_SECRET : "";
const apiUrl = "/api" + apiSecret;

const confirmSpy = vi.spyOn(window, "confirm");

const categoriesInitial = [
  {
    id: 1,
    entity_type: "product",
    name: {
      en: "Product type",
      pl: "Typ produktu",
    },
  },
  {
    id: 2,
    entity_type: "page",
    name: {
      en: "Color",
      pl: "Kolor",
    },
  },
];

const tagsInitial = [
  {
    id: 1,
    tag_category_id: 1,
    name: {
      en: "Shoes",
      pl: "Buty",
    },
  },
  {
    id: 2,
    tag_category_id: 1,
    name: {
      en: "T-Shirts",
      pl: "Koszulki",
    },
  },
  {
    id: 3,
    tag_category_id: 2,
    name: {
      en: "Red",
      pl: "Czerwony",
    },
  },
];

const getGroupedCategories = () =>
  categories.reduce((grouped, category) => {
    const { entity_type: entityType } = category;
    grouped[entityType] ||= [];
    grouped[entityType].push({
      ...category,
      tags: tags
        .filter((tag) => Number(tag.tag_category_id) === Number(category.id))
        .map(({ id, name }) => ({ id, name })),
    });
    return grouped;
  }, {});

let categories;
let tags;

let counterPostCategory;
let counterPutCategory;
let counterDeleteCategory;

let counterPostTag;
let counterPutTag;
let counterDeleteTag;

let lastCategoryRequest;
let lastTagRequest;

const server = setupServer(
  // Categories

  http.get(apiUrl + "/tag-categories", () => {
    return HttpResponse.json({
      success: true,
      data: getGroupedCategories(),
    });
  }),

  http.post(apiUrl + "/tag-categories", async ({ request }) => {
    counterPostCategory += 1;
    lastCategoryRequest = await request.json();

    categories.push({
      id: 10 + counterPostCategory,
      ...lastCategoryRequest,
    });

    return HttpResponse.json({
      success: true,
    });
  }),

  http.put(apiUrl + "/tag-categories/:id", async ({ request, params }) => {
    counterPutCategory += 1;
    lastCategoryRequest = await request.json();

    const id = Number(params.id);

    categories = categories.map((category) =>
      category.id === id
        ? {
            ...category,
            ...lastCategoryRequest,
          }
        : category,
    );

    return HttpResponse.json({
      success: true,
    });
  }),

  http.delete(apiUrl + "/tag-categories/:id", ({ params }) => {
    counterDeleteCategory += 1;

    const id = Number(params.id);

    categories = categories.filter((category) => category.id !== id);

    return HttpResponse.json({
      success: true,
    });
  }),

  // Tags

  http.get(apiUrl + "/tags", () => {
    return HttpResponse.json({
      success: true,
      data: tags,
    });
  }),

  http.post(apiUrl + "/tags", async ({ request }) => {
    counterPostTag += 1;
    lastTagRequest = await request.json();

    tags.push({
      id: 10 + counterPostTag,
      ...lastTagRequest,
    });

    return HttpResponse.json({
      success: true,
    });
  }),

  http.put(apiUrl + "/tags/:id", async ({ request, params }) => {
    counterPutTag += 1;
    lastTagRequest = await request.json();

    const id = Number(params.id);

    tags = tags.map((tag) =>
      tag.id === id
        ? {
            ...tag,
            ...lastTagRequest,
          }
        : tag,
    );

    return HttpResponse.json({
      success: true,
    });
  }),

  http.delete(apiUrl + "/tags/:id", ({ params }) => {
    counterDeleteTag += 1;

    const id = Number(params.id);

    tags = tags.filter((tag) => tag.id !== id);

    return HttpResponse.json({
      success: true,
    });
  }),
);

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

beforeEach(() => {
  categories = structuredClone(categoriesInitial);
  tags = structuredClone(tagsInitial);

  counterPostCategory = 0;
  counterPutCategory = 0;
  counterDeleteCategory = 0;

  counterPostTag = 0;
  counterPutTag = 0;
  counterDeleteTag = 0;

  lastCategoryRequest = null;
  lastTagRequest = null;

  localStorage.clear();

  storage.setItem("auth", {
    isLoggedIn: true,
    token: "abcde12345",
  });

  storage.setItem("config", {
    page_types: ["cms", "gallery", "main_page"],
    langs: ["en", "pl"],
    default_lang: "en",
    cache_enable: 1,
    is_shop: 1,
    tag_entity_types: ["product", "page"],
  });

  confirmSpy.mockReturnValue(true);

  server.resetHandlers();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});

// Helpers

const setup = async () => {
  render(TagsPage);

  await waitFor(() => {
    expect(screen.getByTestId("tags-page")).toBeInTheDocument();
  });

  await waitForInitialData();
};

const waitForInitialData = async () => {
  await screen.findByText("Shoes");
  await screen.findByText("T-Shirts");
  await screen.findByText("Red");
};

const getCategoryContainer = (id) => {
  const container = document.querySelector(`[data-category-id="${id}"]`);

  expect(container).not.toBeNull();

  return container;
};

const getNewCategoryForm = () => screen.getByTestId("new-category-form");

const getNewCategoryInput = (lang = "en") => {
  const form = getNewCategoryForm();

  const input = form.querySelector(
    `input[placeholder="Category name ${lang}"]`,
  );

  expect(input).not.toBeNull();

  return input;
};

const changeLanguage = async (lang) => {
  const languageElement = screen.getByRole(`lang_${lang}`);
  await userEvent.click(languageElement);
};

// ==================================================
// Initialization
// ==================================================

describe("Tags page - initialization", () => {
  it("displays the page header", async () => {
    await setup();

    expect(
      screen.getByRole("heading", {
        name: "Tags",
      }),
    ).toBeInTheDocument();
  });

  it("loads categories and tags from API", async () => {
    await setup();

    expect(screen.getByText("Shoes")).toBeInTheDocument();
    expect(screen.getByText("T-Shirts")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();

    expect(screen.getByText("Product type")).toBeInTheDocument();
    expect(screen.getByText("Color")).toBeInTheDocument();

    const headings = screen.getAllByRole("heading", { level: 4 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Product",
      "Page",
    ]);

    const firstCategory = getCategoryContainer(1);

    expect(
      firstCategory.querySelector('input[placeholder="Category name en"]'),
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Tag name en")).toBeInTheDocument();
  });

  it("displays tags under their respective categories", async () => {
    await setup();

    const firstCategory = getCategoryContainer(1);
    const secondCategory = getCategoryContainer(2);

    expect(firstCategory).toHaveTextContent("Shoes");
    expect(firstCategory).toHaveTextContent("T-Shirts");

    expect(secondCategory).toHaveTextContent("Red");
    expect(secondCategory).not.toHaveTextContent("Shoes");
  });

  it("does not display a tag in an unrelated category", async () => {
    await setup();

    const secondCategory = getCategoryContainer(2);

    expect(secondCategory).not.toHaveTextContent("T-Shirts");
  });
});

// ==================================================
// Category creation
// ==================================================

describe("Tags page - add category", () => {
  it("opens the new category form", async () => {
    await setup();

    await userEvent.click(screen.getByRole("button_add_tag_category"));

    expect(screen.getByText("New category")).toBeInTheDocument();

    expect(getNewCategoryInput("en")).toBeInTheDocument();
  });

  it("creates a category with translations", async () => {
    await setup();

    await userEvent.click(screen.getByRole("button_add_tag_category"));

    const englishInput = getNewCategoryInput("en");

    await userEvent.type(englishInput, "Material");

    // Switch to Polish to enter the Polish translation.
    await changeLanguage("pl");

    const polishInput = getNewCategoryInput("pl");

    await userEvent.type(polishInput, "Materiall");

    await userEvent.click(
      getNewCategoryForm().querySelector('[role="button_save_tag_category"]'),
    );

    await waitFor(() => {
      expect(counterPostCategory).toBe(1);
    });

    expect(lastCategoryRequest).toMatchObject({
      entity_type: "product",
      name: {
        en: "Material",
        pl: "Materiall",
      },
    });
  });

  it("does not send a request when category name is empty", async () => {
    await setup();

    await userEvent.click(screen.getByRole("button_add_tag_category"));

    const englishInput = getNewCategoryInput("en");

    await userEvent.type(englishInput, "Material");

    await userEvent.click(
      getNewCategoryForm().querySelector('[role="button_save_tag_category"]'),
    );

    expect(getNewCategoryInput("en")).toHaveClass("is-invalid");

    const errMsg = trans.ttt("msg_add_category_name");
    expect(errMsg).not.toBe("");
    await screen.findByText(errMsg + " (pl)");

    expect(counterPostCategory).toBe(0);
  });

  it("does not send a request when category entity type is empty", async () => {
    await setup();

    await userEvent.click(screen.getByRole("button_add_tag_category"));

    await userEvent.type(getNewCategoryInput("en"), "Material");

    await changeLanguage("pl");

    await userEvent.type(getNewCategoryInput("pl"), "Materiall");

    const form = getNewCategoryForm();

    const entityTypeSelect = form.querySelector("select");
    expect(entityTypeSelect).not.toBeNull();

    await userEvent.selectOptions(entityTypeSelect, "");

    await userEvent.click(
      form.querySelector('[role="button_save_tag_category"]'),
    );

    const errMsg = trans.ttt("msg_select_category_entity_type");
    expect(errMsg).not.toBe("");
    await screen.findByText(errMsg);

    expect(counterPostCategory).toBe(0);
  });

  it("closes the new category form when cancel is clicked", async () => {
    await setup();

    await userEvent.click(screen.getByRole("button_add_tag_category"));

    expect(screen.getByText("New category")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button_cancel_new_tag_category"));

    expect(screen.queryByText("New category")).not.toBeInTheDocument();
  });
});

// ==================================================
// Category editing and deletion
// ==================================================

describe("Tags page - edit category", () => {
  it("updates an existing category", async () => {
    await setup();

    const category = getCategoryContainer(1);
    const input = category.querySelector("input");

    await userEvent.clear(input);
    await userEvent.type(input, "Footwear");

    await userEvent.click(
      category.querySelector('[role="button_save_tag_category"]'),
    );

    await waitFor(() => {
      expect(counterPutCategory).toBe(1);
    });

    expect(lastCategoryRequest).toMatchObject({
      entity_type: "product",
      name: {
        en: "Footwear",
        pl: "Typ produktu",
      },
    });
  });

  it("does not update a category with an empty name", async () => {
    await setup();

    const category = getCategoryContainer(1);
    const input = category.querySelector("input");

    await userEvent.clear(input);

    await userEvent.click(
      category.querySelector('[role="button_save_tag_category"]'),
    );

    expect(counterPutCategory).toBe(0);
    expect(input).toHaveClass("is-invalid");
  });

  it("deletes a category after confirmation", async () => {
    await setup();

    confirmSpy.mockReturnValueOnce(true);

    const category = getCategoryContainer(2);

    await userEvent.click(
      category.querySelector('[role="button_delete_tag_category"]'),
    );

    await waitFor(() => {
      expect(counterDeleteCategory).toBe(1);
    });

    await waitFor(() => {
      expect(document.querySelector('[data-category-id="2"]')).toBeNull();
    });
  });

  it("does not delete a category when confirmation is rejected", async () => {
    await setup();

    confirmSpy.mockReturnValueOnce(false);

    const category = getCategoryContainer(2);

    await userEvent.click(
      category.querySelector('[role="button_delete_tag_category"]'),
    );

    expect(counterDeleteCategory).toBe(0);

    expect(document.querySelector('[data-category-id="2"]')).not.toBeNull();
  });
});

// ==================================================
// Tag creation
// ==================================================

describe("Tags page - add tag", () => {
  it("does not create a tag without a name", async () => {
    await setup();

    await userEvent.click(screen.getByRole("button_add_tag"));

    expect(counterPostTag).toBe(0);

    expect(screen.getByPlaceholderText("Tag name en")).toHaveClass(
      "is-invalid",
    );
  });

  it("does not create a tag without a category", async () => {
    await setup();

    await userEvent.type(screen.getByPlaceholderText("Tag name en"), "Leather");

    await changeLanguage("pl");

    await userEvent.type(screen.getByPlaceholderText("Tag name pl"), "Skoora");

    await userEvent.click(screen.getByRole("button_add_tag"));

    const errMsg = trans.ttt("msg_select_tag_category");
    expect(errMsg).not.toBe("");
    await screen.findByText(errMsg);

    expect(counterPostTag).toBe(0);
  });

  it("creates a tag with a category and translations", async () => {
    await setup();

    await userEvent.type(screen.getByPlaceholderText("Tag name en"), "Leather");

    await changeLanguage("pl");

    await userEvent.type(screen.getByPlaceholderText("Tag name pl"), "Skoora");

    await userEvent.selectOptions(screen.getByLabelText("Category:"), "1");

    await userEvent.click(screen.getByRole("button_add_tag"));

    await waitFor(() => {
      expect(counterPostTag).toBe(1);
    });

    expect(lastTagRequest).toMatchObject({
      name: {
        en: "Leather",
        pl: "Skoora",
      },
      tag_category_id: 1,
    });

    expect(await screen.findByText("Skoora")).toBeInTheDocument();
  });
});

// ==================================================
// Tag editing
// ==================================================

describe("Tags page - edit tag", () => {
  it("loads a selected tag into the form", async () => {
    await setup();

    await userEvent.click(screen.getByText("Shoes"));

    expect(screen.getByPlaceholderText("Tag name en")).toHaveValue("Shoes");

    expect(screen.getByLabelText("Category:")).toHaveValue("1");

    expect(screen.getByRole("button_add_tag")).toHaveTextContent("Save tag");
  });

  it("updates an existing tag", async () => {
    await setup();

    await userEvent.click(screen.getByText("Shoes"));

    const nameInput = screen.getByPlaceholderText("Tag name en");

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Boots");

    await userEvent.click(screen.getByRole("button_add_tag"));

    await waitFor(() => {
      expect(counterPutTag).toBe(1);
    });

    expect(lastTagRequest).toMatchObject({
      name: {
        en: "Boots",
        pl: "Buty",
      },
      tag_category_id: 1,
    });

    expect(await screen.findByText("Boots")).toBeInTheDocument();
  });

  it("does not update a tag when the name is empty", async () => {
    await setup();

    await userEvent.click(screen.getByText("Shoes"));

    await userEvent.clear(screen.getByPlaceholderText("Tag name en"));

    await userEvent.click(screen.getByRole("button_add_tag"));

    expect(counterPutTag).toBe(0);

    expect(screen.getByPlaceholderText("Tag name en")).toHaveClass(
      "is-invalid",
    );
  });

  it("clears the tag form", async () => {
    await setup();

    await userEvent.click(screen.getByText("Shoes"));

    expect(screen.getByPlaceholderText("Tag name en")).toHaveValue("Shoes");

    await userEvent.click(screen.getByRole("button_clear_tag"));

    expect(screen.getByPlaceholderText("Tag name en")).toHaveValue("");

    expect(screen.getByLabelText("Category:")).toHaveValue("");

    expect(screen.getByRole("button_add_tag")).toHaveTextContent("Add tag");
  });
});

// ==================================================
// Tag deletion
// ==================================================

describe("Tags page - delete tag", () => {
  it("does not delete a tag when deletion is cancelled", async () => {
    await setup();

    expect(screen.getByText("Shoes")).toBeInTheDocument();

    confirmSpy.mockReturnValueOnce(false);

    const category = getCategoryContainer(1);

    await userEvent.click(category.querySelector('[role="button_delete_tag"]'));

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(counterDeleteTag).toBe(0);
    expect(screen.getByText("Shoes")).toBeInTheDocument();
  });

  it("deletes a selected tag after confirmation", async () => {
    await setup();

    expect(screen.getByText("Shoes")).toBeInTheDocument();
    //await userEvent.click(screen.getByText("Shoes")); -- jak to odkomentuje to test zadziala - nie rozumem - przeciez tylko wystarczy kliknac  przyciks:     await userEvent.click(category.querySelector('[role="button_delete_tag"]')); - i nie trzeba klikac na ta kategorie ?? = nie rozumem tego

    confirmSpy.mockReturnValueOnce(true);

    const category = getCategoryContainer(1);

    await userEvent.click(category.querySelector('[role="button_delete_tag"]'));

    await waitFor(() => {
      expect(counterDeleteTag).toBe(1);
    });

    await waitFor(() => {
      expect(screen.queryByText("Shoes")).not.toBeInTheDocument();
    });
  });

  it("does not delete a tag when confirmation is rejected", async () => {
    await setup();

    expect(screen.queryByText("Shoes")).toBeInTheDocument();

    confirmSpy.mockReturnValueOnce(false);

    const category = getCategoryContainer(1);

    await userEvent.click(category.querySelector('[role="button_delete_tag"]'));

    expect(counterDeleteTag).toBe(0);
    expect(screen.getByText("Shoes")).toBeInTheDocument();
  });
});

// ==================================================
// API errors
// ==================================================

describe("Tags page - API errors", () => {
  it("displays an error when loading categories fails", async () => {
    server.use(
      http.get(apiUrl + "/tag-categories", () => {
        return HttpResponse.json(
          {
            success: false,
            error: "Category loading failed",
          },
          {
            status: 500,
          },
        );
      }),
    );

    render(TagsPage);

    expect(await screen.findByTestId("tags-page")).toBeInTheDocument();

    expect(await screen.findByRole("alert_danger")).toBeInTheDocument();
  });

  it("displays an error when creating a tag fails", async () => {
    server.use(
      http.post(apiUrl + "/tags", () => {
        return HttpResponse.json(
          {
            success: false,
            error: "Tag creation failed",
          },
          {
            status: 500,
          },
        );
      }),
    );

    await setup();

    await userEvent.type(screen.getByPlaceholderText("Tag name en"), "Leather");

    await changeLanguage("pl");

    await userEvent.type(screen.getByPlaceholderText("Tag name pl"), "Skoora");

    await userEvent.selectOptions(screen.getByLabelText("Category:"), "1");

    await userEvent.click(screen.getByRole("button_add_tag"));

    await waitFor(() => {
      expect(counterPostTag).toBe(0);
    });

    expect(await screen.findByRole("alert_danger")).toBeInTheDocument();
  });
});

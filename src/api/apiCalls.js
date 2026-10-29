import axios from "axios";
import { API_SECRET } from "../config.js";
import { useAuthStore } from "../state/store.js";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();

      authStore.logout();

      window.location.assign("/admin/login");
    }

    return Promise.reject(error);
  },
);

const apiSecret = API_SECRET ? "/" + API_SECRET : "";

export const login = (creds) => {
  return axios.post("/api/login", creds);
};

export const config = (token) => {
  return axios.get("/api" + apiSecret + "/config?token=" + token);
};

export const logout = (token) => {
  return axios.get("/api" + apiSecret + "/logout?token=" + token);
};

export const postPage = (post, token) => {
  const ret = axios.post("/api" + apiSecret + "/pages?token=" + token, post);
  return ret;
};

export const putPage = (post, id, token) => {
  return axios.put(
    "/api" + apiSecret + "/pages/" + id + "?token=" + token,
    post,
  );
};

export const getPages = (token) => {
  return axios.get("/api" + apiSecret + "/pages?token=" + token);
};

//it use in products, where type = 'shop'
export const getPagesByType = (type, token) => {
  return axios.get(
    "/api" + apiSecret + "/pages/type/" + type + "?token=" + token,
  );
};

//when click edit  page we get new data
export const getPage = (id, token) => {
  return axios.get("/api" + apiSecret + "/pages/" + id + "?token=" + token);
};

export const postMenu = (post, token) => {
  return axios.post("/api" + apiSecret + "/menus?token=" + token, post);
};

export const putMenu = (post, token) => {
  const id = post["id"];
  return axios.put(
    "/api" + apiSecret + "/menus/" + id + "?token=" + token,
    post,
  );
};

export const getMenus = (token) => {
  return axios.get("/api" + apiSecret + "/menus?token=" + token);
};

export const deleteMenu = (id, token) => {
  return axios.delete("/api" + apiSecret + "/menus/" + id + "?token=" + token);
};

export const setMenuPosition = (direction, id, token) => {
  return axios.patch(
    "/api" +
      apiSecret +
      "/menus/position/" +
      direction +
      "/" +
      id +
      "?token=" +
      token,
  );
};

export const setPagePosition = (direction, id, token) => {
  return axios.patch(
    "/api" +
      apiSecret +
      "/pages/position/" +
      direction +
      "/" +
      id +
      "?token=" +
      token,
  );
};

export const deletePage = (id, token) => {
  return axios.delete("/api" + apiSecret + "/pages/" + id + "?token=" + token);
};

export const uploadImage = (post, type, id, token) => {
  return axios.post(
    "/api" + apiSecret + "/image/" + type + "/" + id + "?token=" + token,
    post,
  );
};

export const getImages = (type, id, token) => {
  return axios.get(
    "/api" + apiSecret + "/images/" + type + "/" + id + "?token=" + token,
  );
};

//we can also delete many images, see API docs
export const deleteImage = (id, token) => {
  return axios.delete("/api" + apiSecret + "/images/" + id + "?token=" + token);
};

export const setImagePosition = (direction, id, token) => {
  return axios.patch(
    "/api" +
      apiSecret +
      "/images/position/" +
      direction +
      "/" +
      id +
      "?token=" +
      token,
  );
};

export const getClients = (column, direction, token, page, search) => {
  let strSearch = "";
  if (search) {
    strSearch = "&search=" + search;
  }

  const pageNumber = page ? page : "1";
  const url =
    "/api" +
    apiSecret +
    "/clients/" +
    column +
    "/" +
    direction +
    "?token=" +
    token +
    "&page=" +
    pageNumber +
    strSearch;

  return axios.get(url);
};

export const getContacts = (column, direction, token, page, search) => {
  let strSearch = "";
  if (search) {
    strSearch = "&search=" + search;
  }

  const pageNumber = page ? page : "1";
  const url =
    "/api" +
    apiSecret +
    "/contacts/pagination/" +
    column +
    "/" +
    direction +
    "?token=" +
    token +
    "&page=" +
    pageNumber +
    strSearch;

  return axios.get(url);
};

export const getProducts = (lang, column, direction, token, page, search) => {
  let strSearch = "";
  if (search) {
    strSearch = "&search=" + search;
  }

  const pageNumber = page ? page : "1";
  // /api/products/pagination/en/product_name/desc
  const url =
    "/api" +
    apiSecret +
    "/products/pagination/" +
    lang +
    "/" +
    column +
    "/" +
    direction +
    "?token=" +
    token +
    "&page=" +
    pageNumber +
    strSearch;

  return axios.get(url);
};

export const getCheckouts = (lang, column, direction, token, page, search) => {
  let strSearch = "";
  if (search) {
    strSearch = "&search=" + search;
  }

  const pageNumber = page ? page : "1";
  // /api/products/pagination/en/product_name/desc
  const url =
    "/api" +
    apiSecret +
    "/checkouts/pagination/" +
    lang +
    "/" +
    column +
    "/" +
    direction +
    "?token=" +
    token +
    "&page=" +
    pageNumber +
    strSearch;

  return axios.get(url);
};

export const putCheckout = (post, id, token) => {
  return axios.patch(
    "/api" + apiSecret + "/checkouts/" + id + "?token=" + token,
    post,
  );
};

export const deleteProduct = (id, token) => {
  return axios.delete(
    "/api" + apiSecret + "/products/" + id + "?token=" + token,
  );
};

export const deleteClient = (id, token) => {
  return axios.delete(
    "/api" + apiSecret + "/clients/" + id + "?token=" + token,
  );
};

export const deleteContact = (id, token) => {
  return axios.delete(
    "/api" + apiSecret + "/contacts/" + id + "?token=" + token,
  );
};

export const getClient = (id, token) => {
  return axios.get("/api" + apiSecret + "/clients/" + id + "?token=" + token);
};

export const postClient = (post, token) => {
  return axios.post("/api" + apiSecret + "/clients?token=" + token, post);
};

export const putClient = (post, token) => {
  const id = post["id"];
  return axios.put(
    "/api" + apiSecret + "/clients/" + id + "?token=" + token,
    post,
  );
};

export const getProduct = (id, token) => {
  return axios.get("/api" + apiSecret + "/products/" + id + "?token=" + token);
};

export const postProduct = (post, token) => {
  return axios.post("/api" + apiSecret + "/products?token=" + token, post);
};

export const putProduct = (post, token) => {
  const id = post["id"];
  return axios.put(
    "/api" + apiSecret + "/products/" + id + "?token=" + token,
    post,
  );
};

//export const checkCache = (token) => {
//  return axios.get("/api"+apiSecret+"/config/is-cache-enable?token=" + token);
//};

export const postToggleCacheEnableFile = (post, token) => {
  return axios.post(
    "/api" + apiSecret + "/config/toggle-cache-enable-file?token=" + token,
    post,
  );
};

export const getClearCache = (token) => {
  return axios.put("/api" + apiSecret + "/config/clearcache?token=" + token);
};

export const getCreateSitemap = (token) => {
  return axios.put("/api" + apiSecret + "/config/createsitemap?token=" + token);
};

///////////////
//tag categories
///////////////
export const postTagCategory = (post, token) => {
  const ret = axios.post(
    "/api" + apiSecret + "/tag-categories?token=" + token,
    post,
  );
  return ret;
};

export const getTagCategories = (token) => {
  return axios.get("/api" + apiSecret + "/tag-categories?token=" + token);
};

export const getTagCategory = (id, token) => {
  return axios.get(
    "/api" + apiSecret + "/tag-categories/" + id + "?token=" + token,
  );
};

export const putTagCategory = (post, id, token) => {
  return axios.put(
    "/api" + apiSecret + "/tag-categories/" + id + "?token=" + token,
    post,
  );
};

export const deleteTagCategory = (id, token) => {
  return axios.delete(
    "/api" + apiSecret + "/tag-categories/" + id + "?token=" + token,
  );
};

///////////////
//tag
///////////////
export const postTag = (post, token) => {
  const ret = axios.post("/api" + apiSecret + "/tags?token=" + token, post);
  return ret;
};

// export const getTags = (token) => {
//   return axios.get("/api" + apiSecret + "/tags?token=" + token);
// };

// export const getTag = (id, token) => {
//   return axios.get("/api" + apiSecret + "/tags/" + id + "?token=" + token);
// };

export const putTag = (post, id, token) => {
  return axios.put(
    "/api" + apiSecret + "/tags/" + id + "?token=" + token,
    post,
  );
};

export const deleteTag = (id, token) => {
  return axios.delete("/api" + apiSecret + "/tags/" + id + "?token=" + token);
};

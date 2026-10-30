<template>
  <div data-testid="products-page">
    <div class="container">
      <div class="row mt-3 mb-3">
        <h3 class="col-10">Products</h3>
        <ChangeLang :lang="lang" @exec-change-lang="changeLang"></ChangeLang>
      </div>
    </div>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <div class="container">
      <div class="row mb-4">
        <div class="col-5">
          <button
            role="button_add_product"
            @click.prevent="addProduct"
            class="add-page-btn btn btn-primary mt-2 mb-2 mr-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-plus"></i>

            <span
              role="pre_loader_add_product"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            Add Product
          </button>
        </div>

        <div class="col-7 d-flex align-items-baseline">
          <input
            type="input"
            placeholder="search: name or sku"
            class="form-control col"
            name="search"
            v-model="searchValue"
          />

          <button
            role="button_search_product"
            @click.prevent="searchProducts"
            class="add-page-btn btn btn-primary mt-2 mb-2 mr-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-search"></i>
            <span
              role="pre_loader_search_product"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            <span>Search product</span>
          </button>
        </div>
      </div>

      <table class="table mt-2 mb-4">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Image</th>

            <th scope="col">
              Product name
              <TableSort
                :sortColumn="'product_name'"
                @sort-asc="sortingAsc('product_name')"
                @sort-desc="sortingDesc('product_name')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">
              Page
              <TableSort
                :sortColumn="'page_short_title'"
                @sort-asc="sortingAsc('page_short_title')"
                @sort-desc="sortingDesc('page_short_title')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">
              Sku
              <TableSort
                :sortColumn="'sku'"
                @sort-asc="sortingAsc('sku')"
                @sort-desc="sortingDesc('sku')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">
              Price
              <TableSort
                :sortColumn="'price'"
                @sort-asc="sortingAsc('price')"
                @sort-desc="sortingDesc('price')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">
              Pub
              <TableSort
                :sortColumn="'published'"
                @sort-asc="sortingAsc('published')"
                @sort-desc="sortingDesc('published')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">
              Created
              <TableSort
                :sortColumn="'created_at'"
                @sort-asc="sortingAsc('created_at')"
                @sort-desc="sortingDesc('created_at')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, index) in products.data" :key="index">
            <th scope="row">{{ index + 1 }}</th>
            <td @click="editProduct(p['id'])">
              <span
                v-if="
                  p.images !== null &&
                  typeof p.images === 'object' &&
                  typeof p.images[0] === 'object'
                "
              >
                <img
                  style="width: 40%"
                  :src="SERVER_URL + p.images[0]['fs']['small']"
                  :alt="p.images[0]['alt'][lang]"
                />
              </span>
              <span v-else>
                <i :class="iconClass"></i>
              </span>
            </td>
            <td
              @click="editProduct(p['id'])"
              :role="'product_name_' + lang"
              class="cursor-pointer text-primary"
            >
              {{ p["product_name"] }}
            </td>
            <td>
              <span
                @click="goToPage(p['page_id'])"
                class="cursor-pointer text-primary"
              >
                {{ p["page_short_title"] }}
              </span>
            </td>
            <td>{{ p["sku"] }}</td>
            <td>{{ p["price"] }}</td>
            <td>
              <i
                v-if="p['published']"
                class="fa fa-check"
                aria-hidden="true"
              ></i>
              <i
                v-if="!p['published']"
                class="fa fa-times"
                aria-hidden="true"
              ></i>
            </td>
            <td>{{ p["created_at"] ? p["created_at"].split("T")[0] : "" }}</td>
            <td>
              <span
                role="edit_product"
                class="me-1"
                :class="{ 'disabled-if-loader': pre_loader }"
                @click="editProduct(p['id'])"
                ><i class="far fa-edit cursor-pointer"></i
              ></span>
              <span
                role="del_product"
                class="ms-1"
                :class="{ 'disabled-if-loader': pre_loader }"
                @click="delProduct(p['id'])"
                ><i class="fas fa-trash cursor-pointer"></i
              ></span>
            </td>
          </tr>
        </tbody>
      </table>

      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-end">
          <li
            v-for="(link, index) in products.links"
            :key="index"
            class="page-item"
            :class="{
              disabled: !link['url'] || pre_loader,
              active: link['active'],
            }"
          >
            <a
              role="pagination_links"
              class="page-link"
              @click="link['url'] && changePageByUrl(link['url'])"
              v-html="link.label"
            ></a>
          </li>
        </ul>
      </nav>
    </div>
    <!--  container -->
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { SERVER_URL } from "../config.js";
import { useRouter } from "vue-router";
import functions from "../helpers/functions.js";
import { handleError } from "../helpers/common.js";
import { getProducts, deleteProduct } from "../api/apiCalls.js";
import Msg from "../components/Msg.vue";
import ChangeLang from "../components/ChangeLang.vue";
import TableSort from "../components/TableSort.vue";
import { useAuthStore } from "../state/store.js";
const { auth, config, setDefaultLang } = useAuthStore();

const router = useRouter();

//const { token } = functions.retrieveParamsFromStorage();

// Data
const {
  //configLangs: langs,
  configDefaultLang,
  //token,
} = functions.retrieveParamsFromStorage();

//console.log('def_lang', configDefaultLang);

const lang = ref(configDefaultLang);
const msgWrong = ref("");
const msgGood = ref("");
const pre_loader = ref(false);
const products = ref([]);

//search params for:
//api/products/$column/$direction?token=$token&search=abc
const column = ref("");
const direction = ref("");
const page = ref("");
const search = ref(""); //after click button
const searchValue = ref(""); // current value

const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

const iconClass = computed(() => {
  return windowWidth.value < 990
    ? "fa fa-camera-retro fa-lg"
    : "fa fa-camera-retro fa-3x";
});

const addProduct = () => {
  router.push({ name: "product", params: { mode: "add" } });
};

const editProduct = (id) => {
  router.push({ name: "product", params: { mode: "edit", id: id } });
};

async function changeLang(inLang) {
  pre_loader.value = true;
  lang.value = inLang;
  setDefaultLang(inLang);

  await refreshProducts();
}

const searchProducts = async () => {
  pre_loader.value = true;
  page.value = "1";
  search.value = searchValue.value;

  await refreshProducts();
};

const goToPage = (pageId) => {
  router.push("/pages/" + pageId);
};

const delProduct = async (id) => {
  clearMsg();
  if (window.confirm("Are you sure you wish to delete this item?")) {
    pre_loader.value = true;

    try {
      const response = await deleteProduct(id, auth.token);
      if (response.data.success) {
        const ret = await refreshProducts();
        if (ret) {
          msgGood.value = "Product has been deleted";
          pre_loader.value = false;
        }
      }
    } catch (error) {
      handleError(error, config.demo_status, msgWrong, pre_loader);
      //console.log("_is_error__", error);
      //msgWrong.value = "Delete product problem = " + error;
    }
  }
};

const changePageByUrl = async (url) => {
  pre_loader.value = true;
  page.value = functions.retrieveParamsFromUrl(url, "page");

  await refreshProducts();
};

const sortingAsc = async (column) => {
  sorting(column, "asc");
};

const sortingDesc = async (column) => {
  sorting(column, "desc");
};

const sorting = async (col, dir) => {
  pre_loader.value = true;
  column.value = col;
  direction.value = dir;
  page.value = "1";

  await refreshProducts();
};

const clearMsg = () => {
  msgWrong.value = "";
  msgGood.value = "";
};

const refreshProducts = async () => {
  clearMsg();
  try {
    const responseP = await getProducts(
      lang.value,
      column.value,
      direction.value,
      auth.token,
      page.value,
      search.value,
    );
    products.value = responseP.data.data;
    return true;
  } catch (error) {
    console.log("error get products=", error);
  } finally {
    pre_loader.value = false;
  }
  return false;
};

onMounted(async () => {
  if (!auth.token) {
    router.push("/");
    return false;
  }

  if (!config.is_shop) {
    router.push("/");
    return false;
  }

  pre_loader.value = true;
  window.addEventListener("resize", updateWindowWidth);
  // set up sorting on the start
  column.value = "created_at";
  direction.value = "desc";
  page.value = "1";
  search.value = "";

  await refreshProducts();
});
</script>

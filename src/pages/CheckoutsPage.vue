<template>
  <div data-testid="checkouts-page">
    <div class="container">
      <div class="row mt-3 mb-3">
        <h3 class="col-10">Checkouts</h3>
        <ChangeLang :lang="lang" @exec-change-lang="changeLang"></ChangeLang>
      </div>
    </div>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <div class="container">
      <div class="row mb-4">
        <div class="col-5">&nbsp;</div>

        <div class="col-7 d-flex align-items-baseline">
          <input
            type="input"
            placeholder="search: email"
            class="form-control col"
            name="search"
            v-model="searchValue"
          />

          <button
            role="button_search_checkout"
            @click.prevent="searchCheckouts"
            class="add-page-btn btn btn-primary mt-2 mb-2 mr-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-search"></i>
            <span
              role="pre_loader_search_checkout"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            <span>Search checkout</span>
          </button>
        </div>
      </div>

      <table class="table mt-2 mb-4">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Email</th>
            <th scope="col">Telephone</th>
            <th scope="col">
              Id
              <TableSort
                :sortColumn="'id'"
                @sort-asc="sortingAsc('id')"
                @sort-desc="sortingDesc('id')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">
              Total price
              <TableSort
                :sortColumn="'price_total_add_deliver'"
                @sort-asc="sortingAsc('price_total_add_deliver')"
                @sort-desc="sortingDesc('price_total_add_deliver')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">Basket price</th>
            <th scope="col">Deliver price</th>
            <th scope="col">Basket</th>

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
          <tr v-for="(p, index) in checkouts.data" :key="index">
            <th scope="row">{{ index + 1 }}</th>
            <td>
              <a
                class="cursor-pointer text-primary"
                @click="goToUser(p.user_id)"
              >
                {{ p["email"] }}
              </a>
            </td>
            <td>{{ p["telephone"] }}</td>
            <td>{{ p["id"] }}</td>
            <td :role="'price_total_add_deliver_' + lang">
              <b>{{ p["price_total_add_deliver"] }}</b>
            </td>
            <td>{{ p["price_total"] }}</td>
            <td>{{ p["price_deliver"] }}</td>

            <td>
              <div>
                <div
                  v-for="basket in p.baskets"
                  :key="basket.product_id"
                  class="text-nowrap"
                >
                  <a
                    class="cursor-pointer text-primary"
                    @click="goToProduct(basket.product_id)"
                  >
                    {{ basket.product_name }}
                  </a>
                  {{ basket.qty }} x {{ basket.price }}
                </div>
              </div>
            </td>

            <td>{{ p["created_at"] ? p["created_at"].split("T")[0] : "" }}</td>
            <td>
              <span
                v-if="!p.is_pay"
                role="edit_checkout"
                class="me-1"
                :class="{ 'disabled-if-loader': pre_loader }"
                @click="editCheckout(p['id'])"
                ><i
                  class="far fa-money-bill-alt cursor-pointer"
                  aria-hidden="true"
                ></i
              ></span>
              <span v-else> Paid </span>
            </td>
          </tr>
        </tbody>
      </table>

      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-end">
          <li
            v-for="(link, index) in checkouts.links"
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
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import functions from "../helpers/functions.js";
import trans from "../helpers/trans.js";
import { handleError } from "../helpers/common.js";
import { getCheckouts, putCheckout } from "../api/apiCalls.js";
import Msg from "../components/Msg.vue";
import ChangeLang from "../components/ChangeLang.vue";
import TableSort from "../components/TableSort.vue";
import { useAuthStore } from "../state/store.js";
const { auth, config, setDefaultLang } = useAuthStore();

const router = useRouter();

// Data
const { configDefaultLang } = functions.retrieveParamsFromStorage();

const lang = ref(configDefaultLang);
const msgWrong = ref("");
const msgGood = ref("");
const pre_loader = ref(false);
const checkouts = ref([]);

//search params for:
//api/checkouts/$column/$direction?token=$token&search=abc
const column = ref("");
const direction = ref("");
const page = ref("");
const search = ref(""); //after click button
const searchValue = ref(""); // current value

const goToUser = (id) => {
  router.push({ name: "user", params: { mode: "edit", id: id } });
};

const goToProduct = (id) => {
  router.push({ name: "product", params: { mode: "edit", id: id } });
};

const editCheckout = async (id) => {
  if (!startLoading()) {
    return false;
  }

  try {
    const response = await putCheckout({ is_pay: 1 }, id, auth.token);
    if (response.data.success) {
      const refreshP = await refreshCheckouts();
      if (refreshP) {
        msgGood.value = trans.ttt("success_edit_checkout");
        pre_loader.value = false;
        return true;
      }
    } else {
      msgWrong.value = "Sth wrong with edit checkout";
      console.log("error putCheckout", response.data);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
    //msgWrong.value = "Sth wrong with edit checkout (error)";
    //console.log("error putCheckout", error);
  } finally {
    pre_loader.value = false;
  }
  return false;
};

async function changeLang(inLang) {
  pre_loader.value = true;
  lang.value = inLang;
  setDefaultLang(inLang);

  await refreshCheckouts();
}

const searchCheckouts = async () => {
  pre_loader.value = true;
  page.value = "1";
  search.value = searchValue.value;

  await refreshCheckouts();
};

const changePageByUrl = async (url) => {
  pre_loader.value = true;
  page.value = functions.retrieveParamsFromUrl(url, "page");

  await refreshCheckouts();
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

  await refreshCheckouts();
};

const startLoading = () => {
  clearMsg();
  if (pre_loader.value) {
    return false;
  }
  pre_loader.value = true;
  return true;
};

const clearMsg = () => {
  msgWrong.value = "";
  msgGood.value = "";
};

const refreshCheckouts = async () => {
  clearMsg();
  try {
    const responseP = await getCheckouts(
      lang.value,
      column.value,
      direction.value,
      auth.token,
      page.value,
      search.value,
    );
    checkouts.value = responseP.data.data;
    return true;
  } catch (error) {
    console.log("error get checkouts=", error);
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
  // set up sorting on the start
  column.value = "created_at";
  direction.value = "desc";
  page.value = "1";
  search.value = "";

  await refreshCheckouts();
});

watch(searchValue, () => {
  clearMsg();
});
</script>

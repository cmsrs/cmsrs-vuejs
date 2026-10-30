<template>
  <div data-testid="users-page">
    <h3>Users</h3>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <div class="container">
      <div class="row mb-4">
        <div class="col-5">
          <button
            role="button_add_client"
            @click.prevent="addClient"
            class="add-page-btn btn btn-primary mt-2 mb-2 mr-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-plus"></i>

            <span
              role="pre_loader_add_client"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            Add Client
          </button>
        </div>

        <div class="col-7 d-flex align-items-baseline">
          <input
            type="input"
            placeholder="search: name or email"
            class="form-control col"
            name="search"
            v-model="searchValue"
          />

          <button
            role="button_search_client"
            @click.prevent="searchClients"
            class="add-page-btn btn btn-primary mt-2 mb-2 mr-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-search"></i>
            <span
              role="pre_loader_search_client"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            <span>Search client</span>
          </button>
        </div>
      </div>

      <table class="table mt-2 mb-4">
        <thead>
          <tr>
            <th scope="col">#</th>

            <th scope="col">
              Name
              <TableSort
                :sortColumn="'name'"
                @sort-asc="sortingAsc('name')"
                @sort-desc="sortingDesc('name')"
                :pre_loader="pre_loader"
                :column="column"
                :direction="direction"
              ></TableSort>
            </th>

            <th scope="col">
              Email
              <TableSort
                :sortColumn="'email'"
                @sort-asc="sortingAsc('email')"
                @sort-desc="sortingDesc('email')"
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
          <tr v-for="(c, index) in clients.data" :key="index">
            <th scope="row">{{ index + 1 }}</th>
            <td>
              <span
                @click="editClient(c['id'])"
                class="cursor-pointer text-primary"
              >
                {{ c["name"] }}
              </span>
            </td>
            <td>
              {{ c["email"] }}
            </td>
            <td>{{ c["created_at"] ? c["created_at"].split("T")[0] : "" }}</td>
            <td>
              <span
                role="edit_client"
                class="me-1"
                :class="{ 'disabled-if-loader': pre_loader }"
                @click="editClient(c['id'])"
                ><i class="far fa-edit cursor-pointer"></i
              ></span>
              <span
                role="del_client"
                class="ms-1"
                :class="{ 'disabled-if-loader': pre_loader }"
                @click="delClient(c['id'])"
                ><i class="fas fa-trash cursor-pointer"></i
              ></span>
            </td>
          </tr>
        </tbody>
      </table>

      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-end">
          <li
            v-for="(link, index) in clients.links"
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import functions from "../helpers/functions.js";
import { handleError } from "../helpers/common.js";
import { getClients, deleteClient } from "../api/apiCalls.js";
import Msg from "../components/Msg.vue";
import TableSort from "../components/TableSort.vue";

const router = useRouter();

const { token } = functions.retrieveParamsFromStorage();

import { useAuthStore } from "../state/store.js";
const { auth, config } = useAuthStore();

const msgWrong = ref("");
const msgGood = ref("");
const pre_loader = ref(false);
const clients = ref([]);

//search params for:
//api/clients/$column/$direction?token=$token&search=abc
const column = ref("");
const direction = ref("");
const page = ref("");
const search = ref(""); //after click button
const searchValue = ref(""); // current value

const addClient = () => {
  router.push({ name: "user", params: { mode: "add" } });
};

const editClient = (id) => {
  router.push({ name: "user", params: { mode: "edit", id: id } });
};

const searchClients = async () => {
  pre_loader.value = true;
  page.value = "1";
  search.value = searchValue.value;

  await refreshClients();
};

const delClient = async (id) => {
  clearMsg();
  if (window.confirm("Are you sure you wish to delete this item?")) {
    pre_loader.value = true;

    try {
      const response = await deleteClient(id, token);
      if (response.data.success) {
        const ret = await refreshClients();
        if (ret) {
          msgGood.value = "Client has been deleted";
          pre_loader.value = false;
        }
      }
    } catch (error) {
      handleError(error, config.demo_status, msgWrong, pre_loader);
      //console.log("_is_error__", error);
      //msgWrong.value = "Delete client problem = " + error;
    }
  }
};

const changePageByUrl = async (url) => {
  pre_loader.value = true;
  page.value = functions.retrieveParamsFromUrl(url, "page");

  await refreshClients();
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

  await refreshClients();
};

const clearMsg = () => {
  msgWrong.value = "";
  msgGood.value = "";
};

const refreshClients = async () => {
  clearMsg();
  try {
    const responseC = await getClients(
      column.value,
      direction.value,
      token,
      page.value,
      search.value,
    );
    clients.value = responseC.data.data;
    return true;
  } catch (error) {
    console.log("error get clients=", error);
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

  pre_loader.value = true;

  // set up sorting on the start
  column.value = "created_at";
  direction.value = "desc";
  page.value = "1";
  search.value = "";

  await refreshClients();
});
</script>

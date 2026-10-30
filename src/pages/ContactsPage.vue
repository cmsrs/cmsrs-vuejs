<template>
  <div data-testid="contacts-page">
    <h3>Contacts</h3>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <div class="container">
      <div class="row mb-4">
        <div class="col-5">&nbsp;</div>

        <div class="col-7 d-flex align-items-baseline">
          <input
            type="input"
            placeholder="search: email or message"
            class="form-control col"
            name="search"
            v-model="searchValue"
          />

          <button
            role="button_search_contact"
            @click.prevent="searchContacts"
            class="add-page-btn btn btn-primary mt-2 mb-2 mr-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-search"></i>
            <span
              role="pre_loader_search_contact"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            <span>Search contacts</span>
          </button>
        </div>
      </div>

      <table class="table mt-2 mb-4">
        <thead>
          <tr>
            <th scope="col">#</th>

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
              Message
              <TableSort
                :sortColumn="'message'"
                @sort-asc="sortingAsc('message')"
                @sort-desc="sortingDesc('message')"
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
          <tr v-for="(c, index) in contacts.data" :key="index">
            <th scope="row">{{ index + 1 }}</th>
            <td>{{ c["email"] }}</td>
            <td>{{ c["message"] }}</td>
            <td>{{ c["created_at"] ? c["created_at"].split("T")[0] : "" }}</td>
            <td>
              <span
                role="del_contact"
                class="ms-1"
                :class="{ 'disabled-if-loader': pre_loader }"
                @click="delContact(c['id'])"
                ><i class="fas fa-trash cursor-pointer"></i
              ></span>
            </td>
          </tr>
        </tbody>
      </table>

      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-end">
          <li
            v-for="(link, index) in contacts.links"
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
import { getContacts, deleteContact } from "../api/apiCalls.js";
import Msg from "../components/Msg.vue";
import TableSort from "../components/TableSort.vue";

import { useAuthStore } from "../state/store.js";
const { auth, config } = useAuthStore();

const router = useRouter();

const { token } = functions.retrieveParamsFromStorage();

const msgWrong = ref("");
const msgGood = ref("");
const pre_loader = ref(false);
const contacts = ref([]);

//search params for:
//api/contacts/$column/$direction?token=$token&search=abc
const column = ref("");
const direction = ref("");
const page = ref("");
const search = ref(""); //after click button
const searchValue = ref(""); // current value

const searchContacts = async () => {
  pre_loader.value = true;
  page.value = "1";
  search.value = searchValue.value;

  await refreshContacts();
};

const delContact = async (id) => {
  clearMsg();
  if (window.confirm("Are you sure you wish to delete this item?")) {
    pre_loader.value = true;

    try {
      const response = await deleteContact(id, token);
      if (response.data.success) {
        const ret = await refreshContacts();
        if (ret) {
          msgGood.value = "Contact has been deleted";
          pre_loader.value = false;
        }
      }
    } catch (error) {
      handleError(error, config.demo_status, msgWrong, pre_loader);
      //console.log("_is_error__", error);
      //msgWrong.value = "Delete contact problem = " + error;
    }
  }
};

const changePageByUrl = async (url) => {
  pre_loader.value = true;
  page.value = functions.retrieveParamsFromUrl(url, "page");

  await refreshContacts();
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

  await refreshContacts();
};

const clearMsg = () => {
  msgWrong.value = "";
  msgGood.value = "";
};

const refreshContacts = async () => {
  clearMsg();
  try {
    const responseC = await getContacts(
      column.value,
      direction.value,
      token,
      page.value,
      search.value,
    );
    contacts.value = responseC.data.data;
    return true;
  } catch (error) {
    console.log("error get contacts=", error);
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

  await refreshContacts();
});
</script>

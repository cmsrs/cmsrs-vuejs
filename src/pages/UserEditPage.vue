<template>
  <div data-testid="user-edit-page">
    <h3 v-if="mode === 'edit'">Edit client</h3>
    <h3 v-else>Add client</h3>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <div class="container">
      <div class="row">
        <div class="col">
          <button
            @click.prevent="back"
            class="add-page-btn btn btn-info ml-3 mt-2 mb-2"
            :disabled="pre_loader"
          >
            Back
          </button>
        </div>
      </div>

      <div class="row pb-4 pt-4">
        <form>
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input
              type="email"
              v-model="client.email"
              class="form-control"
              :class="{ 'is-invalid': errFields.includes('email') }"
              id="email"
              aria-describedby="emailHelp"
              placeholder="email"
              :disabled="mode === 'edit'"
            />
            <!-- <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> -->
          </div>

          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input
              type="text"
              v-model="client.name"
              class="form-control"
              :class="{ 'is-invalid': errFields.includes('name') }"
              id="name"
              placeholder="name"
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              v-model="client.password"
              class="form-control"
              :class="{ 'is-invalid': errFields.includes('password') }"
              id="password"
              placeholder="password"
            />
          </div>

          <div class="mb-3">
            <label for="password_confirmation" class="form-label"
              >Password confirmation</label
            >
            <input
              type="password"
              v-model="client.password_confirmation"
              class="form-control"
              :class="{ 'is-invalid': errFields.includes('password') }"
              id="password_confirmation"
              placeholder="password confirmation"
            />
          </div>

          <button
            role="button_save_edit_client"
            @click.prevent="addEditClient"
            class="add-page-btn btn btn-primary mt-2 mb-2 mr-2"
            :disabled="pre_loader"
          >
            <Icon name="fa-plus" v-if="!pre_loader" />

            <span
              role="pre_loader_add_edit_client"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            <span v-if="mode === 'edit'">Edit client</span>
            <span v-else>Add client</span>
          </button>
        </form>
      </div>
    </div>
    <!--  container -->
  </div>
</template>
<script setup>
import Icon from "../components/Icon.vue";
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import functions from "../helpers/functions.js";
import { handleError } from "../helpers/common.js";
import { getClient, postClient, putClient } from "../api/apiCalls";
import Msg from "../components/Msg.vue";
import trans from "../helpers/trans.js";

const router = useRouter();

const { token } = functions.retrieveParamsFromStorage();
const mode = router.currentRoute.value.params.mode;

import { useAuthStore } from "../state/store.js";
const { auth, config } = useAuthStore();

const msgWrong = ref("");
const msgGood = ref("");
const errFields = ref([]);

const pre_loader = ref(false);
let client = reactive({});

const back = () => {
  router.push({ name: "users" });
};

const clearMsg = () => {
  msgWrong.value = "";
  msgGood.value = "";
};

const getEmptyClient = () => {
  return {
    id: "",
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  };
};

const addEditClient = async () => {
  clearMsg();
  pre_loader.value = true;
  try {
    const retClient = client.id //client.value.id
      ? await putClient(client, token)
      : await postClient(client, token);
    if (retClient.data.success) {
      msgGood.value = client.id
        ? trans.ttt("success_client_edit")
        : trans.ttt("success_client_add");
    } else if (retClient.data.success === false) {
      msgWrong.value = functions.parseError(retClient.data.error);
      errFields.value = functions.getErrorFields(retClient.data.error);
    } else {
      msgWrong.value =
        "Something wrong with add or edit client - check response status";
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
    //console.log("_is_error__", error);
  }
  pre_loader.value = false;
};

const loadClient = async (id) => {
  try {
    const responseC = await getClient(id, token);
    if (responseC.data.success) {
      const clientData = responseC.data.data;
      client.id = clientData.id;
      client.name = clientData.name;
      client.email = clientData.email;
      return true;
    } else {
      msgWrong.value = "Sth wrong with get client";
      console.log("error get client=", responseC.data);
    }
  } catch (error) {
    msgWrong.value = "Sth wrong with get client (error)";
    console.log("error get client=", error);
  }
  return false;
};

onMounted(async () => {
  if (!auth.token) {
    router.push("/");
    return false;
  }

  if (mode !== "edit" && mode !== "add") {
    router.push("/"); //TODO test manually
  }

  clearMsg();
  client = getEmptyClient();

  if (mode === "edit") {
    const id = router.currentRoute.value.params.id;
    pre_loader.value = true;
    const loadC = await loadClient(id);

    if (loadC) {
      pre_loader.value = false;
    }
  }
});
</script>

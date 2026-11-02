<template>
  <div
    class="mt-3 col-lg-6 offset-lg-3 col-sm-8 offset-sm-2"
    data-testid="login-page"
  >
    <h3>Login</h3>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <form @submit.prevent="submit" class="container">
      <div class="card">
        <div class="m-4">
          <label for="e-mail" class="form-label">E-mail</label>
          <input
            id="e-mail"
            class="form-control pb-2"
            v-model="formData.email"
            type="text"
          />
        </div>

        <div class="m-4">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            class="form-control"
            v-model="formData.password"
            type="password"
          />
        </div>

        <div class="text-center m-4">
          <button
            type="submit"
            role="button_login"
            class="btn btn-primary mt-2 mb-2"
            :disabled="pre_loader || isDisabled"
          >
            <Icon name="fa-plus" v-if="!pre_loader" />
            <span
              role="pre_loader_login"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            Login
          </button>
        </div>
      </div>
    </form>
    <!-- container -->
    <div class="container mt-4">
      <a href="/">Return to the front page</a>
    </div>
  </div>
</template>
<script setup>
import Icon from "../components/Icon.vue";
import Msg from "../components/Msg.vue";
import { ref, computed, reactive, watch, onMounted } from "vue";
import { login, config } from "../api/apiCalls.js";
import { useRouter } from "vue-router";
import { useAuthStore } from "../state/store.js";
import { DEMO_STATUS } from "../config.js";
import { ADM_EMAIL, ADM_PASS } from "../config-demo.js";
const { auth, setAuth, setConfig } = useAuthStore();

const router = useRouter();

const msgWrong = ref("");
const msgGood = ref(""); //it is unused in this form, because we redirect but component Msg use this variable
const pre_loader = ref(false);
const formData = reactive({ email: "", password: "" });

const submit = async () => {
  msgWrong.value = "";
  pre_loader.value = false;

  try {
    const responseAuth = await login(formData);
    if (responseAuth.data.success) {
      const token = responseAuth.data.data.token;
      if (token) {
        const responseConfig = await config(token);
        if (responseConfig.data.success) {
          setAuth(responseAuth.data.data);
          setConfig(responseConfig.data.data);
          router.push("/pages");
        }
      }
    } else {
      msgWrong.value = responseAuth.data.error;
    }
  } catch (error) {
    msgWrong.value = "Invalid login credentials";
    console.log("_is_error__", error);
  } finally {
    pre_loader.value = false;
  }
};

onMounted(async () => {
  if (auth.token) {
    router.push("/pages");
    return false;
  }

  const demo = router.currentRoute.value.params.demo;
  formData.email = demo == "demo" || DEMO_STATUS ? ADM_EMAIL : "";
  formData.password = demo == "demo" || DEMO_STATUS ? ADM_PASS : "";
});

watch(
  () => formData.email,
  () => {
    msgWrong.value = "";
  },
);

watch(
  () => formData.password,
  () => {
    msgWrong.value = "";
  },
);

const isDisabled = computed(() => {
  return !(formData.password && formData.email);
});
</script>

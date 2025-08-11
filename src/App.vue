<script setup lang="ts">
import ComparisonPage from "./components/ComparisonPage.vue";
</script>

<template>
  <header class="appHeader">
    <a class="itemsLink" href="/">Каталог</a>
    <div class="buttonsBlock">
      <span class="pageName">Сравнение</span>
      <div class="userInfo">
        <a href="/" class="userPage">Личный кабинет</a>
        <img
          src="@/assets/icons/userIcon.svg"
          alt="иконка пользователя"
          class="userIcon"
        />
      </div>
    </div>
  </header>
  <ComparisonPage />
</template>
<style scoped>
.appHeader {
  display: flex;
  max-width: 100dvw;
  padding: 2% 10%;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #a6a5a9;
}
.itemsLink {
  font-size: 18px;
  text-decoration: none;
  font-weight: bold;
  color: #0d5adc;
}
.buttonsBlock {
  display: flex;
  align-items: center;
  gap: 48px;
}
.pageName {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}
.userInfo {
  gap: 19px;
  display: flex;
}
.userPage {
  text-decoration: none;
  color: black;
  font-size: 12px;
  font-weight: 900;
}
.userIcon {
  width: 20px;
  height: 20px;
}
</style>

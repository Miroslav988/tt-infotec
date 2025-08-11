<template>
  <div class="comparisonContainer">
    <div class="comparisonHeader">
      <div class="container">
        <h1 class="categoryTitle">Смартфоны</h1>
        <div class="displayControls">
          <span class="controlLabel">Отобразить товары:</span>
          <div class="controlButtons">
            <button
              v-for="n in maxDisplayCount - 1"
              :key="n + 1"
              :class="['controlBtn', { active: displayCount === n + 1 }]"
              @click="
                displayCount = n + 1;
                onDisplayCountChange();
              "
            >
              {{ n + 1 }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <main class="comparisonMain">
      <div class="container">
        <table class="comparisonTable">
          <thead class="tableHeader">
            <tr>
              <th class="specHeader">
                <div>
                  <label class="checkboxLabel">
                    <input
                      type="checkbox"
                      v-model="showDifferencesOnly"
                      @change="toggleShowDifferences"
                    />
                    <span class="checkmark"></span>
                    Показать различия
                  </label>
                </div>
              </th>
              <th
                v-for="(product, index) in displayedProducts"
                :key="product.id"
              >
                <div class="productInfo">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="headerImage"
                  />
                  <button
                    v-if="displayCount != 6"
                    class="modalTriggerBtn"
                    @click="openReplacePopup(index, $event)"
                    :title="'Заменить ' + product.name"
                  >
                    <img
                      src="@/assets/icons/chevron_small.svg"
                      alt="открыть модалку"
                      class="chevronIcon"
                    />
                  </button>
                  <span class="headerName">{{ product.name }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="tableBody">
            <tr v-for="spec in displayedSpecs" :key="spec" class="specRow">
              <td class="specName">{{ spec }}</td>
              <td
                v-for="product in displayedProducts"
                :key="product.id"
                class="specValue"
              >
                <template v-if="String(product.specs[spec]) === 'true'">
                  <img
                    src="@/assets/icons/trueMark.svg"
                    alt="Да"
                    class="iconBoolean"
                    width="22"
                    height="22"
                  />
                </template>
                <template v-else-if="String(product.specs[spec]) === 'false'">
                  <img
                    src="@/assets/icons/falseMark.svg"
                    alt="Нет"
                    class="iconBoolean"
                    width="22"
                    height="22"
                  />
                </template>
                <template v-else-if="spec === 'Стоимость'">
                  {{ formatPrice(product.specs[spec]) }}
                </template>
                <template v-else>
                  {{ product.specs[spec] || "—" }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="isPopupOpen">
      <div class="modalOverlay" @click="closeReplacePopup"></div>
      <div
        class="modalContent"
        @click.stop
        :style="{
          top: modalPosition.top + 'px',
          left: modalPosition.left + 'px',
          position: 'absolute',
        }"
      >
        <input
          v-if="hiddenProducts.length > 3"
          type="text"
          placeholder="Поиск"
          v-model="searchQuery"
          class="searchInput"
        />

        <div>
          <div
            v-for="product in filteredHiddenProducts"
            :key="product.id"
            class="productItem"
            @click="replaceProduct(product.id)"
          >
            <img
              src="@/assets/icons/change.svg"
              alt="заменить товар"
              class="changeIcon"
            />
            <img
              :src="product.image"
              :alt="product.name"
              class="productImage"
            />
            <span class="productName">{{ product.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
} from "vue";
import { useComparisonStore } from "@/stores/comparisonStore";

export default defineComponent({
  name: "ComparisonPage",
  setup() {
    const store = useComparisonStore();

    const displayCount = ref(store.displayCount);
    const showDifferencesOnly = ref(store.showDifferencesOnly);
    const isPopupOpen = ref(false);
    const replaceProductId = ref<number | null>(null);
    const searchQuery = ref("");
    const modalPosition = ref({ top: 0, left: 0 });

    const maxDisplayCount = computed(() =>
      Math.min(6, store.allProducts.length)
    );

    const displayedProducts = computed(() => store.displayedProducts);
    const hiddenProducts = computed(() => store.hiddenProducts);
    const displayedSpecs = computed(() => store.displayedSpecs);

    const filteredHiddenProducts = computed(() => {
      if (!searchQuery.value) return hiddenProducts.value;
      return hiddenProducts.value.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    function onDisplayCountChange() {
      store.setDisplayCount(displayCount.value);
    }

    function openReplacePopup(index: number, event: MouseEvent) {
      const productToReplace = displayedProducts.value[index];
      replaceProductId.value = productToReplace.id;
      isPopupOpen.value = true;
      searchQuery.value = "";

      const button = event.target as HTMLElement;
      const buttonRect = button.getBoundingClientRect();
      const modalWidth = 421;
      const viewportWidth = window.innerWidth;

      let leftPosition = buttonRect.left + window.scrollX;

      if (leftPosition + modalWidth > viewportWidth + window.scrollX) {
        leftPosition = buttonRect.right + window.scrollX - modalWidth;
      }

      leftPosition = Math.max(leftPosition, window.scrollX + 10);

      modalPosition.value = {
        top: buttonRect.top + window.scrollY,
        left: leftPosition,
      };
    }

    function closeReplacePopup() {
      isPopupOpen.value = false;
      replaceProductId.value = null;
    }

    function replaceProduct(newProductId: number) {
      if (replaceProductId.value !== null) {
        store.replaceDisplayedProductById(replaceProductId.value, newProductId);
        closeReplacePopup();
      }
    }

    function toggleShowDifferences() {
      store.toggleShowDifferences();
      showDifferencesOnly.value = store.showDifferencesOnly;
    }

    function formatPrice(price: string | number): string {
      const numPrice = Number(price);
      if (isNaN(numPrice)) return "—";
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numPrice);
    }

    onMounted(() => {
      updateTbodyHeight();
    });

    watch(displayedProducts, () => {
      nextTick(() => {
        updateTbodyHeight();
      });
    });

    function updateTbodyHeight() {
      const tbodyElement = document.querySelector(".tableBody");
      if (tbodyElement) {
        const tbodyHeight = tbodyElement.offsetHeight;
        //может просто отключить линтер для этой строчки?
        document.documentElement.style.setProperty(
          "--tbody-height",
          `${tbodyHeight}px`
        );
      }
    }

    return {
      displayCount,
      maxDisplayCount,
      showDifferencesOnly,
      displayedProducts,
      hiddenProducts,
      displayedSpecs,
      filteredHiddenProducts,
      isPopupOpen,
      searchQuery,
      modalPosition,
      onDisplayCountChange,
      openReplacePopup,
      closeReplacePopup,
      replaceProduct,
      toggleShowDifferences,
      formatPrice,
    };
  },
});
</script>

<style scoped>
:root {
  --tbody-height: auto;
}

.specHeader {
  padding-bottom: 77px;
}
.comparisonMain {
  max-width: 100%;
  overflow-y: auto;
}
.tableBody {
  position: relative;
}
.tableHeader {
  vertical-align: bottom;
  border-bottom: 1px solid #cdcfd2;
}

.tableBody::before {
  content: "";
  position: absolute;
  right: 0;
  width: 100vw;
  height: var(--tbody-height);
  background-color: #f4f9fc;
  z-index: -1;
  pointer-events: none;
}
.comparisonContainer {
  display: flex;
  flex-direction: column;
  max-width: 100dvw;
  padding: 2% 10%;
}

.comparisonHeader {
  padding: 24px 0;
}

.comparisonHeader .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.categoryTitle {
  font-size: 32px;
  font-weight: 700;
  color: #828286;
  margin: 0;
}

.displayControls {
  display: flex;
  color: #0d5adc;
  align-items: center;
}

.controlLabel {
  font-size: 18px;
  font-weight: 400;
}

.controlButtons {
  display: flex;
  margin-left: 7px;
}

.controlBtn {
  padding: 1px 3px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  color: #007bff;
  font-weight: 400;
}

.controlBtn:hover {
  border-bottom: 1px solid #0d5adc;
  color: #007bff;
}

.controlBtn.active {
  border-bottom: 1px solid #0d5adc;
}

.productName {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  text-align: center;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  color: #0d5adc;
}

.checkboxLabel input {
  margin-right: 8px;
}

.comparisonTable {
  width: 100%;
  border-collapse: collapse;
}

.comparisonTable td {
  text-align: left;
  border-bottom: 1px solid #cdcfd2;
}

.productInfo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0px 63px 70px 63px;
  min-width: 160px;
  max-width: 200px;
  position: relative;
}

.headerImage {
  width: 85px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.modalTriggerBtn {
  position: absolute;
  top: 30%;
  right: 40px;
  border: none;
  background: none;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.chevronIcon {
  width: 30px;
  height: 27px;
}

.headerName {
  font-size: 14px;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
}

.specName {
  color: #a4a9b9;
  max-width: 250px;
  padding: 43px 63px;
  padding-left: 0;
  font-size: 18px;
  text-transform: uppercase;
}

.specValue {
  text-align: center;
  font-size: 18px;
  padding: 43px 63px;
}

.iconBoolean {
  display: inline-block;
  vertical-align: middle;
}

.specRow:hover {
  background: #f8f9fa;
}

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.modalContent {
  background: white;
  overflow-y: auto;
  padding: 34px 18px;
  max-width: 421px;
  width: 100%;
  max-height: 336px;
  border-radius: 4px;
  box-shadow: 0 16px 32px 0px #2327331a;
  border: 1px solid #e3e3e3;
  z-index: 3;
  scrollbar-color: #e3e3e3 transparent;
}
.searchInput {
  box-sizing: border-box;
  width: 95%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  font-size: 16px;
  border-radius: 4px;
  font-size: 24px;
  color: #b0b0b0;
}

.productItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.productItem:hover {
  background: #f8f9fa;
}

.productName {
  font-size: 16px;
  color: #000;
  font-weight: 400;
}

.changeIcon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-right: 8px;
  fill: #36935b;
}

.productImage {
  width: 40px;
  height: 80px;
  object-fit: contain;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .comparison-header .container {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-title {
    font-size: 24px;
  }

  .comparisonTable {
    font-size: 14px;
  }

  .comparisonTable th,
  .comparisonTable td {
    padding: 8px;
  }
}
</style>

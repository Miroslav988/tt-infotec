import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface Product {
  id: number;
  name: string;
  image: string;
  specs: Record<string, string>;
}

export const useComparisonStore = defineStore("comparison", () => {
  //мб добавить больше товаров, чтобы поисковая строка нетолько на 2-х отображалась?
  const allProducts = ref<Product[]>([
    {
      id: 1,
      name: "Apple iPhone 15 Pro",
      image: "images/iPhone15pro.png",
      specs: {
        Производитель: "Apple",
        "Год релиза": "2023",
        "Диоганаль экрана (дюйм)": "6,1",
        "Страна производитель": "Китай",
        "Объем памяти": "256 Гб",
        "Частота обновления экрана": "120 Гц",
        NFC: "true",
        "Поддержка ESIM": "true",
        "Поддержка Беспроводной Зарядки": "true",
        Стоимость: "119990",
      },
    },
    {
      id: 2,
      name: "Apple iPhone 15",
      image: "images/iPhone 15.png",
      specs: {
        Производитель: "Apple",
        "Год релиза": "2023",
        "Диоганаль экрана (дюйм)": "6,1",
        "Страна производитель": "Китай",
        "Объем памяти": "128 Гб",
        "Частота обновления экрана": "60 Гц",
        NFC: "true",
        "Поддержка ESIM": "false",
        "Поддержка Беспроводной Зарядки": "true",
        Стоимость: "89990",
      },
    },
    {
      id: 3,
      name: "Samsung Galaxy S24 Ultra",
      image: "images/Samsung Galaxy S24 Ultra.png",
      specs: {
        Производитель: "Samsung",
        "Год релиза": "2024",
        "Диоганаль экрана (дюйм)": "6,8",
        "Страна производитель": "Вьетнам",
        "Объем памяти": "512 Гб",
        "Частота обновления экрана": "120 Гц",
        NFC: "true",
        "Поддержка ESIM": "true",
        "Поддержка Беспроводной Зарядки": "true",
        Стоимость: "139990",
      },
    },
    {
      id: 4,
      name: "Samsung Galaxy S24",
      image: "images/Samsung Galaxy S24.png",
      specs: {
        Производитель: "Samsung",
        "Год релиза": "2024",
        "Диоганаль экрана (дюйм)": "6,2",
        "Страна производитель": "Вьетнам",
        "Объем памяти": "256 Гб",
        "Частота обновления экрана": "120 Гц",
        NFC: "true",
        "Поддержка ESIM": "true",
        "Поддержка Беспроводной Зарядки": "false",
        Стоимость: "89990",
      },
    },
    {
      id: 5,
      name: "Xiaomi 14 Pro",
      image: "images/Xiaomi 14 Pro.png",
      specs: {
        Производитель: "Xiaomi",
        "Год релиза": "2024",
        "Диоганаль экрана (дюйм)": "6,73",
        "Страна производитель": "Китай",
        "Объем памяти": "512 Гб",
        "Частота обновления экрана": "120 Гц",
        NFC: "false",
        "Поддержка ESIM": "false",
        "Поддержка Беспроводной Зарядки": "false",
        Стоимость: "99990",
      },
    },
    {
      id: 6,
      name: "Xiaomi 13",
      image: "images/Xiaomi 13.jpeg",
      specs: {
        Производитель: "Xiaomi",
        "Год релиза": "2023",
        "Диоганаль экрана (дюйм)": "6,36",
        "Страна производитель": "Китай",
        "Объем памяти": "256 Гб",
        "Частота обновления экрана": "120 Гц",
        NFC: "false",
        "Поддержка ESIM": "false",
        "Поддержка Беспроводной Зарядки": "false",
        Стоимость: "69990",
      },
    },
  ]);

  const displayCount = ref(3);

  const displayedProductIds = ref<number[]>(
    allProducts.value.slice(0, displayCount.value).map((p) => p.id)
  );

  const showDifferencesOnly = ref(false);

  const displayedProducts = computed(
    () =>
      displayedProductIds.value
        .map((id) => allProducts.value.find((p) => p.id === id))
        .filter(Boolean) as Product[]
  );

  const hiddenProducts = computed(() =>
    allProducts.value.filter((p) => !displayedProductIds.value.includes(p.id))
  );

  const allSpecs = computed(() => {
    const specsSet = new Set<string>();
    allProducts.value.forEach((p) => {
      Object.keys(p.specs).forEach((spec) => specsSet.add(spec));
    });
    return Array.from(specsSet);
  });

  const displayedSpecs = computed(() => {
    if (!showDifferencesOnly.value) {
      return allSpecs.value;
    }

    return allSpecs.value.filter((spec) => {
      const values = displayedProducts.value.map((p) => p.specs[spec] || "");
      return new Set(values).size > 1;
    });
  });

  function setDisplayCount(count: number) {
    const maxCount = Math.min(6, allProducts.value.length);
    const newCount = Math.min(Math.max(count, 2), maxCount);
    displayCount.value = newCount;
    if (displayedProductIds.value.length > newCount) {
      displayedProductIds.value = displayedProductIds.value.slice(0, newCount);
    } else if (displayedProductIds.value.length < newCount) {
      const toAdd = hiddenProducts.value
        .slice(0, newCount - displayedProductIds.value.length)
        .map((p) => p.id);
      displayedProductIds.value = displayedProductIds.value.concat(toAdd);
    }
  }

  function replaceDisplayedProductById(
    oldProductId: number,
    newProductId: number
  ) {
    const index = displayedProductIds.value.indexOf(oldProductId);
    if (index === -1) return;
    if (displayedProductIds.value.includes(newProductId)) return;
    displayedProductIds.value[index] = newProductId;
  }

  function toggleShowDifferences() {
    showDifferencesOnly.value = !showDifferencesOnly.value;
  }

  return {
    allProducts,
    displayCount,
    displayedProductIds,
    displayedProducts,
    hiddenProducts,
    allSpecs,
    displayedSpecs,
    showDifferencesOnly,
    setDisplayCount,
    replaceDisplayedProductById,
    toggleShowDifferences,
  };
});

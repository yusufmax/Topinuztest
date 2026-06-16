const API = '';          // same origin — backend serves frontend statically
const TOKEN_KEY = 'houz_token';
let currentLang = localStorage.getItem('houz_lang_v2') || 'ru';

const i18n = {
  uz: {
    home: "Bosh sahifa",
    allShops: "Barcha do'konlar",
    hammasi: "Hammasi",
    shopsCount: "Dokonlar",
    filter: "Filter",
    searchPlaceholder: "Do'kon, manzil yoki kategoriya izlash...",
    share: "Ulashish",
    linkCopied: "Havola nusxalandi",
    copyError: "Xatolik yuz berdi",
    directions: "Yo'nalish",
    close: "Yopish",
    notFound: "Do'kon topilmadi",
    searchOther: "Boshqa kalit so'z yoki kategoriya tanlang.",
    descPlaceholder: "Ma'lumot kiritilmagan",
    locPlaceholder: "Bosh ofis joylashuvi kiritilmagan",
    goToStore: "Do'konga o'tish",
    // admin
    catsNotFound: "Kategoriyalar topilmadi.",
    manageFilters: "Filtrlarni Boshqarish",
    shopsCountLabel: "do'kon",
    noShopsInCat: "Bu kategoriyada hali do'konlar yo'q.",
    edit: "✏️ Tahrirlash",
    delete: "🗑️ O'chirish",
    selectOption: "Tanlang...",
    selectCategory: "Kategoriyani tanlang...",
    noSubcats: "Bu kategoriyada filtrlar yo'q",
    dropLogo: "📁 Logotipni bu yerga torting yoki bosing",
    editShopTitle: "Do'konni tahrirlash",
    addShopTitle: "Do'kon qo'shish",
    nameRequired: "❗ Nom - majburiy maydon",
    catRequired: "❗ Kategoriya - majburiy maydon",
    subCatRequired: "❗ Podkategoriya - majburiy maydon",
    fillBothFields: "❗ Barcha qo'shimcha havolalar uchun ikkala maydonni to'ldiring",
    saving: "Saqlanmoqda…",
    save: "Saqlash",
    updated: "✅ Muvaffaqiyatli yangilandi",
    shopAdded: "✅ Do'kon qo'shildi",
    shopDeleted: "🗑️ Do'kon o'chirildi",
    saveFailed: "❌ Xatolik yuz berdi: ",
    deleteFailed: "❌ O'chirishda xatolik",
    uploading: "⏳ Yuklanmoqda...",
    uploadError: "❌ Xatolik. Qayta urinib ko'ring.",
    logoUploaded: "🖼️ Logotip yuklandi!",
    onlyImages: "❗ Faqat rasmlarni yuklash mumkin",
    imageTooLarge: "❗ Rasm hajmi 2MB dan kichik bo'lishi kerak",
    uploadFailed: "❌ Yuklash xatosi: ",
    linkLabel: "Nomi (YouTube, TikTok...)",
    linkUrl: "Havola",
    filtersTitle: "Filtrlar: ",
    noFilters: "Qo'shimcha filtrlar hali yo'q.",
    filterAdded: "✅ Filtr qo'shildi",
    filterDeleted: "🗑️ Filtr o'chirildi",
    addFilterError: "❌ Qo'shishda xatolik",
    deleteFilterError: "❌ O'chirishda xatolik",
    reorderError: "❌ Tartibni sinxronlashda xatolik",
    shops: "Do'konlar",
    cat: {
      "furniture": "Mebel",
      "lighting": "Yoritish",
      "art-decor": "San’at va dekor",
      "walls": "Devorlar",
      "floor": "Pol",
      "stone": "Tosh",
      "real-estate": "Eksteryer",
      "plants": "O‘simliklar",
      "bathroom": "Vannaxona",
      "other": "Boshqa"
    }
  },
  ru: {
    home: "Главная",
    allShops: "Все магазины",
    hammasi: "Все",
    shopsCount: "Магазины",
    filter: "Фильтр",
    searchPlaceholder: "Поиск магазина, адреса или категории...",
    share: "Поделиться",
    linkCopied: "Ссылка скопирована",
    copyError: "Ошибка",
    directions: "Маршрут",
    close: "Закрыть",
    notFound: "Магазины не найдены",
    searchOther: "Укажите другое ключевое слово или категорию.",
    descPlaceholder: "Информация не предоставлена",
    locPlaceholder: "Адрес главного офиса не предоставлен",
    goToStore: "Перейти в магазин",
    // admin
    catsNotFound: "Категории не найдены.",
    manageFilters: "Управление фильтрами",
    shopsCountLabel: "магазинов",
    noShopsInCat: "В этой категории пока нет магазинов.",
    edit: "✏️ Редактировать",
    delete: "🗑️ Удалить",
    selectOption: "Выберите...",
    selectCategory: "Выберите категорию...",
    noSubcats: "В этой категории нет подкатегорий",
    dropLogo: "📁 Перетащите логотип сюда или нажмите",
    editShopTitle: "Редактировать магазин",
    addShopTitle: "Добавить магазин",
    nameRequired: "❗ Название - обязательное поле",
    catRequired: "❗ Категория - обязательное поле",
    subCatRequired: "❗ Подкатегория - обязательное поле",
    fillBothFields: "❗ Заполните оба поля (Название и Ссылка) для всех дополнительных ссылок",
    saving: "Сохранение…",
    save: "Сохранить",
    updated: "✅ Успешно обновлено",
    shopAdded: "✅ Магазин добавлен",
    shopDeleted: "🗑️ Магазин удален",
    saveFailed: "❌ Произошла ошибка: ",
    deleteFailed: "❌ Ошибка при удалении",
    uploading: "⏳ Загрузка...",
    uploadError: "❌ Ошибка. Попробуйте снова.",
    logoUploaded: "🖼️ Логотип загружен!",
    onlyImages: "❗ Можно загружать только изображения",
    imageTooLarge: "❗ Размер изображения должен быть меньше 2МБ",
    uploadFailed: "❌ Ошибка при загрузке: ",
    linkLabel: "Название (YouTube, TikTok...)",
    linkUrl: "Ссылка",
    filtersTitle: "Фильтры: ",
    noFilters: "Дополнительных фильтров пока нет.",
    filterAdded: "✅ Фильтр добавлен",
    filterDeleted: "🗑️ Фильтр удален",
    addFilterError: "❌ Ошибка добавления",
    deleteFilterError: "❌ Ошибка удаления",
    reorderError: "❌ Ошибка синхронизации порядка",
    shops: "Магазины",
    cat: {
      "furniture": "Мебель",
      "lighting": "Освещение",
      "art-decor": "Искусство и декор",
      "walls": "Стены",
      "floor": "Пол",
      "stone": "Камень",
      "real-estate": "Экстерьер",
      "plants": "Растения",
      "bathroom": "Ванная комната",
      "other": "Другое"
    }
  }
};

function t(key) {
  return i18n[currentLang]?.[key] || key;
}

function getCatName(slug) {
  return i18n[currentLang]?.cat?.[slug] || slug;
}

function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('houz_lang_v2', lang);
  location.reload(); 
}

document.addEventListener('DOMContentLoaded', () => {
    const langWrap = document.getElementById('langWrap');
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
  
    if (langWrap && langBtn && langDropdown) {

        // ── Sync UI to saved language on every page load ──
        const textSpan = langBtn.querySelector('.lang-text');
        if (textSpan) textSpan.textContent = currentLang.toUpperCase();

        const options = langDropdown.querySelectorAll('.lang-option');
        options.forEach(opt => {
            opt.classList.toggle('selected', opt.getAttribute('data-lang') === currentLang);
        });
        // ─────────────────────────────────────────────────

        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });
  
        document.addEventListener('click', (e) => {
            if (!langWrap.contains(e.target)) {
                langDropdown.classList.remove('active');
            }
        });
  
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                langDropdown.classList.remove('active');
                
                const lang = opt.getAttribute('data-lang');
                if (textSpan) textSpan.textContent = lang.toUpperCase();
                
                switchLang(lang);
            });
        });
    }
});

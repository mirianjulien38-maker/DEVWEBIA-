export const DEFAULT_WEBSITE_CODE = `<!DOCTYPE html>
<html lang="mg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GastroArt - Trano Fihinanana Malagasy Manara-penitra</title>
  <!-- Google Fonts: Playfair Display & Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;450;600;800&display=swap" rel="stylesheet">
  <!-- Font Awesome 6.4.0 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            serif: ['"Playfair Display"', 'serif'],
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    html {
      scroll-behavior: smooth;
    }
    .text-glow {
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body class="bg-amber-50/50 text-slate-800 font-sans transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">

  <!-- Header / Navigation -->
  <header class="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 dark:bg-slate-950/90 dark:border-b dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <!-- Logo -->
      <a href="javascript:void(0)" class="flex items-center gap-2">
        <span class="text-2xl font-serif font-bold text-amber-600 dark:text-amber-500">Gastro<span class="text-rose-600">Art</span></span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold">
        <a href="#home" class="hover:text-amber-600 transition-colors">Fandraisana</a>
        <a href="#about" class="hover:text-amber-600 transition-colors">Momba Anay</a>
        <a href="#menu" class="hover:text-amber-600 transition-colors">Ny Sakafo</a>
        <a href="#reserve" class="hover:text-amber-600 transition-colors">Famandrihana</a>
      </nav>

      <!-- Right actions -->
      <div class="flex items-center gap-4">
        <!-- Theme Toggle -->
        <button onclick="toggleDarkMode()" class="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors text-amber-600 dark:text-amber-400" title="Hanova lohahevitra">
          <i id="theme-icon" class="fa-solid fa-moon text-lg"></i>
        </button>

        <!-- CTAs -->
        <a href="#reserve" class="hidden sm:inline-block bg-amber-600 text-white font-semibold text-xs px-5 py-2.5 rounded-full hover:bg-amber-700 hover:shadow-md transition-all">Famandrihana Latabatra</a>

        <!-- Mobile Menu Toggle -->
        <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-slate-700 dark:text-slate-200">
          <i id="menu-icon" class="fa-solid fa-bars text-xl"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Nav Menu -->
    <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-slate-100 py-4 px-6 space-y-3 dark:bg-slate-950 dark:border-slate-800 transition-all duration-300">
      <a href="#home" onclick="toggleMobileMenu()" class="block font-semibold hover:text-amber-600">Fandraisana</a>
      <a href="#about" onclick="toggleMobileMenu()" class="block font-semibold hover:text-amber-600">Momba Anay</a>
      <a href="#menu" onclick="toggleMobileMenu()" class="block font-semibold hover:text-amber-600">Ny Sakafo</a>
      <a href="#reserve" onclick="toggleMobileMenu()" class="block font-semibold hover:text-amber-600">Famandrihana</a>
      <a href="#reserve" onclick="toggleMobileMenu()" class="block w-full text-center bg-amber-600 text-white font-semibold text-xs py-2.5 rounded-full">Famandrihana Latabatra</a>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="home" class="relative pt-32 pb-24 md:py-48 flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100/50 via-white to-rose-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
      <div class="space-y-6 text-center md:text-left">
        <span class="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-3 py-1.5 rounded-full">Kanto sy Sakafo Malagasy</span>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight">
          Hafalian'ny Lanilany amin'ny <span class="text-amber-600 dark:text-amber-500">Kanto sy tsiro</span>
        </h1>
        <p class="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto md:mx-0">
          Tongasoa eto amin'ny GastroArt, toerana iray hanandratana ny sakafo nentin-drazana Malagasy miaraka amin'ny fikarakarana maoderina sy voadio indrindra.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
          <a href="#menu" class="bg-amber-600 text-white font-bold text-sm px-8 py-3.5 rounded-full hover:bg-amber-700 shadow-md transition-all">Hijery ny Menu</a>
          <a href="#about" class="border border-slate-300 dark:border-slate-700 font-bold text-sm px-8 py-3.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Mianatra Momba Anay</a>
        </div>
      </div>
      <div class="relative flex justify-center">
        <!-- Floating circular badge -->
        <div class="absolute -top-4 -left-4 bg-rose-600 text-white rounded-full p-4 w-16 h-16 flex flex-col justify-center items-center shadow-lg animate-bounce text-glow font-serif">
          <span class="text-xs font-semibold">100%</span>
          <span class="text-[9px] uppercase font-bold">Kanto</span>
        </div>
        <img class="rounded-3xl shadow-2xl object-cover max-h-[450px] w-full max-w-md border-4 border-white dark:border-slate-800" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600" alt="Sakafo voadio">
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-20 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div class="grid grid-cols-2 gap-4">
        <img class="rounded-2xl shadow-md object-cover h-48 w-full" src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300" alt="Kanto 1">
        <img class="rounded-2xl shadow-md object-cover h-48 w-full mt-6" src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=300" alt="Kanto 2">
      </div>
      <div class="space-y-6">
        <span class="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-3 py-1.5 rounded-full">Ny Tantarantsika</span>
        <h2 class="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-slate-50">Kanto teraka avy amin'ny fitiavana ny tany sy ny tsiro</h2>
        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Niorina tamin'ny taona 2024, ny GastroArt dia mikatsaka ny hampifandray ny tsiro nentim-paharazana Malagasy amin'ny teknika mahandro sakafo maoderina indrindra eran-tany. Isaky ny lovia arosonay dia misy tantara manokana sy akora vao avy amin'ny tany lonaky ny Madagasikara.
        </p>
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="flex items-center gap-3">
            <span class="p-2 bg-amber-100 rounded-full text-amber-700 dark:bg-slate-800 dark:text-amber-400"><i class="fa-solid fa-seedling"></i></span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Akora vaovao 100%</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="p-2 bg-amber-100 rounded-full text-amber-700 dark:bg-slate-800 dark:text-amber-400"><i class="fa-solid fa-chef-hat"></i></span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Chef Mpikarakara matihanina</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Menu Section -->
  <section id="menu" class="py-20 bg-amber-50/20 dark:bg-slate-900/40">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center max-w-xl mx-auto mb-12 space-y-4">
        <span class="text-xs font-bold uppercase tracking-widest text-amber-600">Lovia Miavaka</span>
        <h2 class="text-3xl sm:text-4xl font-serif font-bold">Safidin'ny Chef Mpikarakara</h2>
        <p class="text-slate-600 dark:text-slate-300 text-xs">Sivano ny sakafo tianao hojerena ary fidio izay hampifaly ny fonao androany.</p>
        
        <!-- Interactive Category Filters -->
        <div class="flex justify-center gap-2 mt-6 flex-wrap">
          <button onclick="filterMenu('rehetra')" id="filter-rehetra" class="px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 bg-amber-600 text-white shadow-sm">Ny Rehetra</button>
          <button onclick="filterMenu('prika')" id="filter-prika" class="px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 bg-white hover:bg-amber-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Laoka fototra</button>
          <button onclick="filterMenu('tsindrin-tsakafo')" id="filter-tsindrin-tsakafo" class="px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 bg-white hover:bg-amber-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Tsindrin-tsakafo</button>
        </div>
      </div>

      <!-- Food Menu Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <!-- Item 1 -->
        <div class="menu-item prika bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 dark:bg-slate-950 dark:border dark:border-slate-800/80">
          <img class="h-48 w-full object-cover" src="https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=400" alt="Romazava Voadio">
          <div class="p-6 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold font-serif">Romazava Royal</span>
              <span class="text-sm font-extrabold text-rose-600">22,000 Ar</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Romazava nentim-paharazana misy anamamy vao, henakisoa, omby voadio miaraka amin'ny sakamalao.</p>
            <div class="flex justify-between items-center pt-2">
              <span class="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full dark:bg-slate-800"><i class="fa-solid fa-fire text-rose-500 mr-1"></i> Mafana sady matsiro</span>
              <button onclick="addToOrder('Romazava Royal', 22000)" class="text-xs font-bold text-amber-600 hover:text-amber-700"><i class="fa-solid fa-cart-plus mr-1"></i> Hanafarana</button>
            </div>
          </div>
        </div>

        <!-- Item 2 -->
        <div class="menu-item prika bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 dark:bg-slate-950 dark:border dark:border-slate-800/80">
          <img class="h-48 w-full object-cover" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" alt="Henakisoa sy Ravitoto">
          <div class="p-6 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold font-serif">Henakisoa sy Ravitoto</span>
              <span class="text-sm font-extrabold text-rose-600">25,000 Ar</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Ravitoto nopotsehina sy henakisoa matavy tsara, nandrahoina ela tamin'ny fomba malagasy nentim-paharazana.</p>
            <div class="flex justify-between items-center pt-2">
              <span class="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full dark:bg-slate-800"><i class="fa-solid fa-star text-amber-500 mr-1"></i> Laharana Voalohany</span>
              <button onclick="addToOrder('Henakisoa sy Ravitoto', 25000)" class="text-xs font-bold text-amber-600 hover:text-amber-700"><i class="fa-solid fa-cart-plus mr-1"></i> Hanafarana</button>
            </div>
          </div>
        </div>

        <!-- Item 3 -->
        <div class="menu-item tsindrin-tsakafo bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 dark:bg-slate-950 dark:border dark:border-slate-800/80">
          <img class="h-48 w-full object-cover" src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400" alt="Koba voadio">
          <div class="p-6 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold font-serif">Koba Gourmand</span>
              <span class="text-sm font-extrabold text-rose-600">12,000 Ar</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Koba nentim-paharazana miaraka amin'ny glasy vanilla avy any Sambava sy sôkôla mafana.</p>
            <div class="flex justify-between items-center pt-2">
              <span class="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full dark:bg-slate-800"><i class="fa-solid fa-cookie-bite mr-1"></i> Mamy tsara</span>
              <button onclick="addToOrder('Koba Gourmand', 12000)" class="text-xs font-bold text-amber-600 hover:text-amber-700"><i class="fa-solid fa-cart-plus mr-1"></i> Hanafarana</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Reservation Section -->
  <section id="reserve" class="py-20 bg-white dark:bg-slate-950">
    <div class="max-w-4xl mx-auto px-6">
      <div class="bg-gradient-to-br from-amber-50 to-rose-50 p-8 md:p-12 rounded-3xl shadow-xl dark:from-slate-900 dark:to-slate-950 dark:border dark:border-slate-800">
        <div class="text-center space-y-3 mb-8">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-600">Famandrihana Toerana</span>
          <h2 class="text-3xl font-serif font-bold">Mamandriha Latabatra</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Fenoy ireto manaraka ireto mba hitehirizana ny latabatrao.</p>
        </div>

        <form id="reservation-form" onsubmit="handleReserve(event)" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5 text-left">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Anarana feno</label>
            <input required type="text" id="reserve-name" placeholder="Rabe Jean" class="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 text-sm">
          </div>
          <div class="space-y-1.5 text-left">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Laharana finday</label>
            <input required type="text" id="reserve-phone" placeholder="034 00 000 00" class="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 text-sm">
          </div>
          <div class="space-y-1.5 text-left">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Andro ho avy</label>
            <input required type="date" id="reserve-date" class="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 text-sm text-slate-600">
          </div>
          <div class="space-y-1.5 text-left">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Isan'ny olona</label>
            <select id="reserve-guests" class="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 text-sm text-slate-600">
              <option value="2">Olona 2</option>
              <option value="4">Olona 4</option>
              <option value="6">Olona 6 na mihoatra</option>
            </select>
          </div>
          <button type="submit" class="md:col-span-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer text-sm">Andefa Famandrihana</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Interactive Mini Order Summary Drawer -->
  <div id="order-summary" class="fixed bottom-6 right-6 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 max-w-sm hidden z-40 animate-slide-in">
    <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
      <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase"><i class="fa-solid fa-bag-shopping text-amber-600 mr-1.5"></i> Ny Baikoinao</span>
      <button onclick="closeOrderSummary()" class="text-slate-400 hover:text-slate-600 text-xs"><i class="fa-solid fa-times"></i></button>
    </div>
    <div id="order-items" class="space-y-1 max-h-32 overflow-y-auto mb-2 text-xs text-slate-600 dark:text-slate-300"></div>
    <div class="flex justify-between items-center pt-2 border-t border-slate-100 text-sm">
      <span class="font-bold">Total:</span>
      <span id="order-total" class="font-bold text-rose-600">0 Ar</span>
    </div>
    <button onclick="submitOrder()" class="w-full mt-3 bg-emerald-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-emerald-700 transition-colors">Hanamarina ny Baiko</button>
  </div>

  <!-- Success Modal Popup -->
  <div id="success-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 hidden">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border dark:border-slate-800 animate-scale-up">
      <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 text-2xl">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3 id="modal-title" class="text-xl font-bold font-serif text-slate-900 dark:text-white">Vita Soa Aman-tsara!</h3>
      <p id="modal-msg" class="text-xs text-slate-500 leading-relaxed dark:text-slate-300">Naray soa aman-tsara ny famandrihanao. Misaotra indrindra!</p>
      <button onclick="closeSuccessModal()" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-all text-xs dark:bg-amber-600 dark:hover:bg-amber-700">Miverina</button>
    </div>
  </div>

  <!-- Footer -->
  <footer class="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="space-y-4">
        <span class="text-2xl font-serif font-bold text-amber-500">GastroArt</span>
        <p class="text-xs leading-relaxed">Ny kanton'ny sakafo Malagasy manara-penitra.</p>
      </div>
      <div class="space-y-2 text-xs">
        <h4 class="font-bold text-white mb-2">Ora fisokafana</h4>
        <p>Alatsinainy - Sabotsy: 11:30 - 22:30</p>
        <p>Alahady: 12:00 - 21:00</p>
      </div>
      <div class="space-y-2 text-xs">
        <h4 class="font-bold text-white mb-2">Fifandraisana</h4>
        <p><i class="fa-solid fa-phone mr-1.5"></i> +261 34 00 000 00</p>
        <p><i class="fa-solid fa-location-dot mr-1.5"></i> Antananarivo, Madagasikara</p>
      </div>
    </div>
    <div class="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 text-center text-[10px] text-slate-600">
      <p>© 2026 GastroArt. Zo rehetra voatana. Natao tamin'ny alalan'ny <span class="text-rose-600 font-bold">DEVWEB IA</span>.</p>
    </div>
  </footer>

  <!-- Scripts -->
  <script>
    // Theme toggle function
    function toggleDarkMode() {
      const html = document.documentElement;
      const themeIcon = document.getElementById('theme-icon');
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        themeIcon.className = 'fa-solid fa-moon text-lg';
        localStorage.setItem('gastroart-theme', 'light');
      } else {
        html.classList.add('dark');
        themeIcon.className = 'fa-solid fa-sun text-lg';
        localStorage.setItem('gastroart-theme', 'dark');
      }
    }

    // Load initial theme from localStorage
    if (localStorage.getItem('gastroart-theme') === 'dark') {
      document.documentElement.classList.add('dark');
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-lg';
    }

    // Mobile Menu Toggle
    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      const menuIcon = document.getElementById('menu-icon');
      if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menuIcon.className = 'fa-solid fa-times text-xl';
      } else {
        menu.classList.add('hidden');
        menuIcon.className = 'fa-solid fa-bars text-xl';
      }
    }

    // Filter Menu Items
    function filterMenu(category) {
      const items = document.querySelectorAll('.menu-item');
      items.forEach(item => {
        if (category === 'rehetra') {
          item.classList.remove('hidden');
        } else if (item.classList.contains(category)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });

      // Update button styling
      const btns = ['rehetra', 'prika', 'tsindrin-tsakafo'];
      btns.forEach(b => {
        const btn = document.getElementById('filter-' + b);
        if (btn) {
          if (b === category) {
            btn.className = 'px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 bg-amber-600 text-white shadow-sm';
          } else {
            btn.className = 'px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 bg-white hover:bg-amber-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';
          }
        }
      });
    }

    // Active Order items storage
    let currentOrder = [];

    function addToOrder(name, price) {
      const existing = currentOrder.find(item => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        currentOrder.push({ name, price, qty: 1 });
      }
      renderOrder();
      document.getElementById('order-summary').classList.remove('hidden');
    }

    function renderOrder() {
      const itemsContainer = document.getElementById('order-items');
      const totalSpan = document.getElementById('order-total');
      itemsContainer.innerHTML = '';
      let total = 0;

      currentOrder.forEach((item, idx) => {
        const itemCost = item.price * item.qty;
        total += itemCost;

        itemsContainer.innerHTML += \`
          <div class="flex justify-between items-center py-1">
            <span>\${item.name} (x\${item.qty})</span>
            <div class="flex items-center gap-2">
              <span class="font-bold">\${itemCost.toLocaleString()} Ar</span>
              <button onclick="removeFromOrder(\${idx})" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </div>
        \`;
      });

      totalSpan.innerText = total.toLocaleString() + ' Ar';
    }

    function removeFromOrder(index) {
      currentOrder.splice(index, 1);
      renderOrder();
      if (currentOrder.length === 0) {
        closeOrderSummary();
      }
    }

    function closeOrderSummary() {
      document.getElementById('order-summary').classList.add('hidden');
    }

    function submitOrder() {
      if (currentOrder.length === 0) return;
      
      const itemsStr = currentOrder.map(i => \`\${i.name} (x\${i.qty})\`).join(', ');
      
      document.getElementById('modal-title').innerText = 'Naharay soa ny baiko!';
      document.getElementById('modal-msg').innerText = \`Voaray tsara ny baikonao momba ny: \${itemsStr}. Eo am-pikarakarana azy izahay izao. Misaotra betsaka!\`;
      document.getElementById('success-modal').classList.remove('hidden');
      
      currentOrder = [];
      closeOrderSummary();
    }

    // Reserve Form Handler
    function handleReserve(event) {
      event.preventDefault();
      const name = document.getElementById('reserve-name').value;
      const guests = document.getElementById('reserve-guests').value;
      const date = document.getElementById('reserve-date').value;

      document.getElementById('modal-title').innerText = 'Famandrihana Voaray!';
      document.getElementById('modal-msg').innerText = \`Tontosa soa aman-tsara ny famandrihana nataonao, \${name}, ho an'olona \${guests} amin'ny andro \${date}. Handefasanay SMS fanamarinana ianao. Misaotra indrindra!\`;
      document.getElementById('success-modal').classList.remove('hidden');
      
      document.getElementById('reservation-form').reset();
    }

    function closeSuccessModal() {
      document.getElementById('success-modal').classList.add('hidden');
    }
  </script>
</body>
</html>`;

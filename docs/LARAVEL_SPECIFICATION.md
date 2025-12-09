# 📋 Spesifikasi Teknis Laravel - Layanan Pesan Antar Makanan

## 🏗️ 1. Arsitektur Sistem

### Flow Aplikasi

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Halaman       │────▶│   List Warung   │────▶│  Detail Warung  │
│   Utama         │     │   per Wilayah   │     │   + Menu        │
│   (Pilih        │     │                 │     │                 │
│   Wilayah)      │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Redirect      │◀────│   Checkout      │◀────│   Keranjang     │
│   WhatsApp      │     │   + Ongkir      │     │   Belanja       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Penyimpanan Keranjang

Keranjang disimpan menggunakan **Laravel Session** dengan struktur:

```php
session('cart') = [
    'wilayah_id' => 1,
    'wilayah_nama' => 'Cikedung',
    'warung_id' => 5,
    'warung_nama' => 'Warung Makan Bu Siti',
    'items' => [
        [
            'menu_id' => 10,
            'nama' => 'Nasi Goreng',
            'harga' => 15000,
            'qty' => 2,
            'subtotal' => 30000
        ],
        // ...
    ],
    'subtotal' => 45000,
    'ongkir' => 5000,
    'total' => 50000
];
```

---

## 🗄️ 2. Struktur Database (Laravel Migrations)

### Migration: wilayahs

```php
<?php
// database/migrations/2024_01_01_000001_create_wilayahs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wilayahs', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->integer('ongkir')->default(0); // dalam Rupiah
            $table->string('foto')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wilayahs');
    }
};
```

### Migration: warungs

```php
<?php
// database/migrations/2024_01_01_000002_create_warungs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warungs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_id')->constrained('wilayahs')->onDelete('cascade');
            $table->string('nama');
            $table->text('alamat');
            $table->string('jam_buka')->nullable(); // contoh: "08:00 - 21:00"
            $table->string('no_wa'); // nomor WhatsApp tanpa 0 depan, contoh: 6281234567890
            $table->string('foto')->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warungs');
    }
};
```

### Migration: menus

```php
<?php
// database/migrations/2024_01_01_000003_create_menus_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warung_id')->constrained('warungs')->onDelete('cascade');
            $table->string('nama');
            $table->integer('harga'); // dalam Rupiah
            $table->text('deskripsi')->nullable();
            $table->string('foto')->nullable();
            $table->string('kategori')->nullable(); // Makanan, Minuman, Snack
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
```

### Migration: orders (Opsional - untuk logging)

```php
<?php
// database/migrations/2024_01_01_000004_create_orders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('wilayah_id')->constrained('wilayahs');
            $table->foreignId('warung_id')->constrained('warungs');
            $table->string('nama_pemesan');
            $table->text('alamat_pemesan');
            $table->string('no_wa_pemesan');
            $table->text('catatan')->nullable();
            $table->json('items'); // detail pesanan
            $table->integer('subtotal');
            $table->integer('ongkir');
            $table->integer('total');
            $table->string('status')->default('pending'); // pending, confirmed, delivered
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

---

## 📦 3. Eloquent Models

### Model: Wilayah

```php
<?php
// app/Models/Wilayah.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wilayah extends Model
{
    use HasFactory;

    protected $table = 'wilayahs';

    protected $fillable = [
        'nama',
        'slug',
        'ongkir',
        'foto',
        'is_active',
    ];

    protected $casts = [
        'ongkir' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relasi: Wilayah memiliki banyak Warung
    public function warungs(): HasMany
    {
        return $this->hasMany(Warung::class);
    }

    // Scope: hanya wilayah aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessor: format ongkir ke Rupiah
    public function getOngkirFormattedAttribute(): string
    {
        return 'Rp ' . number_format($this->ongkir, 0, ',', '.');
    }
}
```

### Model: Warung

```php
<?php
// app/Models/Warung.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warung extends Model
{
    use HasFactory;

    protected $table = 'warungs';

    protected $fillable = [
        'wilayah_id',
        'nama',
        'alamat',
        'jam_buka',
        'no_wa',
        'foto',
        'deskripsi',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relasi: Warung dimiliki oleh satu Wilayah
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }

    // Relasi: Warung memiliki banyak Menu
    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    // Scope: hanya warung aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessor: URL WhatsApp
    public function getWhatsappUrlAttribute(): string
    {
        return "https://wa.me/{$this->no_wa}";
    }
}
```

### Model: Menu

```php
<?php
// app/Models/Menu.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menus';

    protected $fillable = [
        'warung_id',
        'nama',
        'harga',
        'deskripsi',
        'foto',
        'kategori',
        'is_available',
    ];

    protected $casts = [
        'harga' => 'integer',
        'is_available' => 'boolean',
    ];

    // Relasi: Menu dimiliki oleh satu Warung
    public function warung(): BelongsTo
    {
        return $this->belongsTo(Warung::class);
    }

    // Scope: hanya menu tersedia
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    // Accessor: format harga ke Rupiah
    public function getHargaFormattedAttribute(): string
    {
        return 'Rp ' . number_format($this->harga, 0, ',', '.');
    }
}
```

### Model: Order

```php
<?php
// app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'order_code',
        'wilayah_id',
        'warung_id',
        'nama_pemesan',
        'alamat_pemesan',
        'no_wa_pemesan',
        'catatan',
        'items',
        'subtotal',
        'ongkir',
        'total',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'integer',
        'ongkir' => 'integer',
        'total' => 'integer',
    ];

    // Relasi
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }

    public function warung(): BelongsTo
    {
        return $this->belongsTo(Warung::class);
    }

    // Generate order code
    public static function generateOrderCode(): string
    {
        $prefix = 'ORD';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -4));
        return "{$prefix}-{$date}-{$random}";
    }
}
```

---

## 🛤️ 4. Routing Laravel (web.php)

```php
<?php
// routes/web.php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\WarungController;
use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// =====================
// HALAMAN UTAMA
// =====================

// Halaman utama - pilih wilayah
Route::get('/', [HomeController::class, 'index'])->name('home');

// Halaman wilayah - list warung berdasarkan wilayah
Route::get('/wilayah/{slug}', [HomeController::class, 'showWilayah'])->name('wilayah.show');

// =====================
// WARUNG
// =====================

// Detail warung + list menu
Route::get('/warung/{id}', [WarungController::class, 'detail'])->name('warung.detail');

// =====================
// KERANJANG / CART
// =====================

Route::prefix('cart')->name('cart.')->group(function () {
    // Tambah item ke keranjang
    Route::post('/add', [CartController::class, 'addToCart'])->name('add');
    
    // Update quantity item
    Route::post('/update', [CartController::class, 'updateCart'])->name('update');
    
    // Hapus item dari keranjang
    Route::post('/remove', [CartController::class, 'removeFromCart'])->name('remove');
    
    // Kosongkan keranjang
    Route::post('/clear', [CartController::class, 'clearCart'])->name('clear');
    
    // Get cart data (untuk AJAX)
    Route::get('/data', [CartController::class, 'getCartData'])->name('data');
});

// =====================
// CHECKOUT
// =====================

// Halaman checkout
Route::get('/checkout', [CartController::class, 'checkout'])->name('checkout');

// Proses checkout - redirect ke WhatsApp
Route::post('/checkout/process', [CartController::class, 'processCheckout'])->name('checkout.process');
```

---

## 🎮 5. Controllers

### HomeController

```php
<?php
// app/Http/Controllers/HomeController.php

namespace App\Http\Controllers;

use App\Models\Wilayah;
use App\Models\Warung;
use Illuminate\Http\Request;
use Illuminate\View\View;

class HomeController extends Controller
{
    /**
     * Halaman utama - menampilkan semua wilayah
     */
    public function index(): View
    {
        $wilayahs = Wilayah::active()
            ->withCount('warungs')
            ->orderBy('nama')
            ->get();

        return view('home', compact('wilayahs'));
    }

    /**
     * Menampilkan daftar warung berdasarkan wilayah
     */
    public function showWilayah(string $slug): View
    {
        $wilayah = Wilayah::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $warungs = Warung::where('wilayah_id', $wilayah->id)
            ->active()
            ->with('menus')
            ->withCount('menus')
            ->orderBy('nama')
            ->get();

        return view('wilayah', compact('wilayah', 'warungs'));
    }
}
```

### WarungController

```php
<?php
// app/Http/Controllers/WarungController.php

namespace App\Http\Controllers;

use App\Models\Warung;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\View\View;

class WarungController extends Controller
{
    /**
     * Detail warung + list menu
     */
    public function detail(int $id): View
    {
        $warung = Warung::with(['wilayah', 'menus' => function ($query) {
            $query->available()->orderBy('kategori')->orderBy('nama');
        }])
        ->active()
        ->findOrFail($id);

        // Group menu by kategori
        $menusByKategori = $warung->menus->groupBy('kategori');

        // Get cart data
        $cart = session('cart', []);

        return view('warung', compact('warung', 'menusByKategori', 'cart'));
    }
}
```

### CartController

```php
<?php
// app/Http/Controllers/CartController.php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Warung;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class CartController extends Controller
{
    /**
     * Tambah item ke keranjang
     */
    public function addToCart(Request $request): JsonResponse
    {
        $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'qty' => 'required|integer|min:1',
        ]);

        $menu = Menu::with('warung.wilayah')->findOrFail($request->menu_id);
        $warung = $menu->warung;
        $wilayah = $warung->wilayah;

        $cart = session('cart', []);

        // Jika keranjang kosong atau berbeda warung, reset cart
        if (empty($cart) || ($cart['warung_id'] ?? null) !== $warung->id) {
            $cart = [
                'wilayah_id' => $wilayah->id,
                'wilayah_nama' => $wilayah->nama,
                'wilayah_slug' => $wilayah->slug,
                'warung_id' => $warung->id,
                'warung_nama' => $warung->nama,
                'warung_no_wa' => $warung->no_wa,
                'ongkir' => $wilayah->ongkir,
                'items' => [],
            ];
        }

        // Cek apakah menu sudah ada di keranjang
        $itemIndex = collect($cart['items'])->search(function ($item) use ($menu) {
            return $item['menu_id'] === $menu->id;
        });

        if ($itemIndex !== false) {
            // Update quantity
            $cart['items'][$itemIndex]['qty'] += $request->qty;
            $cart['items'][$itemIndex]['subtotal'] = $cart['items'][$itemIndex]['harga'] * $cart['items'][$itemIndex]['qty'];
        } else {
            // Tambah item baru
            $cart['items'][] = [
                'menu_id' => $menu->id,
                'nama' => $menu->nama,
                'harga' => $menu->harga,
                'qty' => $request->qty,
                'subtotal' => $menu->harga * $request->qty,
            ];
        }

        // Hitung total
        $cart = $this->calculateTotals($cart);

        session(['cart' => $cart]);

        return response()->json([
            'success' => true,
            'message' => "{$menu->nama} ditambahkan ke keranjang",
            'cart' => $cart,
        ]);
    }

    /**
     * Update quantity item
     */
    public function updateCart(Request $request): JsonResponse
    {
        $request->validate([
            'menu_id' => 'required|integer',
            'qty' => 'required|integer|min:0',
        ]);

        $cart = session('cart', []);

        if (empty($cart['items'])) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang kosong',
            ], 400);
        }

        $itemIndex = collect($cart['items'])->search(function ($item) use ($request) {
            return $item['menu_id'] === $request->menu_id;
        });

        if ($itemIndex === false) {
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan',
            ], 404);
        }

        if ($request->qty === 0) {
            // Hapus item
            unset($cart['items'][$itemIndex]);
            $cart['items'] = array_values($cart['items']); // Re-index
        } else {
            // Update quantity
            $cart['items'][$itemIndex]['qty'] = $request->qty;
            $cart['items'][$itemIndex]['subtotal'] = $cart['items'][$itemIndex]['harga'] * $request->qty;
        }

        // Jika tidak ada items, kosongkan cart
        if (empty($cart['items'])) {
            session()->forget('cart');
            return response()->json([
                'success' => true,
                'message' => 'Keranjang kosong',
                'cart' => null,
            ]);
        }

        $cart = $this->calculateTotals($cart);
        session(['cart' => $cart]);

        return response()->json([
            'success' => true,
            'message' => 'Keranjang diperbarui',
            'cart' => $cart,
        ]);
    }

    /**
     * Hapus item dari keranjang
     */
    public function removeFromCart(Request $request): JsonResponse
    {
        $request->validate([
            'menu_id' => 'required|integer',
        ]);

        $request->merge(['qty' => 0]);
        return $this->updateCart($request);
    }

    /**
     * Kosongkan keranjang
     */
    public function clearCart(): JsonResponse
    {
        session()->forget('cart');

        return response()->json([
            'success' => true,
            'message' => 'Keranjang dikosongkan',
        ]);
    }

    /**
     * Get cart data untuk AJAX
     */
    public function getCartData(): JsonResponse
    {
        $cart = session('cart');

        return response()->json([
            'success' => true,
            'cart' => $cart,
        ]);
    }

    /**
     * Halaman checkout
     */
    public function checkout(): View|RedirectResponse
    {
        $cart = session('cart');

        if (empty($cart) || empty($cart['items'])) {
            return redirect()->route('home')
                ->with('error', 'Keranjang belanja kosong');
        }

        return view('checkout', compact('cart'));
    }

    /**
     * Proses checkout - generate URL WhatsApp dan redirect
     */
    public function processCheckout(Request $request): RedirectResponse
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $cart = session('cart');

        if (empty($cart) || empty($cart['items'])) {
            return redirect()->route('home')
                ->with('error', 'Keranjang belanja kosong');
        }

        // Generate daftar menu untuk pesan WA
        $daftarMenu = '';
        foreach ($cart['items'] as $item) {
            $subtotalFormatted = 'Rp ' . number_format($item['subtotal'], 0, ',', '.');
            $daftarMenu .= "• {$item['nama']} x{$item['qty']} = {$subtotalFormatted}\n";
        }

        // Format harga
        $subtotalFormatted = 'Rp ' . number_format($cart['subtotal'], 0, ',', '.');
        $ongkirFormatted = 'Rp ' . number_format($cart['ongkir'], 0, ',', '.');
        $totalFormatted = 'Rp ' . number_format($cart['total'], 0, ',', '.');

        // Generate pesan WhatsApp
        $message = "*PESANAN BARU*\n\n";
        $message .= "📍 *Wilayah:* {$cart['wilayah_nama']}\n";
        $message .= "🏪 *Warung:* {$cart['warung_nama']}\n\n";
        $message .= "👤 *Nama:* {$request->nama}\n";
        $message .= "🏠 *Alamat:* {$request->alamat}\n";
        
        if ($request->catatan) {
            $message .= "📝 *Catatan:* {$request->catatan}\n";
        }
        
        $message .= "\n*Pesanan:*\n{$daftarMenu}\n";
        $message .= "💰 *Subtotal:* {$subtotalFormatted}\n";
        $message .= "🚚 *Ongkir:* {$ongkirFormatted}\n";
        $message .= "━━━━━━━━━━━━━━━━\n";
        $message .= "💵 *TOTAL BAYAR:* {$totalFormatted}";

        // Encode pesan untuk URL
        $encodedMessage = urlencode($message);

        // Generate WhatsApp URL
        $waNumber = $cart['warung_no_wa'];
        $whatsappUrl = "https://wa.me/{$waNumber}?text={$encodedMessage}";

        // Opsional: Simpan order ke database untuk logging
        Order::create([
            'order_code' => Order::generateOrderCode(),
            'wilayah_id' => $cart['wilayah_id'],
            'warung_id' => $cart['warung_id'],
            'nama_pemesan' => $request->nama,
            'alamat_pemesan' => $request->alamat,
            'no_wa_pemesan' => '', // bisa ditambahkan field
            'catatan' => $request->catatan,
            'items' => $cart['items'],
            'subtotal' => $cart['subtotal'],
            'ongkir' => $cart['ongkir'],
            'total' => $cart['total'],
            'status' => 'pending',
        ]);

        // Kosongkan keranjang
        session()->forget('cart');

        // Redirect ke WhatsApp
        return redirect()->away($whatsappUrl);
    }

    /**
     * Helper: Hitung subtotal dan total
     */
    private function calculateTotals(array $cart): array
    {
        $subtotal = collect($cart['items'])->sum('subtotal');
        $cart['subtotal'] = $subtotal;
        $cart['total'] = $subtotal + $cart['ongkir'];

        return $cart;
    }
}
```

---

## 🎨 6. Blade Views

### Layout: layouts/app.blade.php

```blade
{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'AntarRasa - Pesan Antar Makanan')</title>
    
    {{-- Fonts --}}
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    {{-- Tailwind CSS (via CDN atau compile) --}}
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    @stack('styles')
</head>
<body class="bg-gray-50 font-sans antialiased">
    {{-- Navigation --}}
    <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <a href="{{ route('home') }}" class="text-2xl font-bold text-orange-500">
                    🍽️ AntarRasa
                </a>
                
                {{-- Cart Icon --}}
                <a href="{{ route('checkout') }}" class="relative p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span id="cart-count" class="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center {{ session('cart.items') ? '' : 'hidden' }}">
                        {{ count(session('cart.items', [])) }}
                    </span>
                </a>
            </div>
        </div>
    </nav>

    {{-- Flash Messages --}}
    @if(session('success'))
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {{ session('error') }}
        </div>
    @endif

    {{-- Main Content --}}
    <main>
        @yield('content')
    </main>

    {{-- Footer --}}
    <footer class="bg-gray-900 text-white py-8 mt-16">
        <div class="container mx-auto px-4 text-center">
            <p class="text-lg font-semibold mb-2">🍽️ AntarRasa</p>
            <p class="text-gray-400">Layanan Pesan Antar Makanan Terpercaya</p>
            <p class="text-gray-500 text-sm mt-4">© {{ date('Y') }} AntarRasa. All rights reserved.</p>
        </div>
    </footer>

    @stack('scripts')
</body>
</html>
```

### home.blade.php

```blade
{{-- resources/views/home.blade.php --}}
@extends('layouts.app')

@section('title', 'Pilih Wilayah - AntarRasa')

@section('content')
<div class="container mx-auto px-4 py-8">
    {{-- Hero Section --}}
    <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pesan Makanan, <span class="text-orange-500">Antar Cepat!</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Pilih wilayah Anda untuk melihat warung-warung makan terdekat
        </p>
    </div>

    {{-- Wilayah Grid --}}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        @forelse($wilayahs as $wilayah)
            <a href="{{ route('wilayah.show', $wilayah->slug) }}" 
               class="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                
                {{-- Image --}}
                <div class="aspect-video bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    @if($wilayah->foto)
                        <img src="{{ asset('storage/' . $wilayah->foto) }}" 
                             alt="{{ $wilayah->nama }}" 
                             class="w-full h-full object-cover">
                    @else
                        <span class="text-5xl">📍</span>
                    @endif
                </div>

                {{-- Content --}}
                <div class="p-4">
                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                        {{ $wilayah->nama }}
                    </h3>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-sm text-gray-500">
                            {{ $wilayah->warungs_count }} warung
                        </span>
                        <span class="text-sm font-medium text-green-600">
                            Ongkir: {{ $wilayah->ongkir_formatted }}
                        </span>
                    </div>
                </div>
            </a>
        @empty
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-lg">Belum ada wilayah tersedia</p>
            </div>
        @endforelse
    </div>
</div>
@endsection
```

### wilayah.blade.php

```blade
{{-- resources/views/wilayah.blade.php --}}
@extends('layouts.app')

@section('title', "Warung di {$wilayah->nama} - AntarRasa")

@section('content')
<div class="container mx-auto px-4 py-8">
    {{-- Breadcrumb --}}
    <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm">
            <li><a href="{{ route('home') }}" class="text-orange-500 hover:underline">Beranda</a></li>
            <li class="text-gray-400">/</li>
            <li class="text-gray-600">{{ $wilayah->nama }}</li>
        </ol>
    </nav>

    {{-- Header --}}
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Warung di <span class="text-orange-500">{{ $wilayah->nama }}</span>
        </h1>
        <p class="text-gray-600">
            Ongkir untuk wilayah ini: <span class="font-semibold text-green-600">{{ $wilayah->ongkir_formatted }}</span>
        </p>
    </div>

    {{-- Warung Grid --}}
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($warungs as $warung)
            <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {{-- Image --}}
                <div class="aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                    @if($warung->foto)
                        <img src="{{ asset('storage/' . $warung->foto) }}" 
                             alt="{{ $warung->nama }}" 
                             class="w-full h-full object-cover">
                    @else
                        <div class="w-full h-full flex items-center justify-center">
                            <span class="text-5xl">🏪</span>
                        </div>
                    @endif
                </div>

                {{-- Content --}}
                <div class="p-5">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">{{ $warung->nama }}</h3>
                    
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                        📍 {{ $warung->alamat }}
                    </p>

                    <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        @if($warung->jam_buka)
                            <span>🕐 {{ $warung->jam_buka }}</span>
                        @endif
                        <span>🍽️ {{ $warung->menus_count }} menu</span>
                    </div>

                    <a href="{{ route('warung.detail', $warung->id) }}" 
                       class="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
                        Lihat Menu
                    </a>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-lg">Belum ada warung di wilayah ini</p>
            </div>
        @endforelse
    </div>
</div>
@endsection
```

### warung.blade.php

```blade
{{-- resources/views/warung.blade.php --}}
@extends('layouts.app')

@section('title', "{$warung->nama} - AntarRasa")

@section('content')
<div class="container mx-auto px-4 py-8">
    {{-- Breadcrumb --}}
    <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm flex-wrap">
            <li><a href="{{ route('home') }}" class="text-orange-500 hover:underline">Beranda</a></li>
            <li class="text-gray-400">/</li>
            <li><a href="{{ route('wilayah.show', $warung->wilayah->slug) }}" class="text-orange-500 hover:underline">{{ $warung->wilayah->nama }}</a></li>
            <li class="text-gray-400">/</li>
            <li class="text-gray-600">{{ $warung->nama }}</li>
        </ol>
    </nav>

    {{-- Warung Header --}}
    <div class="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
        <div class="md:flex">
            <div class="md:w-1/3">
                @if($warung->foto)
                    <img src="{{ asset('storage/' . $warung->foto) }}" alt="{{ $warung->nama }}" class="w-full h-48 md:h-full object-cover">
                @else
                    <div class="w-full h-48 md:h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <span class="text-6xl">🏪</span>
                    </div>
                @endif
            </div>
            <div class="p-6 md:w-2/3">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{{ $warung->nama }}</h1>
                <p class="text-gray-600 mb-2">📍 {{ $warung->alamat }}</p>
                @if($warung->jam_buka)
                    <p class="text-gray-600 mb-2">🕐 {{ $warung->jam_buka }}</p>
                @endif
                <p class="text-green-600 font-medium">🚚 Ongkir: {{ $warung->wilayah->ongkir_formatted }}</p>
            </div>
        </div>
    </div>

    <div class="lg:flex lg:gap-8">
        {{-- Menu List --}}
        <div class="lg:w-2/3">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Daftar Menu</h2>
            
            @foreach($menusByKategori as $kategori => $menus)
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                        {{ $kategori ?: 'Lainnya' }}
                    </h3>
                    
                    <div class="grid gap-4">
                        @foreach($menus as $menu)
                            <div class="bg-white rounded-xl shadow-sm p-4 flex gap-4" id="menu-{{ $menu->id }}">
                                {{-- Menu Image --}}
                                <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    @if($menu->foto)
                                        <img src="{{ asset('storage/' . $menu->foto) }}" alt="{{ $menu->nama }}" class="w-full h-full object-cover">
                                    @else
                                        <div class="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                    @endif
                                </div>

                                {{-- Menu Info --}}
                                <div class="flex-grow">
                                    <h4 class="font-semibold text-gray-900">{{ $menu->nama }}</h4>
                                    @if($menu->deskripsi)
                                        <p class="text-sm text-gray-500 mt-1">{{ $menu->deskripsi }}</p>
                                    @endif
                                    <p class="text-orange-500 font-bold mt-2">{{ $menu->harga_formatted }}</p>
                                </div>

                                {{-- Add Button --}}
                                <div class="flex-shrink-0 self-center">
                                    <button onclick="addToCart({{ $menu->id }})" 
                                            class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                        + Tambah
                                    </button>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>

        {{-- Cart Sidebar --}}
        <div class="lg:w-1/3">
            <div class="bg-white rounded-2xl shadow-md p-6 sticky top-24" id="cart-sidebar">
                <h3 class="text-xl font-bold text-gray-900 mb-4">🛒 Keranjang</h3>
                
                <div id="cart-items">
                    {{-- Cart items will be loaded via JavaScript --}}
                    <p class="text-gray-500 text-center py-8">Keranjang masih kosong</p>
                </div>

                <div id="cart-summary" class="hidden border-t pt-4 mt-4">
                    <div class="flex justify-between text-gray-600 mb-2">
                        <span>Subtotal</span>
                        <span id="cart-subtotal">Rp 0</span>
                    </div>
                    <div class="flex justify-between text-gray-600 mb-2">
                        <span>Ongkir</span>
                        <span id="cart-ongkir">{{ $warung->wilayah->ongkir_formatted }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                        <span>Total</span>
                        <span id="cart-total">Rp 0</span>
                    </div>

                    <a href="{{ route('checkout') }}" 
                       class="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                        Checkout via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Add to cart function
    async function addToCart(menuId) {
        try {
            const response = await fetch('{{ route("cart.add") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    menu_id: menuId,
                    qty: 1
                })
            });

            const data = await response.json();
            
            if (data.success) {
                updateCartUI(data.cart);
                showToast(data.message, 'success');
            }
        } catch (error) {
            showToast('Gagal menambahkan ke keranjang', 'error');
        }
    }

    // Update cart UI
    function updateCartUI(cart) {
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const cartCount = document.getElementById('cart-count');

        if (!cart || !cart.items || cart.items.length === 0) {
            cartItems.innerHTML = '<p class="text-gray-500 text-center py-8">Keranjang masih kosong</p>';
            cartSummary.classList.add('hidden');
            cartCount.classList.add('hidden');
            return;
        }

        let itemsHtml = '';
        cart.items.forEach(item => {
            itemsHtml += `
                <div class="flex justify-between items-center py-2 border-b">
                    <div>
                        <p class="font-medium">${item.nama}</p>
                        <p class="text-sm text-gray-500">Rp ${item.harga.toLocaleString('id-ID')} x ${item.qty}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="updateQty(${item.menu_id}, ${item.qty - 1})" class="w-8 h-8 bg-gray-200 rounded-full">-</button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${item.menu_id}, ${item.qty + 1})" class="w-8 h-8 bg-gray-200 rounded-full">+</button>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = itemsHtml;
        cartSummary.classList.remove('hidden');
        
        document.getElementById('cart-subtotal').textContent = 'Rp ' + cart.subtotal.toLocaleString('id-ID');
        document.getElementById('cart-total').textContent = 'Rp ' + cart.total.toLocaleString('id-ID');
        
        cartCount.textContent = cart.items.length;
        cartCount.classList.remove('hidden');
    }

    // Update quantity
    async function updateQty(menuId, qty) {
        try {
            const response = await fetch('{{ route("cart.update") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    menu_id: menuId,
                    qty: qty
                })
            });

            const data = await response.json();
            
            if (data.success) {
                updateCartUI(data.cart);
            }
        } catch (error) {
            showToast('Gagal memperbarui keranjang', 'error');
        }
    }

    // Simple toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} shadow-lg z-50`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Load cart on page load
    document.addEventListener('DOMContentLoaded', async function() {
        try {
            const response = await fetch('{{ route("cart.data") }}');
            const data = await response.json();
            if (data.cart) {
                updateCartUI(data.cart);
            }
        } catch (error) {
            console.error('Failed to load cart');
        }
    });
</script>
@endpush
```

### checkout.blade.php

```blade
{{-- resources/views/checkout.blade.php --}}
@extends('layouts.app')

@section('title', 'Checkout - AntarRasa')

@section('content')
<div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

    {{-- Order Summary --}}
    <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
        
        <div class="text-sm text-gray-600 mb-4">
            <p><strong>Wilayah:</strong> {{ $cart['wilayah_nama'] }}</p>
            <p><strong>Warung:</strong> {{ $cart['warung_nama'] }}</p>
        </div>

        <div class="divide-y">
            @foreach($cart['items'] as $item)
                <div class="py-3 flex justify-between">
                    <div>
                        <p class="font-medium">{{ $item['nama'] }}</p>
                        <p class="text-sm text-gray-500">Rp {{ number_format($item['harga'], 0, ',', '.') }} x {{ $item['qty'] }}</p>
                    </div>
                    <p class="font-medium">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</p>
                </div>
            @endforeach
        </div>

        <div class="border-t pt-4 mt-4 space-y-2">
            <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rp {{ number_format($cart['subtotal'], 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
                <span>Ongkir ({{ $cart['wilayah_nama'] }})</span>
                <span>Rp {{ number_format($cart['ongkir'], 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                <span>Total Bayar</span>
                <span class="text-orange-500">Rp {{ number_format($cart['total'], 0, ',', '.') }}</span>
            </div>
        </div>
    </div>

    {{-- Customer Info Form --}}
    <form action="{{ route('checkout.process') }}" method="POST" class="bg-white rounded-2xl shadow-md p-6">
        @csrf
        
        <h2 class="text-xl font-bold text-gray-900 mb-4">Data Pemesan</h2>

        <div class="space-y-4">
            <div>
                <label for="nama" class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" name="nama" id="nama" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                       placeholder="Masukkan nama Anda">
                @error('nama')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="alamat" class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                <textarea name="alamat" id="alamat" rows="3" required
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Masukkan alamat lengkap untuk pengiriman"></textarea>
                @error('alamat')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="catatan" class="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea name="catatan" id="catatan" rows="2"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Contoh: Tidak pakai sambal, tolong hubungi dulu sebelum antar"></textarea>
            </div>
        </div>

        <button type="submit" 
                class="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order via WhatsApp
        </button>
    </form>
</div>
@endsection
```

---

## 📱 7. Format Pesan WhatsApp

Template pesan yang akan di-generate:

```
*PESANAN BARU*

📍 *Wilayah:* Cikedung
🏪 *Warung:* Warung Makan Bu Siti

👤 *Nama:* Budi Santoso
🏠 *Alamat:* Jl. Raya Cikedung No. 123, RT 01/RW 02
📝 *Catatan:* Tidak pakai sambal

*Pesanan:*
• Nasi Goreng Spesial x2 = Rp 50.000
• Es Teh Manis x2 = Rp 10.000

💰 *Subtotal:* Rp 60.000
🚚 *Ongkir:* Rp 5.000
━━━━━━━━━━━━━━━━
💵 *TOTAL BAYAR:* Rp 65.000
```

---

## 📦 8. Rekomendasi Package Laravel

```json
{
    "require": {
        "php": "^8.1",
        "laravel/framework": "^10.0",
        "intervention/image": "^2.7",
        "spatie/laravel-query-builder": "^5.0"
    },
    "require-dev": {
        "barryvdh/laravel-ide-helper": "^2.13",
        "laravel/pint": "^1.0"
    }
}
```

### Instalasi:

```bash
# Image processing
composer require intervention/image

# Query builder untuk filter
composer require spatie/laravel-query-builder

# IDE Helper (dev)
composer require --dev barryvdh/laravel-ide-helper
```

---

## 🚀 9. Deployment Checklist

### Contoh .env

```env
APP_NAME="AntarRasa"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://antarrasa.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=antarrasa_db
DB_USERNAME=antarrasa_user
DB_PASSWORD=your_secure_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

### Setup Commands

```bash
# 1. Clone repository
git clone <repo-url>
cd antarrasa

# 2. Install dependencies
composer install --optimize-autoloader --no-dev

# 3. Copy environment file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Setup database (edit .env first)
php artisan migrate

# 6. Seed data (optional)
php artisan db:seed

# 7. Create storage link
php artisan storage:link

# 8. Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 9. Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Struktur Folder Akhir

```
antarrasa/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── HomeController.php
│   │       ├── WarungController.php
│   │       └── CartController.php
│   └── Models/
│       ├── Wilayah.php
│       ├── Warung.php
│       ├── Menu.php
│       └── Order.php
├── database/
│   └── migrations/
│       ├── 2024_01_01_000001_create_wilayahs_table.php
│       ├── 2024_01_01_000002_create_warungs_table.php
│       ├── 2024_01_01_000003_create_menus_table.php
│       └── 2024_01_01_000004_create_orders_table.php
├── resources/
│   └── views/
│       ├── layouts/
│       │   └── app.blade.php
│       ├── home.blade.php
│       ├── wilayah.blade.php
│       ├── warung.blade.php
│       └── checkout.blade.php
├── routes/
│   └── web.php
├── .env
└── ...
```

---

## ✅ Selesai!

Dokumentasi ini siap digunakan sebagai referensi untuk membangun aplikasi Laravel layanan pesan antar makanan. Developer dapat langsung mengimplementasikan berdasarkan spesifikasi di atas.

class_name WorldData
## Language worlds and the data the arena needs to dress each one.
##
## All six worlds are selectable in guest mode. Each has its own palette,
## background treatment, crate skin, ambience and fallback word bank so the
## game still works with no backend and feels different from world to world.

const ORDER := [
	"bahasa-inggris",
	"bahasa-indonesia",
	"bahasa-spanyol",
	"bahasa-prancis",
	"bahasa-jerman",
	"bahasa-portugis",
]

const WORLDS := {
	"bahasa-inggris": {
		"id": 1,
		"label": "English",
		"native": "English",
		"code": "EN",
		"flag": "EN",
		"tagline_key": "world_en_tag",
		"motif_key": "world_en_motif",
		"motif": "village",
		"bg": "res://art/village-960x360.png",
		"bg_tint": "#FFF4DE",
		"crate": "res://art/mossy-crate-32-removebg-preview.png",
		"accent": "#F2C14E",
		"accent_soft": "#FFE8A3",
		"ground": "#7A5A3B",
		"grass": "#6FA050",
		"rock": "#8A7458",
		"rock_dark": "#64513A",
		"ridge_far": "#9DBB8F",
		"ridge_mid": "#6E9A63",
		"ridge_near": "#4E7047",
		"ambient": "leaves",
		"ambient_color": "#C9D98A",
		"music_scale": [0, 2, 4, 7, 9, 12],
		"words": {
			"EASY": ["book", "home", "light", "apple", "water", "house", "table", "chair", "door", "bird", "fish", "tree", "star", "moon", "rain", "bread", "river", "cloud", "friend", "green"],
			"MEDIUM": ["sunrise", "village life", "green forest", "blue ocean", "bright star", "good morning", "thank you", "turn left", "go straight", "open the door", "fresh water", "quiet night"],
			"HARD": ["The quiet village woke up.", "A gentle breeze blew through the trees.", "Never give up on your dreams.", "Every journey begins with one step.", "Practice a little every day.", "The moon rose over the hills."],
		},
	},
	"bahasa-indonesia": {
		"id": 2,
		"label": "Indonesian",
		"native": "Bahasa Indonesia",
		"code": "ID",
		"flag": "ID",
		"tagline_key": "world_id_tag",
		"motif_key": "world_id_motif",
		"motif": "rice",
		"bg": "res://art/bg-english-village.png",
		"bg_tint": "#FFE9BD",
		"crate": "res://art/mossy-crate-32-removebg-preview.png",
		"accent": "#F2C14E",
		"accent_soft": "#FFE8A3",
		"ground": "#6B4A2F",
		"grass": "#55A05A",
		"rock": "#7B6A52",
		"rock_dark": "#574A38",
		"ridge_far": "#8DBE86",
		"ridge_mid": "#5C965C",
		"ridge_near": "#3C6F45",
		"ambient": "fireflies",
		"ambient_color": "#FFE08A",
		"music_scale": [0, 2, 4, 5, 7, 9, 12],
		"words": {
			"EASY": ["buku", "rumah", "lampu", "apel", "air", "meja", "kursi", "pintu", "burung", "ikan", "pohon", "bulan", "hujan", "lagu", "pagi", "roti", "sungai", "awan", "teman", "hijau"],
			"MEDIUM": ["matahari terbit", "sawah hijau", "laut biru", "selamat pagi", "terima kasih", "sampai jumpa", "hati-hati", "mimpi indah", "udara segar", "malam tenang", "jalan pulang", "cahaya bulan"],
			"HARD": ["Desa yang tenang mulai terbangun.", "Angin pagi berhembus lembut di antara pohon.", "Jangan pernah menyerah pada mimpimu.", "Setiap perjalanan dimulai dari satu langkah.", "Belajar sedikit setiap hari.", "Bulan terbit di atas perbukitan."],
		},
	},
	"bahasa-spanyol": {
		"id": 3,
		"label": "Spanish",
		"native": "Español",
		"code": "ES",
		"flag": "ES",
		"tagline_key": "world_es_tag",
		"motif_key": "world_es_motif",
		"motif": "mesa",
		"bg": "res://art/desert-ruins-960x360.png",
		"bg_tint": "#FFD3A8",
		"crate": "res://art/sandstone-block-32-removebg-preview.png",
		"accent": "#E85D3A",
		"accent_soft": "#FFC9A8",
		"ground": "#A66B3A",
		"grass": "#C99A55",
		"rock": "#C48A55",
		"rock_dark": "#925E35",
		"ridge_far": "#D99A6A",
		"ridge_mid": "#B4703F",
		"ridge_near": "#8C522C",
		"ambient": "sand",
		"ambient_color": "#FFD9A0",
		"music_scale": [0, 1, 5, 7, 8, 12],
		"words": {
			"EASY": ["libro", "casa", "luz", "agua", "mesa", "silla", "puerta", "pájaro", "pez", "árbol", "luna", "lluvia", "fuego", "sol", "mar", "pan", "río", "nube", "amigo", "verde"],
			"MEDIUM": ["amanecer", "bosque verde", "océano azul", "buenos días", "buenas noches", "hasta luego", "ten cuidado", "dulces sueños", "aire fresco", "noche tranquila", "camino a casa", "luz de luna"],
			"HARD": ["El pueblo tranquilo despertó.", "Una brisa suave soplaba entre los árboles.", "La paciencia es una virtud.", "Cada viaje comienza con un paso.", "Aprende un poco cada día.", "La luna salió sobre las colinas."],
		},
	},
	"bahasa-prancis": {
		"id": 4,
		"label": "French",
		"native": "Français",
		"code": "FR",
		"flag": "FR",
		"tagline_key": "world_fr_tag",
		"motif_key": "world_fr_motif",
		"motif": "lavender",
		"bg": "res://art/bg-logic-forest.png",
		"bg_tint": "#D9C4FF",
		"crate": "res://art/mossy-crate-32-removebg-preview.png",
		"accent": "#C9A7FF",
		"accent_soft": "#E9DBFF",
		"ground": "#54496B",
		"grass": "#7C6C9E",
		"rock": "#6B5F85",
		"rock_dark": "#473E5C",
		"ridge_far": "#8F7DB5",
		"ridge_mid": "#6C5A91",
		"ridge_near": "#4B3D6B",
		"ambient": "petals",
		"ambient_color": "#D9B8FF",
		"music_scale": [0, 2, 3, 7, 8, 12],
		"words": {
			"EASY": ["livre", "maison", "lumière", "pomme", "eau", "table", "chaise", "porte", "oiseau", "poisson", "arbre", "lune", "pluie", "feu", "mer", "pain", "rivière", "nuage", "ami", "vert"],
			"MEDIUM": ["lever du soleil", "forêt verte", "océan bleu", "bonjour", "bonne nuit", "merci", "à bientôt", "doux rêves", "air frais", "nuit calme", "chemin du retour", "clair de lune"],
			"HARD": ["Le village tranquille s'est réveillé.", "Une brise légère soufflait dans les arbres.", "La patience est une vertu.", "Chaque voyage commence par un pas.", "Apprends un peu chaque jour.", "La lune s'est levée sur les collines."],
		},
	},
	"bahasa-jerman": {
		"id": 5,
		"label": "German",
		"native": "Deutsch",
		"code": "DE",
		"flag": "DE",
		"tagline_key": "world_de_tag",
		"motif_key": "world_de_motif",
		"motif": "alpine",
		"bg": "res://art/forest-runes-960x360.png",
		"bg_tint": "#CDE6FF",
		"crate": "res://art/mossy-crate-32-removebg-preview.png",
		"accent": "#E8A93B",
		"accent_soft": "#FFE0A8",
		"ground": "#6E5A42",
		"grass": "#5E8C5A",
		"rock": "#8C8A80",
		"rock_dark": "#635F55",
		"ridge_far": "#A7B7C9",
		"ridge_mid": "#74879A",
		"ridge_near": "#4F6475",
		"ambient": "snow",
		"ambient_color": "#E8F4FF",
		"music_scale": [0, 2, 3, 5, 7, 10, 12],
		"words": {
			"EASY": ["Buch", "Haus", "Licht", "Apfel", "Wasser", "Tisch", "Stuhl", "Tür", "Vogel", "Fisch", "Baum", "Mond", "Regen", "Schnee", "Feuer", "Brot", "Fluss", "Wolke", "Freund", "grün"],
			"MEDIUM": ["Sonnenaufgang", "grüner Wald", "blaues Meer", "guten Morgen", "gute Nacht", "danke schön", "bis bald", "schöne Träume", "frische Luft", "stille Nacht", "Heimweg", "Mondlicht"],
			"HARD": ["Das stille Dorf erwachte.", "Ein sanfter Wind wehte durch die Bäume.", "Geduld ist eine Tugend.", "Jede Reise beginnt mit einem Schritt.", "Lerne jeden Tag ein wenig.", "Der Mond stieg über die Hügel."],
		},
	},
	"bahasa-portugis": {
		"id": 6,
		"label": "Portuguese",
		"native": "Português",
		"code": "PT",
		"flag": "PT",
		"tagline_key": "world_pt_tag",
		"motif_key": "world_pt_motif",
		"motif": "coast",
		"bg": "res://art/bg-math-desert.png",
		"bg_tint": "#BFEFE8",
		"crate": "res://art/mossy-crate-32-removebg-preview.png",
		"accent": "#2E9AA8",
		"accent_soft": "#A8E8E2",
		"ground": "#B08A5A",
		"grass": "#D9C08A",
		"rock": "#7BA6B0",
		"rock_dark": "#4E7A85",
		"ridge_far": "#8CC6C9",
		"ridge_mid": "#5A9A9F",
		"ridge_near": "#3F7378",
		"ambient": "spray",
		"ambient_color": "#C8F4F0",
		"music_scale": [0, 2, 4, 7, 8, 12],
		"words": {
			"EASY": ["livro", "casa", "luz", "maçã", "água", "mesa", "cadeira", "porta", "pássaro", "peixe", "árvore", "lua", "chuva", "fogo", "mar", "pão", "rio", "nuvem", "amigo", "verde"],
			"MEDIUM": ["nascer do sol", "floresta verde", "oceano azul", "bom dia", "boa noite", "obrigado", "até logo", "bons sonhos", "ar fresco", "noite calma", "caminho de casa", "luar"],
			"HARD": ["A aldeia tranquila acordou.", "Uma brisa suave soprava entre as árvores.", "A paciência é uma virtude.", "Cada viagem começa com um passo.", "Aprenda um pouco todos os dias.", "A lua subiu sobre as colinas."],
		},
	},
}

const ACCENTS := {
	"á": "a", "à": "a", "â": "a", "ä": "a", "ã": "a", "å": "a",
	"é": "e", "è": "e", "ê": "e", "ë": "e",
	"í": "i", "ì": "i", "î": "i", "ï": "i",
	"ó": "o", "ò": "o", "ô": "o", "ö": "o", "õ": "o",
	"ú": "u", "ù": "u", "û": "u", "ü": "u",
	"ñ": "n", "ç": "c",
	"’": "'", "‘": "'", "“": "\"", "”": "\"", "–": "-", "—": "-",
}

static func info(slug: String) -> Dictionary:
	if WORLDS.has(slug):
		return WORLDS[slug]
	return WORLDS["bahasa-inggris"]

static func fallback_words(slug: String, level: String) -> Array:
	var world := info(slug)
	var bank: Dictionary = world["words"]
	var words: Array = bank.get(level, bank["EASY"])
	return words.duplicate()

static func guest_worlds() -> Array:
	var out: Array = []
	for slug in ORDER:
		var info: Dictionary = WORLDS[slug]
		out.append({
			"id": int(info.get("id", 0)),
			"slug": slug,
			"nama": str(info.get("label", slug)),
			"native": str(info.get("native", slug)),
			"isActive": true,
			"guest": true,
		})
	return out

static func normalize_char(ch: String) -> String:
	var lower := ch.to_lower()
	if ACCENTS.has(lower):
		return ACCENTS[lower]
	return lower

static func same_char(a: String, b: String) -> bool:
	return normalize_char(a) == normalize_char(b)

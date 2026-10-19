# Mexican Spanish Word Power (Afuera)

2026-10-19 · From a book Josh owns. Word list only; no example sentences copied.

## Source

*Mexican Spanish Word Power 2001* (SpanishPod101 / Innovative Language). A picture-dictionary style list in 13 chapters and 178 topics. Each entry gives an English word, its part of speech, the Mexican Spanish word and a few examples.

- `mexican-words.csv`: 1,868 rows (`spanish,english,pos,topic,in_pcic,pcic_level`). The book has 1,905 entries; 37 exact repeats (same Spanish and English) were dropped, and the first topic was kept. 1,780 distinct Spanish forms.
- `scripts/parse_mexican_words.py` rebuilds it: `python3 -I scripts/parse_mexican_words.py <book.txt> level-words-es.csv mexican-words.csv`.
- `spanish` is the book's form, with the first letter lower-cased (proper nouns in the World topics keep theirs). Typos are kept as printed (see below).
- `in_pcic` is an exact match against `level-words-es.csv` lemmas: case-insensitive, accent-sensitive, nothing stripped. So *agacharse* does not match *agachar*, and phrases match only if the PCIC lists the same phrase.

## Topics

Counts are CSV rows; "in PCIC" is how many are in the PCIC A1–A2 list.

| Chapter | Rows | In PCIC | Topics (rows) |
|---|---|---|---|
| 1. Business | 68 | 12 (18%) | Business 3, Company 4, Industry 1, Media 14, Meetings 12, Meetings Actions 17, Production 17 |
| 2. Clothing | 80 | 27 (34%) | Accessories 10, Clothing 20, Clothing Actions 11, Clothing Describing 18, Clothing Formal 3, Footwear 4, Jewelry 3, Makeup 1, Underwear and Sleepwear 5, Womens Wear 5 |
| 3. Everyday basics | 417 | 188 (45%) | Calendar 7, Clock 10, Colors 8, Colors Basic 12, Common Actions 1–3 (9, 15, 11), Common Adjectives 1–3 (14, 11, 13), Common Expressions 26, Computer 8, Daily Routine Afternoon 3, Evening 7, Morning 3, Days of the Week 7, Directions 10, Measurements 4, Measurements Metric 6, Money 2, Months of the Year 12, Numbers 0–10 11, 101–999 10, 11–20 10, 21–100 10, 1000–10000 9, Big 10, Ordinal 9, Patterns 8, Personal Items 2, Questions 16, Shape Size Consistency 15, Shopping 24, Technology Everyday 14, Telephone 15, Time Relative 13, Time Seasons 4, Weather 39 |
| 4. Arts | 12 | 7 (58%) | Art 1, Literature 3, Musical Instruments 5, Performing Arts 1, Photography 2 |
| 5. Food and drink | 184 | 57 (31%) | At The Table 5, Condiments 11, Cooking 1, Cooking Actions 16, Drinks 13, Drinks Alcoholic 4, Eating Utensils 4, Fast Food 4, Flavors 7, Food 11, Fruits 19, Ingredients 10, Meals 14, Meats 4, Nuts 3, Restaurants 17, Restaurants and Establishments 5, Seafood 7, Tableware 11, Vegetables 18 |
| 6. Body and health | 172 | 38 (22%) | Body 10, Body Actions 17, Body Describing 11, Body Functions 16, Body Head 26, Body Lower 11, Body Upper 20, Disease 1, Disorders 1, First Aid Kit 1, Hospitals 15, Hygiene 10, Hygiene Actions 9, Illnesses 4, Injuries 3, Medicine 2, Symptoms 15 |
| 7. Home and people | 182 | 48 (26%) | Bedroom 2, Furniture 1, Home 20, Home Appliances 2, Home Electronics 22, Home Interior 21, Home Tools 7, House Work 8, Household Items 12, Kitchen 10, Negative Emotions 5, People 28, People Feelings 13, People Personality 19, Pets 2, Places to Live 7, Positive Emotions 3 |
| 8. Nature | 129 | 27 (21%) | Amphibians 2, Animals (Australia, Big Cats, Farm, Forest, Grassland, Jungle, Safari) 5 each, Birds 12, Bugs and Insects 15, Environment 25, Flowers 5, Mammals 3, Marine Life 11, Natural Disasters 11, Plants 8, Reptiles 2 |
| 9. Travel and leisure | 214 | 70 (33%) | Aquarium 1, Crossing Borders 12, Crossing Borders Action 6, Currency Exchange 14, Entertainment 22, Exercise 5, Flight 5, Hobbies 29, Hotels 28, Parks 2, Paying a Visit 11, Sporting Event 18, Sports Individual 15, Sports Team 7, Studying a Language 12, Tourism 4, Travel 22, Zoo 1 |
| 10. School and work | 143 | 64 (45%) | Classroom 27, Classroom Actions 20, Classroom Expressions 4, Occupations 33, Office 8, Office Equipment 4, Office Supplies 9, School 16, School Supplies 8, Work Place 14 |
| 11. Life events and religion | 37 | 15 (41%) | Language 2, Life Events 18, Religion 17 |
| 12. Subjects and world | 69 | 7 (10%) | Study Subjects 20, World Bodies of Water 3, World Cities 19, World Continents 7, World Countries 17, World Territories 3 |
| 13. Town and transport | 161 | 46 (29%) | Airplanes 22, Airports 19, Around Town 9, Buildings 16, Post Office 20, Public Transportation 3, Streets 24, Trains 24, Transportation Actions 3, Vehicles 21 |

## How much the PCIC A1–A2 list already covers

**606 of 1,868 rows (32%)**: 379 at A1, 227 at A2. Seen from the other side, the book uses 547 of the PCIC's 1,361 lemmas (40%).

The gap is real but smaller than it looks. Exact matching misses phrases (*parada de autobús*, *carne de res*), reflexive verbs listed with *-se*, and every Common Expressions line, since the PCIC lists words, not sentences. Most of what's left is topic vocabulary beyond A2: animals, body parts, office, airline and train detail.

## Everyday Mexican words the PCIC A1–A2 list lacks

What a newcomer meets in the first weeks, all `in_pcic = no`. Mexican forms marked *(MX)*.

**Food and drink:** *refresco* soda · *chile* chili · *salsa picante* hot sauce · *picante* spicy · *salado* salty · *dulce* sweet · *maíz* corn · *cacahuate (MX)* peanut · *toronja (MX)* grapefruit · *piña* pineapple · *sandía* watermelon · *mango* mango · *limón* lime (the book says lemon; in Mexico it's the green one) · *uva* grape · *carne de res (MX)* beef · *puerco* pork · *mariscos* seafood · *pepino* cucumber · *platillo principal (MX)* main course · *lleno* full · *cuchara* spoon · *tenedor* fork · *cuchillo* knife · *tazón* bowl · *mesero, mesera (MX)* waiter, waitress

**Shops and money:** *costo* cost · *descuento* discount · *recibo* receipt · *bolsa de plástico* plastic bag · *tienda de conveniencia* convenience store (the OXXO) · *pastelería* cake shop · *tarjeta de débito* debit card · *tipo de cambio* exchange rate · *cambiar dinero* change money

**Getting around:** *boleto (MX)* ticket · *taquilla* ticket window · *tarifa* fare · *parada de autobús* bus stop · *banqueta (MX)* sidewalk · *semáforo* traffic light · *glorieta (MX)* roundabout · *vuelta a la derecha / izquierda* right / left turn · *señal de alto (MX)* stop sign · *embotellamiento* traffic jam · *pasajero* passenger · *licencia* driver's licence

**Home:** *rentar (MX)* rent · *comedor* dining room · *estufa (MX)* stove · *horno* oven · *fregadero* kitchen sink · *sartén* frying pan · *olla* pot · *foco (MX)* light bulb · *pila* battery · *enchufe* plug · *encender, apagar* turn on, off · *ventilador* fan · *lámpara* lamp · *espejo* mirror · *cortina* curtain · *papel higiénico* toilet paper · *pasta dental* toothpaste · *barrer* sweep · *trapear (MX)* mop · *rasurar (MX)* shave

**Phone:** *teléfono celular (MX)* mobile phone · *mensaje de texto* text message · *marcar* dial · *ocupado* busy · *wi-fi* · *acceso a internet* internet access

**Clothes:** *playera (MX)* T-shirt · *pantalones de mezclilla (MX)* jeans · *pantalones* trousers · *sudadera* sweatshirt · *cinturón* belt · *impermeable* raincoat

(78 words.) Everyday Mexican words this book also lacks, worth adding by hand: *aguacate, jitomate, frijoles, elote, tortilla, servilleta, popote, la cuenta, panadería, cajero automático, cuadra, recámara, regadera, colonia, celular* (alone), *¿Mande?*

## Spain-flavoured or doubtful entries (flagged, not fixed)

**Spain forms where Mexico says something else:** *ordenador portátil / de escritorio* (MX *computadora / laptop*) · *gafas*, *gafas de sol* (MX *lentes*, *lentes de sol*; the book also has *lentes*) · *teléfono móvil* (MX *celular*) · *bolígrafo* (MX *pluma*) · *bocadillo* "snack" (MX *botana*, *antojito*) · *almuerzo* "lunch" (MX *comida*; *almuerzo* is a late breakfast) · *albaricoque* (MX *chabacano*) · *repollo* (MX *col*) · *brote de judía* (MX *germen de soya*) · *dormitorio* (MX *recámara*) · *apartamento*, *edificio de apartamentos* (MX *departamento*) · *ascensor* (MX *elevador*) · *suelo* "floor" (MX *piso*) · *lavavajillas* (MX *lavatrastes*) · *competición* (MX *competencia*) · *autobús* (fine, but Mexicans say *camión*; the book's *camión* means truck) · *gaseosa* "pop" (MX *refresco*) · *perro caliente* (MX *hot dog*, *jocho*) · *almacén* "department store" (MX *tienda departamental*) · *billete* "bill" is fine in Mexico; *billete de baja denominación* is bookish.

**Wrong or doubtful meaning:** *tarjeta de crédito* = "Currency" · *collarín* = "Collar" (it's a neck brace; collar is *cuello*) · *trapo* = "Cloth" (a rag; fabric is *tela*) · *sudadera* = "Sweat suit" (a sweatshirt) · *sendero* = "Road" (a trail) · *llover duro* = "Shower" (MX *aguacero*, *chubasco*) · *cuerpo* = "Frame" · *conmutar* = "Commute" (calque) · *terrateniente* = "Landlord" (a big landowner; MX *casero*, *dueño*) · *vestidor* = "Dresser" (MX *cómoda*) · *mesa de café* (MX *mesa de centro*) · *descanso para pies*, *comida de platillos*, *superintendente*, *siéntete en casa* (MX *estás en tu casa*) read as translations from English · *hambriento*, *sediento* are correct but Mexicans say *tengo hambre / sed*.

**Typos as printed:** *servivio de lavandería*, *horno de micrroondas*, *telefóno público*, *envíar*, *azucar*, *te negro*, *negociacion*, *atras*, *donde* (as a question), *perdon*, *búo*, *Paris*, *Korea del Sur*, *Singapúr*. The Numbers 101–999 topic has "ninty-nine" in the English.

## For Afuera

Use `mexican-words.csv` as a Mexico supplement to `level-words-es.csv` when scoring whether a beginner can follow a character's line.

- **A word counts as known only once it has a level.** A word that is in this book but not in the PCIC A1–A2 list is not known yet; it's a candidate. Don't count *banqueta* as beginner vocabulary just because a Mexican book lists it.
- **Level by topic first.** Give a whole topic a default: A1 for food and drink, shopping, money, telephone, home, getting around, clothes; A2 for hotels, post office, health, house work; B1 or unleveled for business, nature, world, airline detail. That gets most rows right in one pass.
- **Then a judge call for what's left.** One batch Claude call per topic: "Would a newcomer living in Mexico City meet this word in the first month? A1, A2, or later." Store the result as a new column, never overwriting `pcic_level`. Spot-check a sample before using it, and leave the flagged rows above out until fixed.
- **Prefer the Mexican form.** Where the book and the PCIC disagree (*computadora* vs *ordenador*), a Mexican character's line should be scored against the Mexican form, as the `mx` rows already do.
